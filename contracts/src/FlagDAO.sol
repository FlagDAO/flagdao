// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

// import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract UUPSProxy is ERC1967Proxy {
    constructor(address _implementation, bytes memory _data)
        ERC1967Proxy(_implementation, _data)
    {}
}

// import "@openzeppelin/contracts/access/Ownable.sol";

// Reference:
// - https://github.com/jordaniza/OZ-Upgradeable-Foundry
// - https://medium.com/@KamalliElmeddin/how-to-create-erc-1155-upgradeable-smart-contracts-18bd933bbc6c
// - Bodhi: https://optimistic.etherscan.io/address/0x2AD82A4E39Bac43A54DdfE6f94980AAf0D1409eF
// - Kangaroo.sol: https://github.com/elmeddinkamalli/erc1155-upgradeable-tutorial/tree/main
// - https://blog.thirdweb.com/guides/how-to-upgrade-smart-contracts-upgradeable-smart-contracts/
// - https://github.com/OpenZeppelin/openzeppelin-foundry-upgrades

contract FlagDAO is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    event CreateFlag(uint256 indexed flagId, address indexed sender, uint256 indexed amt, string arTxId);
    event GamblePledge(uint256 indexed flagId, address indexed sender, uint256 indexed amt, address flager);
    // event RemoveFlag(uint256 indexed flagId, address indexed sender);
    event FlagStatusSet(address indexed flager, uint256 indexed flagId, uint8 indexed status);
    event FlagRetrive(uint256 indexed flagId, address indexed flager, uint256 indexed amt);
    
    enum FlagStatus {
        Undone,  
        Done,
        Rug
    } // 0 = 未完成(初始状态), 1=Done, 2 = Rug

    struct Flag {
        uint256 id; 
        string arTxId;        // arweave transaction id
        address flager;
        uint256 amt;          // flager pledged amt.
        FlagStatus status;    // flag's status : `undone / Done / Rug`

        address[] bettors;    // up to 100 bettors
        uint256[] bet_vals;   // up to 100 bettors
    }
    
    // mapping records whether a user has pledged before 
    mapping(uint256 => mapping(address => uint256)) public bettorsMap; // flagId => (address => amt

    // used for distribution.
    mapping(uint256 => mapping(address => uint256)) public bettorShares;

    // 每个作品的唯一 ID
    uint256 public flagId;   // flagId; [0,1,2..]
    mapping(uint256 => Flag) public flags;

    // AweweavetxId => Flag id [0,1,2..]
    // mapping(bytes32 => uint256) public txTo;

    mapping(uint256 => uint256) public selfpool; // Total pledged amt by flager
    mapping(uint256 => uint256) public betspool; // Total pledged amt by bettors
    
    uint256 public funds;    // treasury funds 
    uint256 public constant MAX_LEVERAGE = 5;    // Maximum leverage

    enum TradeType {
        Create,  // Create Flag 🚩
        Gamble,  // Gamble i.e. Bet
        Retrieve
    } // = 0, 1, 2

    // 对某个 flag 的质押者(赌徒)
    // mapping(uint256 => address[]) public flagBettors;

    function _authorizeUpgrade(address _newImplementation) internal override onlyOwner {}
    function _contractUpgradeTo(address _newImplementation) public {}
    
    function initialize(address initialOwner) initializer public {
        // __ERC1155_init("");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    // lock the implementation contract for future reinitializations for safety.
    // Prevent `malicious initialize()` again! 
    constructor() {
        _disableInitializers();
    }

    error NoPledgement();
    error FlagIdNotExist();
    error FlagOwnerCannotGamble();
    error FlagIsOver();
    error BettorsUpToLimit();
    error FlagStatusErr();
    error NoPrivilege();
    error NoPoolToRefund();

    // function getOwner() view public returns(address) { return owner(); }
    function getNewestFlagId() view public returns(uint256) { return flagId; }
    function getFunds() view public returns(uint256) { return funds; }
    function getPools(uint256 id) public view returns(uint256[2] memory) {
        return [selfpool[id], betspool[id]];
    }
    function getBettorShares(uint256 _id, address _addr) public view returns(uint256) {
        return bettorShares[_id][_addr];
    }
    // function getFlagById(uint256 id) view public returns(Flag memory) { return flags[id]; }

    // function getFlagsByAddress(address addr) public view returns (uint256[] memory) {
    //     return userFlags[addr];
    // }

    
    // function getFlagsByAddress(address addr) public view returns (uint256[] memory) {
    //     return userFlags[addr];
    // }

    function createFlag(string calldata arTxId) public payable {
        // bytes32 txHash = keccak256(abi.encodePacked(arTxId));

        if(msg.value == 0){ revert NoPledgement();}
        // require(txTo[txHash] == 0, "Asset already exists");

        uint _amt = msg.value;

        flags[flagId] = Flag(
            flagId,
            arTxId, 
            msg.sender,
            _amt,
            FlagStatus.Undone, 
            new address[](0), 
            new uint256[](0)
        ); // from 0.

        // txTo[txHash] = flagId;

        unchecked {
            selfpool[flagId] += _amt;
            flagId = flagId + 1;
        }

        emit CreateFlag(flagId-1, msg.sender, _amt, arTxId);
    }

    // fucntion selfPledge() public payable {}

    function gamblePledge(uint256 id) public payable {
        if(id >= flagId) { revert FlagIdNotExist(); }
        if(msg.value == 0) { revert NoPledgement(); }

        Flag storage flag = flags[id];
    
        if(flag.flager == msg.sender) { revert FlagOwnerCannotGamble(); }
        if(flag.status != FlagStatus.Undone) { revert FlagIsOver(); }
        if(flag.bettors.length >= 100) { revert BettorsUpToLimit(); }

        uint256 _amt = msg.value;

        if(bettorsMap[id][msg.sender] != 0) {   // pledged before.
            uint256 _oldAmt = bettorsMap[id][msg.sender];
            bettorsMap[id][msg.sender] = _oldAmt + _amt;
            flag.bet_vals[id] = _oldAmt + _amt;
        } else {                                // haven't pledged before.
            flag.bettors.push(msg.sender);
            flag.bet_vals.push(_amt);
            bettorsMap[id][msg.sender] = _amt;
        }

        // 记录质押份额
        betspool[id] += _amt;

        emit GamblePledge(flagId, msg.sender, _amt, flag.flager);
    }
    
    // Only contract deployer can change.
    function setFlagDone(uint256 id) public onlyOwner {
        if(id >= flagId) { revert FlagIdNotExist(); }
        Flag storage flag = flags[id];
        if(flag.status != FlagStatus.Undone) { revert FlagIsOver(); }

        flag.status = FlagStatus.Done;  // set `1`
        
        _resetShares(id);
        emit FlagStatusSet(flag.flager, flag.id, uint8(flag.status));
    }

    function _resetShares(uint256 id) internal {
        Flag memory flag = flags[id];

        // reset share.
        uint256 _total_share = 0;
        for (uint i = 0; i < flag.bettors.length; i++) {
            _total_share = _total_share + flag.bet_vals[i];
        }
        
        uint256 share = flag.amt + Math.min(
            MAX_LEVERAGE * flag.amt,
            _total_share
        );

        // 计算转移到国库里的钱
        funds = funds + (selfpool[id] + betspool[id]) - share;
        selfpool[id] = share;
        betspool[id] = 0;
    }

    function flagerRetrive(uint256 id) public {
        if(id >= flagId) { revert FlagIdNotExist(); }

        Flag memory flag = flags[id];

        if(flag.status != FlagStatus.Done) { revert FlagStatusErr(); }
        if(msg.sender != flag.flager) { revert NoPrivilege(); }
        if(selfpool[id] == 0) { revert NoPoolToRefund(); }

        uint256 refund = selfpool[id];
        selfpool[id] = 0;

        (bool sent, ) = payable(msg.sender).call{value: refund}("");
        require(sent, "Failed to retrive Ether");
        emit FlagRetrive(flagId, msg.sender, refund);
    }

    // -----------------------------------------------------------------------

    function setFlagRug(uint256 id) public onlyOwner {
        if(id >= flagId) { revert FlagIdNotExist(); }
        Flag storage flag = flags[id];
        if(flag.status != FlagStatus.Undone) { revert FlagStatusErr(); }

        flag.status = FlagStatus.Rug; // set `2`

        _resetSharesForRug(id);
        emit FlagStatusSet(flag.flager, flag.id, uint8(flag.status));
    }

    function _resetSharesForRug(uint256 id) internal {
        if(id >= flagId) { revert FlagIdNotExist(); }
        Flag memory flag = flags[id];

        // rest share, burn NFT.
        // _burn(flag.flager, id, selfpool[id]);

        uint256 _delta = 0;
        // reset share, burn NFT.
        for (uint i = 0; i < flag.bettors.length; i++) {
            address bettor = flag.bettors[i];
            // uint256 amt = balanceOf[bettor][id];
            uint256 amt = flag.bet_vals[i];
            uint256 shares = amt * selfpool[id] / betspool[id];

            uint256 realShares = amt + Math.min(
                shares,
                MAX_LEVERAGE * amt
            );
            bettorShares[id][bettor] = realShares;
            _delta = _delta + realShares;
        }
        funds = funds + (selfpool[id] + betspool[id]) - _delta;
        selfpool[id] = 0;
        betspool[id] = 0;
    }

    function gamblersRetrive(uint256 id) public {
        if(id >= flagId) { revert FlagIdNotExist(); }
        if(bettorShares[id][msg.sender] == 0) { revert NoPrivilege(); }

        Flag memory flag = flags[id];
        if(flag.status != FlagStatus.Rug) { revert FlagStatusErr();}

        uint256 _amt = bettorShares[id][msg.sender];

        bettorShares[id][msg.sender] = 0;
        

        (bool sent, ) = payable(msg.sender).call{value: _amt}("");
        require(sent, "Failed to send Ether");
        emit FlagRetrive(flagId, msg.sender, _amt);
    }

    // function uri(uint256 id) public view override returns (string memory) {
    //     return flags[id].arTxId;
    // }

    function testEventEmit(string calldata arTxId) public {
        emit CreateFlag(2333, msg.sender, 1054, arTxId);
    }
    function retrieveTreasuryFunds() onlyOwner public {
        (bool sent, ) = payable(msg.sender).call{value: funds}("");
        require(sent, "Failed to send Ether");
    }
}