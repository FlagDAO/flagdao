首先万分感谢审计老师的指导和建议！！！！

- 日期：2023.12.27
- 代码地址: 
  - [FlagDAO.sol](https://github.com/FlagDAO/flagdao/blob/main/contracts/src/FlagDAO.sol)
  - [foundry - FlagDAO.t.sol](https://github.com/FlagDAO/flagdao/blob/main/contracts/test/FlagDAOTest.t.sol)

---

[TOC]

---



## Audit Discussions:

### 1.(High) initialize() 函数无法使用。

>  **已按建议修改**

```solidity
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
```



### 2.(Info) 使用 unchecked{} 方式忽略溢出检查可节省 gas.

> **已按建议修改**



### 3.(Medium) 打赌者(bettor) 可能在非正常情况下永久丢失其赌注资金。

> 已按建议修改

```solidity
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
```





### 4.(Discussion) setFlagDone() 函数和 setFlagRug() 函数逻辑讨论。

>  已按建议修改

```solidity
    // Only contract deployer can change.
    function setFlagDone(uint256 id) public onlyOwner {
        if(id >= flagId) { revert FlagIdNotExist(); }
        Flag storage flag = flags[id];
        if(flag.status != FlagStatus.Undone) { revert FlagIsOver(); }

        flag.status = FlagStatus.Done;  // set `1`
        
        _resetShares(id);
        emit FlagStatusSet(flag.flager, flag.id, uint8(flag.status));
    }

```



### 5.(Info) 移除冗余的判断以节省 gas。

> 已按建议修改



### 6.(Discussion) 攻击者可以通过恶意增加 flagBettors 数组⻓度的方式耗尽 gas，导致函数调用失败。 

修复方式：

1. 将 `bettors` 对赌者转移到了 Flag struct 内
2. 在  `gamblePledge` 下注的时候对其长度进行了 up to 100 的限制
3. 对于同一个 `对赌者` 对赌者，不会重复记录对赌行为，例如：
   1. Bob 第一次对赌：记录其 address 到 address[] bettors ； 记录其对赌金额到 uint256[] bet_vals;)
   2. Bob 第二次对同一个 flag 再次对赌，不会在 bettors 中新增记录，而是利用了 `bettorsMap` 记录其质押的顺序 (idx)，后面再次质押时，根据其质押 idx 增加或者减少其 bet_vals）

```solidity
    struct Flag {
        uint256 id; 
        string arTxId;        // arweave transaction id
        address flager;
        uint256 amt;          // flager pledged amt.
        FlagStatus status;    // flag's status : `undone / Done / Rug`

        address[] bettors;    // up to 100 bettors
        uint256[] bet_vals;   // up to 100 bettors
    }

    // ....

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
```



### 7.(High) flager 可以通过转移其持有NFT token 的方式阻止 owner 调用 setFlagRug() 函数，这些打赌的资金 将会永久保留在合约下。

确实不该使用 NFT 余额来作为分配标准

- 目前的代码中使用如下 4 个变量来表示用户能够取用的余额

```solidity
    struct Flag {
        uint256 amt;          // flager pledged amt.
        
        // ...
        uint256[] bet_vals;   // up to 100 bettors
    }
    mapping(uint256 => uint256) public selfpool; // Total pledged amt by flager
    mapping(uint256 => uint256) public betspool; // Total pledged amt by bettors

```

在 foundry 中测试正常





### 8.(Discussion) FlagDAO 说明文档的示意图中存在错误。

已修改



### 9.(Discussion) 特定情况下，即使 bettor 赢得了赌注也无法获利。

调整了赌注分配的逻辑，首先退回本金，然后按比例均分，均分获得的收益不超过 成本* 最大杠杆率



## 其他修改

- `require`  部分改成了 `custom error` 以节省 gas fee

- 移除了 `mapping(bytes32 => uint256) public txTo;` 字段
- 增加了国库逻辑，和由 owner retrieve 回国库的钱的逻辑
- 移除了 所有 ERC1155 的冗余逻辑