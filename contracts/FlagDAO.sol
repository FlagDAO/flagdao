// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";


library IterableMapping {
    // Iterable mapping from address to uint;
    struct Map {
        address[] keys;
        mapping(address => uint) values;
        mapping(address => uint) indexOf;
        mapping(address => bool) inserted; // 判断地址是否已在 Map 中.
    }
    
    function get(Map storage map, address key) public view returns (uint) {
        return map.values[key];  // 获取 address 的 value
    }

    function getKeyAtIndex(Map storage map, uint index) public view returns (address) {
        return map.keys[index];  // 按索引取 address
    }

    function size(Map storage map) public view returns (uint) {
        return map.keys.length;  // 返回 mapping 中的 key 数量
    }

    // 将地址与整数值关联，如果地址已存在于映射中，则更新对应的整数值；
    // 如果地址不存在，则将其插入到映射中
    function set(Map storage map, address key, uint val) public {
        if (map.inserted[key]) {
            map.values[key] = val;
        } else {
            map.inserted[key] = true;
            map.values[key] = val;
            map.indexOf[key] = map.keys.length;
            map.keys.push(key);
        }
    }

    function remove(Map storage map, address key) public {
        if (!map.inserted[key]) {
            return;
        }

        delete map.inserted[key];
        delete map.values[key];

        uint index = map.indexOf[key];
        address lastKey = map.keys[map.keys.length - 1];

        map.indexOf[lastKey] = index;
        delete map.indexOf[key];

        map.keys[index] = lastKey;
        map.keys.pop();
    }
}




interface IERC20 {
    function transfer(address, uint) external returns (bool);

    function transferFrom(address, address, uint) external returns (bool);
}



