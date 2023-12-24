// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// Reference:
// - https://medium.com/@KamalliElmeddin/how-to-create-erc-1155-upgradeable-smart-contracts-18bd933bbc6c
// - Bodhi: https://optimistic.etherscan.io/address/0x2AD82A4E39Bac43A54DdfE6f94980AAf0D1409eF
// - Kangaroo.sol: https://github.com/elmeddinkamalli/erc1155-upgradeable-tutorial/tree/main
// - https://blog.thirdweb.com/guides/how-to-upgrade-smart-contracts-upgradeable-smart-contracts/
// - https://github.com/OpenZeppelin/openzeppelin-foundry-upgrades

contract FlagDAO is Initializable, UUPSUpgradeable, ERC1155Upgradeable, OwnableUpgradeable {
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
        FlagStatus status;    // flag's status : `undone / Done / Rug`
        // address[100] bettors; // up to 100 bettors
    }

    // 每个作品的唯一 ID
    uint256 public flagId; //flagId; [0,1,2..]
    mapping(uint256 => Flag) public flags;

    // 一个用户多个 Flag
    // mapping(address => uint256[]) public userFlags;
    // AweweavetxId => Flag id [0,1,2..]
    mapping(bytes32 => uint256) public txTo;

    mapping(uint256 => uint256) public pool;     // Total pledged amt.
    mapping(uint256 => uint256) public selfpool; // Total pledged amt by flager
    mapping(uint256 => uint256) public betspool; // Total pledged amt by bettors
    mapping(uint256 => mapping(address => uint256)) public gamblepool; // a single bettor's pledgemeny, used for distribution.
    
    uint256 public constant MAX_LEVERAGE = 5;    // Maximum leverage

    enum TradeType {
        Create,  // Create Flag 🚩
        Gamble,  // Gamble i.e. Bet
        Retrieve
    } // = 0, 1, 2

    // 对某个 flag 的质押者(赌徒)
    mapping(uint256 => address[]) public flagBettors;

    function _authorizeUpgrade(address _newImplementation) internal override onlyOwner {}
    function _contractUpgradeTo(address _newImplementation) public {}
    
    function initialize(address initialOwner) initializer public {
        __ERC1155_init("");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    // lock the implementation contract for future reinitializations for safety.
    // Prevent `malicious initialize()` again! 
    constructor() {
        _disableInitializers();
    }

    // function getOwner() view public returns(address) { return owner(); }
    function getNewestFlagId() view public returns(uint256) { return flagId; }
    function getPools(uint256 id) public view returns(uint256[3] memory) {
        return [selfpool[id], betspool[id], pool[id]];
    }
    // function getFlagById(uint256 id) view public returns(Flag memory) { return flags[id]; }

    // function getFlagsByAddress(address addr) public view returns (uint256[] memory) {
    //     return userFlags[addr];
    // }

    
    // function getFlagsByAddress(address addr) public view returns (uint256[] memory) {
    //     return userFlags[addr];
    // }

    function testEventEmit(string calldata arTxId) public {
        emit CreateFlag(2333, msg.sender, 1054, arTxId);
    }

    function createFlag(string calldata arTxId) public payable {
        bytes32 txHash = keccak256(abi.encodePacked(arTxId));

        // require(txTo[txHash] == 0, "Asset already exists");

        uint _amt = msg.value;

        flags[flagId] = Flag(flagId, arTxId, msg.sender, FlagStatus.Undone); // from 0.
        txTo[txHash] = flagId;

        unchecked {  // 记录质押份额
            pool[flagId] += _amt;
            selfpool[flagId] += _amt;
            flagId = flagId + 1;
        }
        // mint `msg.value`  份 1 wei = 1 份
        _mint(msg.sender, flagId-1, _amt, "");
        emit CreateFlag(flagId-1, msg.sender, _amt, arTxId);
    }

    // fucntion selfPledge() public payable {}

    function gamblePledge(uint256 id) public payable {
        require(id < flagId, "Flag does not exist.");

        Flag storage flag = flags[id];
        require(flag.flager != msg.sender, "Flag owner can not gamble lol.");
        require(flag.status == FlagStatus.Undone, "Flag is over.");

        uint256 _amt = msg.value;
        flagBettors[id].push(msg.sender);
        // 记录质押份额
        pool[id] += _amt;
        betspool[id] += _amt;

        _mint(msg.sender, id, _amt, "");
        emit GamblePledge(flagId, msg.sender, _amt, flag.flager);
    }
    
    // Only contract deployer can change .
    function setFlagDone(uint256 id) public onlyOwner {
        require(id < flagId, "Flag does not exist.");
        Flag storage flag = flags[id];
        require(flag.status == FlagStatus.Undone, "Flag has already been changed!.");

        flag.status = FlagStatus.Done;  // set `1`
        
        _resetShares(id);
        emit FlagStatusSet(flag.flager, flag.id, uint8(flag.status));
    }

    function _resetShares(uint256 id) internal {
        Flag memory flag = flags[id];

        // reset share, mint NFT.
        _mint(flag.flager, id, betspool[id], "bonus");
        selfpool[id] = selfpool[id] + betspool[id];

        // reset share, burn NFT.
        for (uint i = 0; i < flagBettors[id].length; i++) {
            address bettor = flagBettors[id][i];
            // uint256 amt = balanceOf[bettor][id]; 
            uint256 amt = balanceOf(bettor, id);
            _burn(bettor, id, amt);
            pool[id] -= amt;
        }

        betspool[id] = 0;
    }

    function flagerRetrive(uint256 id) public {
        require(id < flagId, "Flag does not exist.");
        Flag memory flag = flags[id];
        require(flag.status == FlagStatus.Done, "Flag is not done yet.");
        require(flag.flager == msg.sender, "Only flag owner can refund.");
        require(selfpool[id] > 0, "Already claimed or No selfpool to refund.");

        uint256 refund = selfpool[id];
        selfpool[id] = 0;
        pool[id] = 0;
        betspool[id] = 0;

        // DO NOT BURN NFT as a bonus.

        (bool sent, ) = payable(msg.sender).call{value: refund}("");
        require(sent, "Failed to retrive Ether");
        emit FlagRetrive(flagId, msg.sender, refund);
    }

    // -----------------------------------------------------------------------

    function setFlagRug(uint256 id) public onlyOwner {
        require(id < flagId, "Flag does not exist.");
        Flag storage flag = flags[id];
        require(flag.status == FlagStatus.Undone , "Flag has already been changed!.");

        flag.status = FlagStatus.Rug; // set `2`

        _resetSharesForRug(id);
        emit FlagStatusSet(flag.flager, flag.id, uint8(flag.status));
    }

    function _resetSharesForRug(uint256 id) internal {
        require(id < flagId, "Flag does not exist.");
        Flag memory flag = flags[id];
        require(flag.status == FlagStatus.Rug, "Flag is not Rug yet lol.");

        // rest share, burn NFT.
        _burn(flag.flager, id, selfpool[id]);

        // reset share, burn NFT.
        for (uint i = 0; i < flagBettors[id].length; i++) {
            address bettor = flagBettors[id][i];
            // uint256 amt = balanceOf[bettor][id];
            uint256 amt = balanceOf(bettor, id);
            uint256 shares = selfpool[id] * amt / betspool[id];

            // 针对 $100, bettors = [1, 10000] 的情况
            uint256 realShares = Math.min(
                Math.max(shares, amt),
                MAX_LEVERAGE * amt
            );
            gamblepool[id][bettor] = realShares;
        }
        pool[id] = 0;
        selfpool[id] = 0;
        betspool[id] = 0;
    }

    function gamblersRetrive(uint256 id) public {
        require(id < flagId, "Flag does not exist.");
        Flag memory flag = flags[id];
        require(flag.flager != msg.sender, "Flag owner can not refund.");
        require(flag.status == FlagStatus.Rug, "Flag is not rug yet.");
        require(gamblepool[id][msg.sender] > 0, "No privilege to refund.");

        uint256 _amt = gamblepool[id][msg.sender];

        gamblepool[id][msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: _amt}("");
        require(sent, "Failed to send Ether");
        emit FlagRetrive(flagId, msg.sender, _amt);
    }

    function uri(uint256 id) public view override returns (string memory) {
        return flags[id].arTxId;
    }
}