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
    event Create(uint256 indexed flagId, address indexed sender, string arTxId);
    event Remove(uint256 indexed flagId, address indexed sender);
    event Trade(TradeType indexed tradeType, uint256 indexed flagId, address indexed sender, uint256 tokenAmount);
    event FlagStatusUpdate(address indexed flager, uint256 indexed flagId, uint8 indexed status);

    // FLAG
    struct Flag {
        uint256 id;    // 
        string arTxId; // arweave transaction id
        address flager;
    }

    // 每个作品的唯一 ID
    uint256 public flagId; //flagId; [0,1,2..]
    mapping(uint256 => Flag) public flags;
    mapping(uint256 => address[]) public flagBettors;
    mapping(uint256 => uint8) public flagStatus;

    // 一个用户多个 Flag
    // mapping(address => uint256[]) public userFlags;
    // Aweweave txId(去中心化存储里的) => 对应的 Flag id [0,1,2..]
    mapping(bytes32 => uint256) public txTo;

    mapping(uint256 => uint256) public pool; // 总质押金额
    mapping(uint256 => uint256) public selfpool; // 自己质押的金额
    mapping(uint256 => uint256) public betspool; // bettors 质押的金额
    mapping(uint256 => mapping(address => uint256)) public gamblepool; // bettors 质押的金额
    
    uint256 public constant MAX_LEVERAGE = 5;          // 最大杠杆率

    enum FlagStatus {
        Undone,  
        Done,
        Rug
    } // 0 = 未完成(初始状态), 1=Done, 2 = Rug

    enum TradeType {
        Create,  // Create Flag 🚩
        Gamble,  // Gamble 对赌
        Retrieve
    } // = 0, 1, 2

    function _authorizeUpgrade(address _newImplementation) internal override onlyOwner {}
    function _contractUpgradeTo(address _newImplementation) public {}
    
    function initialize(address initialOwner) initializer public {
        __ERC1155_init("");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        _disableInitializers();
    }

    // lock the implementation contract for future reinitializations for safety.
    // constructor() {
    //     _disableInitializers();
    // }

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

    function create(string calldata arTxId) public payable {
        bytes32 txHash = keccak256(abi.encodePacked(arTxId));
        require(txTo[txHash] == 0, "Asset already exists");

        flags[flagId] = Flag(flagId, arTxId, msg.sender); // from 0.
        flagStatus[flagId] = uint8(FlagStatus.Undone); // mark Undone
        // userFlags[msg.sender].push(flagId);
        txTo[txHash] = flagId;

        // 记录质押份额
        pool[flagId] += msg.value;
        selfpool[flagId] += msg.value;

        flagId = flagId + 1;

        // mint `msg.value`  份 1 wei = 1 份
        _mint(msg.sender, flagId-1, msg.value);
        emit Create(flagId - 1, msg.sender, arTxId);
        emit Trade(TradeType.Create, flagId -1, msg.sender, msg.value);
    }

    // fucntion selfPledge() public payable {}

    function gamblePledge(uint256 id) public payable {
        require(id < flagId, "Flag does not exist.");
        Flag memory flag = flags[id];
        require(flag.flager != msg.sender, "Flag owner can not gamble lol.");
        
        flagBettors[id].push(msg.sender);
        // 记录质押份额
        pool[id] += msg.value;
        betspool[id] += msg.value;

        _mint(msg.sender, id, msg.value, "");
        emit Trade(TradeType.Gamble, flagId, msg.sender, msg.value);
    }
    


    // Only contract deployer can change .
    function setFlagDone(uint256 id) public onlyOwner {
        require(id < flagId, "Flag does not exist.");
        Flag memory flag = flags[id];
        require(flagStatus[id] == 0, "Flag has already been changed!.");

        flagStatus[id] = uint8(FlagStatus.Done);  // set `1`

        emit FlagStatusUpdate(flag.flager, flag.id, flagStatus[id]);
        _resetShares(id);
    }

    function _resetShares(uint256 id) internal {
        require(id < flagId, "Flag does not exist.");
        require(flagStatus[id] == uint8(FlagStatus.Done), "Flag is not done yet.");

        // rest share, mint NFT.
        Flag memory flag = flags[id];
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
        require(flagStatus[id] == uint8(FlagStatus.Done), "Flag is not done yet.");
        Flag memory flag = flags[id];
        require(flag.flager == msg.sender, "Only flag owner can refund.");
        require(selfpool[id] > 0, "Already claimed or No selfpool to refund.");

        uint256 refund = selfpool[id];
        selfpool[id] = 0;
        pool[id] = 0;
        betspool[id] = 0;
        // DO NOT BURN NFT as a bonus.
        (bool sent, ) = payable(msg.sender).call{value: refund}("");
        require(sent, "Failed to retrive Ether");
    }

    // -----------------------------------------------------------------------

    function setFlagRug(uint256 id) public onlyOwner {
        require(id < flagId, "Flag does not exist.");
        Flag memory flag = flags[id];
        require(flagStatus[id] == 0, "Flag has already been changed!.");

        flagStatus[id] = uint8(FlagStatus.Rug); // set `2`
        emit FlagStatusUpdate(flag.flager, flag.id, uint8(FlagStatus.Rug));

        _resetSharesForRug(id);
    }

    function _resetSharesForRug(uint256 id) internal {
        require(id < flagId, "Flag does not exist.");
        require(flagStatus[id] == uint8(FlagStatus.Rug), "Flag is not Rug yet lol.");

        // rest share, burn NFT.
        Flag memory flag = flags[id];
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
        require(flagStatus[id] == uint8(FlagStatus.Rug), "Flag is not rug yet.");
        require(gamblepool[id][msg.sender] > 0, "No privilege to refund.");

        uint256 amount = gamblepool[id][msg.sender];

        gamblepool[id][msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    function uri(uint256 id) public view override returns (string memory) {
        return flags[id].arTxId;
    }
}