contract FlagDAO {
    using IterableMapping for IterableMapping.Map;

    IterableMapping.Map private map;

    event Launch(
        uint indexed id,
        address indexed creator,
        // string goal,
        uint32 startAt,
        uint32 endAt
    );
    event Cancel(uint id);
    event Pledge(uint indexed id, address indexed caller, uint amount);
    event Unpledge(uint indexed id, address indexed caller, uint amount);
    event Claim(uint id, address flager, uint amt);
    event Refund(uint id, address indexed caller, uint amount);

    /* Multi sig Part - START*/
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public numConfirmationsRequired; // 以及执行状态更改所需的确认数量

    // mapping from tx index => owner => bool
    // nested mapping: 表示某个交易是否已经被某个所有者确认
    mapping(uint => mapping(address => bool)) public isConfirmed;


    modifier onlyOwner() {  // 只有 多签的所有者们 可以调用下面的东西.
        require(isOwner[msg.sender], "not owner");
        _;   // openzeppelin `Ownable`合约中的`onlyOwner`修饰符只允许一个地址. 
    }
    /* Multi sig Part - END*/


    struct Flag {
        uint id;
        address flager;    // Creator of the Flag
        string goal;       // flag content
        uint256 self_pledged; // flager's total amount pledged
        uint256 bettors_pledged; // flager's total amount pledged
        uint32 startAt;    // Timestamps.
        uint32 endAt;
        bool flag_status;  // init false, onlu multi-sig can change it.
        bool claimed;      // True if goal was reached and creator has claimed the tokens.
    }

    IERC20 public immutable token;
    // Total count of flags created ,It is also used to generate id for new flag.
    uint public count = 0;

    // bettor[1]['0x22'] =300  : 1 号 flag 中 0x22 地址对他押注了 300 .
    // False: 不用这个，因为不能迭代： mapping(uint => mapping(address => uint)) bettor; // bettor 对赌人，投注方
    // True: 使用可迭代的 mapping, 可以进行 bettor[1] 即 1 号 flag 里的投注人遍历
    mapping(uint => IterableMapping.Map) private bettors;

    // Mapping from id to Campaign
    // flags 和 flags_arr 的用途区别是啥？
    // mapping(uint => Flag) public flags;
    Flag[] public flags;
    
    // Mapping from flag id => pledger => amount pledged
    // 输入 2 个参数获取质押值： ① flag_id.  ② pledger addr.
    // mapping(uint => mapping(address => uint)) public pledgedAmount;  // 暂时弃用

    // ERC-20 Token ;  multi sig addrs ; 
    constructor(address _token, address[] memory _owners, uint _numConfirmationsRequired) {
        token = IERC20(_token);

        /* Multi sig */
        require(_owners.length > 0, "multi owners required");
        require(
            _numConfirmationsRequired > 0 &&
                _numConfirmationsRequired <= _owners.length,
            "invalid number of required confirmations"
        );

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }
        numConfirmationsRequired = _numConfirmationsRequired;  // 举例: 3/5 多签里的 3.
    }

    // Get Owners list. 
    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    // 前端适配 —— 传入 ** amount * 10^18
    function launch(string calldata _goal, uint _init_pledged, uint32 _startAt, uint32 _endAt) public {
        // require(_startAt >= block.timestamp, "start at < now");
        require(_endAt >= _startAt, "end at < start at");
        require(_endAt <= block.timestamp + 90 days, "end at > max duration");


        Flag memory _flag = Flag({
            id: count,
            flager: msg.sender,
            goal: _goal,
            self_pledged: _init_pledged  * 10**18 ,
            bettors_pledged: 0,
            startAt: _startAt,
            endAt: _endAt,
            flag_status: false,
            claimed: false
        });

        token.transferFrom(msg.sender, address(this), _init_pledged * 10**18 );
        // token.transfer(address(this), _init_pledged * 10**18 );  Not correct!!!
        flags.push(_flag);
        emit Launch(count, msg.sender, _startAt, _endAt);
        count += 1;
    }

    function cancel(uint _id) external {
        Flag memory flag = flags[_id];    // memory: flag 这个变量暂时存在内存，无需上链。
        require(flag.flager == msg.sender, "not flager!");
        // require(block.timestamp < flag.startAt, "started");

        // [TODO] delete  flags_arr[id];
        delete flags[_id];
        emit Cancel(_id);
    }


    function pledge(uint _id, uint _amt) external {
        uint256 _amount = _amt * 10**18;
        Flag storage flag = flags[_id];   // storage: 存储在链上
        // require(block.timestamp >= flag.startAt, "not started");
        // require(block.timestamp <= flag.endAt, "ended");

        // flager 自己追加投注
        if(msg.sender == flag.flager){
            flag.self_pledged += _amount;
            token.transferFrom(msg.sender, address(this), _amount);
            // token.transfer(address(this), _amount);  Not correct!!!
        } else {  // bettor 投注
            flag.bettors_pledged += _amount;
            bettors[_id].set(msg.sender, _amount);
            token.transferFrom(msg.sender, address(this), _amount);
            // token.transfer(address(this), _amount);   Not correct!!!
        }
        emit Pledge(_id, msg.sender, _amount);
    }

    // 取回部分投注
    function unpledge(uint _id, uint _amt) external {
        uint256 _amount = _amt * 10**18;
        Flag memory flag = flags[_id];
        require(block.timestamp <= flag.endAt, "ended");

        if(msg.sender == flag.flager){
            flag.self_pledged -= _amount;
            // pledgedAmount[_id][msg.sender] -= _amount;
            token.transfer(msg.sender, _amount);
        } else {
            uint256 cur = bettors[_id].get(msg.sender);
            require(_amount <= cur, "Error amount!");
            cur -= _amount;
            // pledgedAmount[_id][msg.sender] -= _amount;
            flag.bettors_pledged -= _amount;
            bettors[_id].set(msg.sender, cur);
            token.transfer(msg.sender, _amount);
        }

        emit Unpledge(_id, msg.sender, _amount);
    }

    /*
    // 只取回自己的 self_pledged 部分资金
    function claim(uint _id) external {
        Flag storage flag = flags[_id];
        require(flag.flager == msg.sender, "not flager!!");
        require(block.timestamp > flag.endAt, "not ended");
        require(flag.flag_status == true, "flag NOT COMPLETE HAHAHAHA....");
        // require(campaign.pledged >= campaign.goal, "pledged < goal");
        require(!flag.claimed, "claimed");

        flag.claimed = true;
        token.transfer(flag.flager, flag.self_pledged);

        emit Claim(_id);
    } */

    /*
    function refund(uint _id) external {
        Flag memory flag = flags[_id];
        require(block.timestamp > flag.endAt, "not ended");
        // require(campaign.pledged < campaign.goal, "pledged >= goal");

        uint bal = pledgedAmount[_id][msg.sender];
        pledgedAmount[_id][msg.sender] = 0;
        token.transfer(msg.sender, bal);

        emit Refund(_id, msg.sender, bal);
    } */


    // Flag done, 将 bettors 中所有的质押 Token 全都转给 flager.  自己质押的 Token 也 retrieve
    function redeemTokensForFlager(uint _id) public  {
        Flag memory flag = flags[_id];
        require(flag.flager == msg.sender, "only flager can retrive it!");
        require(!flag.claimed, "Already claimed!");
        require(flag.flag_status, "Flag must be failed to distribute pledges");
        require(block.timestamp > flag.endAt, "flag duration not ended");

        uint betValue = 0;

        for(uint i = 0; i < bettors[_id].size(); i++) {
            address key = bettors[_id].getKeyAtIndex(i);
            betValue += bettors[_id].get(key);
        }

        token.transfer(flag.flager, flag.self_pledged);
        token.transfer(flag.flager, betValue);

        flag.claimed = true;
        emit Claim(_id, flag.flager, betValue + flag.self_pledged);
    }

    // Flag Failed, bettors 瓜分质押 Tokens .
    function redeemTokensForBettors(uint _id) public  {
        Flag memory flag = flags[_id];
        require(!flag.claimed, "Already claimed!");
        require(!flag.flag_status, "Flag must be failed to distribute pledges");
        require(block.timestamp > flag.endAt, "flag duration not ended");

        // IterableMapping.Map storage betsmap = bettors[_id];
        uint totalPledge = 0;
        uint betValue = 0;

        // calculate totalPledge.
        for (uint i = 0; i < bettors[_id].size(); i++) {
            address bettor = bettors[_id].getKeyAtIndex(i);
            betValue = bettors[_id].get(bettor);
            totalPledge += betValue;
        }

        // distribute the flager's self_pledged
        betValue = bettors[_id].get(msg.sender);
        require(betValue > 0, "You didn't pledge it or already claimed your part.");

        uint share = (betValue / totalPledge) * flag.self_pledged ;

        token.transfer(msg.sender, betValue); // 取回质押的本金
        token.transfer(msg.sender, share);    // 瓜分赏金

        bettors[_id].set(msg.sender, 0);
        // flag.claimed = true;
        emit Claim(_id, msg.sender, share + betValue);
    }

    // 多签评估 flag 是否完成：_succ_id_arr 中是所有 flag_status == true 的 id
    //   1. 对于 flag_status == true 的 id，将 bettor 中所有的质押 Token 全都转给 flager.
    //   2. 若 flag_status == false, 将 flager 的 Token 被按质押比例分配给 非 flager 的 bettors.
    function updateFlagStatus( // onlyOwner: 允许 owner 提交一笔交易
        // uint _id, bool res
        uint[] memory _succ_id_arr, bool res
    ) onlyOwner external {
        // 对于 flag_status == true 的 id，将 bettor 中所有的质押 Token 全都转给 flager.
        for (uint _id = 0; _id <= _succ_id_arr.length; _id++) {
            Flag storage flag = flags[_id];
            require(block.timestamp <= flag.endAt, "ended");
            flag.flag_status = res;   // only owners can call the func & change it.
            // [TODO] Transfer ..
            // uint sum = 0;
            redeemTokensForFlager(_id);
        }
 
        // flag_status == false, flager 的 Token 被按质押比例分配给 非 flager 的 bettors.
        for (uint i = 1; i <= count; i++) {
            Flag memory flag = flags[i];
            if (!flag.flag_status ){ // undone Flag..
                redeemTokensForBettors(i);
            }        
        }
    }

    // 分页获取 flags 数组
    function getFlags(uint startIndex, uint endIndex) public view returns (Flag[] memory) {
        require(startIndex < endIndex, "startIndex > endIndex.");
        require(endIndex <= flags.length, "No flags now.");
        
        Flag[] memory flagSlice = new Flag[](endIndex - startIndex);
        
        for (uint i = startIndex; i < endIndex; i++) {
            flagSlice[i - startIndex] = flags[i];
        }
        
        return flagSlice;
    }

    function getAllFlags() public view returns (Flag[] memory) {
        require(flags.length > 0, "No flags now.");
        // Flag[] memory flagSlice  = new Flag[](flags_arr.length);        
        // for (uint i = 0; i < flags_arr.length; i++) {
        //     flagSlice[i] = flags_arr[i];
        // }
        // return flagSlice;
        return flags;
    }

    function getBettor(uint _id, address addr) public view returns (uint) {
        return bettors[_id].get(addr);
    }

    function getTotalBet(uint _id) public view returns (uint) {
        uint totalPledge = 0;
        uint betValue = 0;

        // calculate totalPledge.
        for (uint i = 0; i < bettors[_id].size(); i++) {
            address bettor = bettors[_id].getKeyAtIndex(i);
            betValue = bettors[_id].get(bettor);
            totalPledge += betValue;
        }
        return totalPledge;
    }

    function getBettors(uint _id) public view returns (address[] memory) {
        address[] memory addr_lis = new address[](bettors[_id].size());

        // calculate totalPledge.
        for (uint i = 0; i < bettors[_id].size(); i++) {
            address bettor = bettors[_id].getKeyAtIndex(i);
            addr_lis[i] = bettor;
        }
        return addr_lis;
    }
    
    function getBettorsPledgement(uint _id) public view returns (uint[] memory) {
        uint[] memory value_lis = new uint[](bettors[_id].size());

        // calculate totalPledge.
        for (uint i = 0; i < bettors[_id].size(); i++) {
            address bettor = bettors[_id].getKeyAtIndex(i);
            uint val = bettors[_id].get(bettor);
            value_lis[i] = val;
        }

        return value_lis;
    }
}
