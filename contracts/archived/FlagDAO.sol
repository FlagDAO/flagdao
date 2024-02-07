// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IterableMapping.sol";
import "./IERC20.sol";

contract FlagDAO {
    using IterableMapping for IterableMapping.Map;

    IterableMapping.Map private map;

    event Launch(
        uint indexed id,
        address indexed creator
        // string goal,
        // uint32 startAt,
        // uint32 endAt
    );

    event Cancel(uint id);
    event Pledge(uint indexed id, address indexed caller, uint amount);
    event Unpledge(uint indexed id, address indexed caller, uint amount);
    event Claim_For_bettors(uint id, address caller, address bettor, uint share, uint betValue, uint maxReward, uint totalPledge);
    event Claim_For_Flager(uint _id, address caller, uint value);
    // event Refund(uint id, address indexed caller, uint amount);

    uint8 public decimals = 18;

    /* Multi sig Part - START*/
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public numConfirmationsRequired; // 以及执行状态更改所需的确认数量

    // mapping from tx index => owner => bool
    // nested mapping: 表示某个交易是否已经被某个所有者确认
    mapping(uint => mapping(address => bool)) public isConfirmed;

    uint256 constant MAX_LEVERAGE = 20;
    // uint256 constant DECIMAL_MULTIPLIER = 10**18;

    modifier onlyOwner() {  // 只有 多签的所有者们 可以调用下面的东西.
        require(isOwner[msg.sender], "not owner");
        _;   // openzeppelin `Ownable`合约中的`onlyOwner`修饰符只允许一个地址. 
    }
    /* Multi sig Part - END*/

    struct Flag {
        uint id;
        address flager;          // Creator of the Flag
        string goal;             // flag content(string)
        uint256 self_pledged;    // flager's total amount pledged
        uint256 bettors_pledged; // bettotrs's total amount pledged
        // uint32 startAt;          // Timestamps.
        // uint32 endAt;
        bool flag_status;  // init false, onlu multi-sig can change it.
        bool claimed;      // True if goal was reached and creator has claimed the tokens.
    }

    IERC20 public immutable token;
    // Total count of flags created ,It is also used to generate id for new flag.
    uint public count = 0;

    // Usage: bettors[1]['0x22'] = 300  : 1 号 flag 中 0x22 地址对他押注了 300 .
    // False: unused, cause it can't iterate:  mapping(uint => mapping(address => uint)) bettor;
    // True: use IterableMapping, 可以进行 bettor[1] 即 1 号 flag 里的投注人遍历
    mapping(uint => IterableMapping.Map) private bettors;

    // Mapping from id to Campaign
    // mapping(uint => Flag) private flags
    Flag[] public flags;
    
    // Mapping from flag id => pledger => amount pledged
    // 2 params to retrieve ① flag_id.  ② pledger addr.
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

    // 前端适配 —— 传入 amount * 10^18
    // uint32 _startAt, uint32 _endAt
    function launch(string calldata _goal, uint _init_pledged) public {
        // require(_startAt >= block.timestamp, "start at < now");
        // require(_endAt >= _startAt, "end at < start at");
        // require(_endAt <= block.timestamp + 90 days, "end at > max duration");

        Flag memory _flag = Flag({
            id: count,
            flager: msg.sender,
            goal: _goal,
            self_pledged: _init_pledged * (10 ** uint256(decimals)),
            bettors_pledged: 0,
            // startAt: _startAt,
            // endAt: _endAt,
            flag_status: false,
            claimed: false
        });

        token.transferFrom(msg.sender, address(this), _init_pledged * (10 ** uint256(decimals)));
        // token.transfer(address(this), _init_pledged );  Not correct!!!
        flags.push(_flag);
        // emit Launch(count, msg.sender, _startAt, _endAt);
        emit Launch(count, msg.sender);
        count += 1;
    }

    function flager_cancel(uint _id) external {
        // memory: `flag` temporarily in memory instead of on-chain.
        Flag storage flag = flags[_id];    
        require(flag.flager == msg.sender, "Not flager itself!");
        // require(block.timestamp < flag.startAt, "started");
        
        token.transfer(msg.sender, flag.self_pledged);
        delete flags[_id];
        emit Cancel(_id);
    }

    // function clearAllFlags() external onlyOwner {
    //     // Loop through all flags and refund tokens
    //     for (uint i = 0; i < flags.length; i++) {
    //         Flag storage flag = flags[i];

    //         // Refund self_pledged amount to the flager
    //         if(flag.self_pledged > 0){
    //             token.transfer(flag.flager, flag.self_pledged);
    //         }

    //         // Refund bettors
    //         if(flag.bettors_pledged > 0){
    //             for(uint j = 0; j < bettors[flag.id].keys.length; j++) {
    //                 address bettor = bettors[flag.id].keys[j];
    //                 uint amount = bettors[flag.id].values[j];
    //                 if(amount > 0){
    //                     token.transfer(bettor, amount);
    //                 }
    //             }
    //         }
    //     }
    //     // Delete all flags
    //     delete flags;
    // }


    function pledge(uint _id, uint _amt) external {
        // uint256 _amount = _amt;
        uint256 _amount = _amt * (10 ** uint256(decimals));  // no need...?
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
        uint256 _amount = _amt * (10 ** uint256(decimals));
        Flag storage flag = flags[_id];
        // require(block.timestamp <= flag.endAt, "ended");

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

    // only Mukti-sig  can change the status of flag : 
    // [params] _succ_id_arr 中是所有 flag_status == true 的 id
    //   1. 对于 flag_status == true 的 id，将 bettor 中所有的质押 Token 全都转给 flager.
    //   2. 若 flag_status == false, 将 flager 的 Token 被按质押比例分配给 非 flager 的 bettors.
    // [TODO] only multi-sig can change it.
    function updateFlagStatus(
        uint[] memory _flag_arr, bool res
    ) onlyOwner external {
        // 对于 flag_status == true 的 id，将 bettor 中所有的质押 Token 全都转给 flager.
        if (res == true){
            for (uint _id = 0; _id < _flag_arr.length; _id++) {
                uint flag_id = _flag_arr[_id];
                Flag storage flag = flags[flag_id];
                // require(block.timestamp <= flag.endAt, "ended");
                flag.flag_status = res;   // only owners can call the func & change it.

                redeemTokensForFlager(flag_id);
            }
        }
        else  { // undone Flag..
            // flag_status == false, flager 的 Token 被按质押比例分配给 非 flager 的 bettors.
            for (uint _id = 0; _id < _flag_arr.length; _id++) {
                uint flag_id = _flag_arr[_id];

                redeemTokensForBettors(flag_id);
            }
        }
    }

        // Flag done, 将 bettors 中所有的质押 Token 全都转给 flager.  自己质押的 Token 也 retrieve
        // [param] _id: Flag id.
        function redeemTokensForFlager(uint _id) internal  {
            Flag storage flag = flags[_id];
            // require(flag.flager == msg.sender, "only flager can retrive it!");
            require(flag.flag_status, "As flager, the flag must be done to claim.");
            require(!flag.claimed, "Already claimed, the flag's status can't be changed again.");
            // require(block.timestamp > flag.endAt, "flag duration not ended");

            uint betValue = 0;

            for(uint i = 0; i < bettors[_id].size(); i++) {
                address key = bettors[_id].getKeyAtIndex(i);
                betValue += bettors[_id].get(key);
            }

            token.transfer(flag.flager, flag.self_pledged + betValue);

            flag.claimed = true;

            emit Claim_For_Flager(_id, flag.flager, betValue + flag.self_pledged);
        }

        // Flag Failed, bettors 瓜分质押 Tokens .
        // [TODO] how to prevent double-claim (重复赎回) ?
        function calBettorsrTotal (uint256 _id) internal view  returns (uint256) {
            uint totalPledge = 0;
            uint betValue = 0;
            for (uint i = 0; i < bettors[_id].size(); i++) {
                address bettor = bettors[_id].getKeyAtIndex(i);
                betValue = bettors[_id].get(bettor);
                totalPledge += betValue;
            }
            return totalPledge;
        }

        function redeemTokensForBettors(uint _id) internal  {

            Flag storage flag = flags[_id];

            require(!flag.claimed, "Already claimed!");
            require(!flag.flag_status, "Flag must be 'failed' to distribute pledges");
            // require(block.timestamp > flag.endAt, "flag duration not ended");
            // require(bettors[_id].size() > 0, "No bettors for the flag!");   No need!!

            // If there is no bettors(counterparty), the pledge amount of flager will enter the DAO treasury.
            if(bettors[_id].size() == 0) {
                flag.claimed = true;
                return ;
            }

            // calculate bettors' totalPledge.
            // e.g. bettor A bets $2, bettor B bets $10, then  totalPledge = $12
            uint betValue = 0;
            uint totalPledge = calBettorsrTotal(_id);

            /*  // distribute the flager's self_pledged
            betValue = bettors[_id].get(msg.sender);
            require(betValue > 0, "You didn't pledge it or already claimed your part.");  */
            for (uint i = 0; i < bettors[_id].size(); i++) {
                address bettor = bettors[_id].getKeyAtIndex(i);
                betValue = bettors[_id].get(bettor);
                uint maxReward = betValue * MAX_LEVERAGE; // 2 * 20 = 40
                
                // bettor A : 2/12 * 100
                // bettor B : 10/12 * 100
                // Solidity 向下取整，所以先算除法会导致 = 0
                uint share = flag.self_pledged * betValue / totalPledge;
                
                // Maximum leverage 
                maxReward = share > maxReward ? maxReward : share;

                // 瓜分 flager 赏金
                token.transfer(bettor, maxReward); 

                // bettors[_id].set(bettor, 0);
                emit Claim_For_bettors(_id, msg.sender, bettor, share, betValue, maxReward, totalPledge);
            }
            flag.claimed = true;
        }

        /* ******************
        ***  get helpers ****
        ********************* */

        // 分页获取 flags 数组:
        // 0,2  will return the flags[0] and flags[1].
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

        // function getTotalBet(uint _id) public view returns (uint) {
        //     uint totalPledge = 0;
        //     uint betValue = 0;

        //     // calculate totalPledge.
        //     for (uint i = 0; i < bettors[_id].size(); i++) {
        //         address bettor = bettors[_id].getKeyAtIndex(i);
        //         betValue = bettors[_id].get(bettor);
        //         totalPledge += betValue;
        //     }
        //     return totalPledge;
        // }

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
