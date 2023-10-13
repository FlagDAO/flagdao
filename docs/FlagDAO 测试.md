**先别管样式问题，先完成 Roadmap 里的核心功能**

需求优先级：

- [x] 前端调用合约的 BUG  - 10.13
- [ ] create flag 加一个 × 关闭
- [ ] 前端授权 token，再 claim flag
- [ ] 加一个 claim token 按钮？



记得 check 以下 supabase 的后端可用性，它每周 inactive 会 drop table Content



### Roadmap

- [x] 5.30 合约基础模块、前端基础模块   15H
- [x] 5.31 切换 Webpack 到 Vite，完成 Rainbow、Wagmi 版本更新重写 4H
- [x] 6.3 Create Flag Modal       1H
- [x] 6.6 合约 update:    
  - [x] flags 和 flags_arr 的用途区别是啥？
  - [x] <del>加一个函数： 获取 pledgements（删除此字段）</del>
  - [x] 和后端配合，不必要信息没必要存储在链上  2H 
  - [x] 设计后端 Database & data format（Subpuss）
  - [ ] <del>增加对 USDT 的支持（Modal、合约 Token 端） </del> 暂时不支持，等所有的代码测试没问题再上 Mainnet   (Matic、ZKSync)  
- [x] 6.7 加一个分类（比如 Rust 、706、合约...）
  - [x] <del>Create Flag 时，获取合约里的 ID...</del> 这个好复杂，

- [x] 6.8 
  - [x] 增加 ongoing，Rug 和 Success 的 红绿印章标签 🏷
  - [x] 增加标签（label），可根据 label 进行选择 
  - [x] Card 组件 update
  - [x] （优先度低）增加标签（label），可根据 label 进行选择
  - [x] Bug Fixed：
    - [x] flag's（index-1）

- [x] 6.9 抉择： 读后端还是直接读合约  （...后端+合约...）
  - [x] ERC20: insufficient allowance
  - [x] bettors Avatar list 
  - [x] Bug fixed：submitting -> onchaining
  - [x] Pledge -> onChain ... 测试，精度不对
  - [ ] <del>User - 用户表 Address - name 即可</del>

- [x] 6.10
  - [x] Bettors's list
  - [ ] Collect winning!
  - [ ] Claim the Bet!

- [ ] 最高可以开几倍

  - [ ] 无限大倍，
    比如小明自己立 flag 质押了 ￥100，
    比如小红 Pledge ￥0.01，如果没有其他 bettors 竞争，她可以在小明的 flag rug 后独拿 flager 的 100 块和自己的 ￥0.01。

    10000 倍低风险杠杆？

    应该设置一个最低准入： 比如 10%，否则没人愿意立 Flag 了。

- [ ] 质押分 2 种情况，在点击按钮时做区分 :

  - [ ] 质押实际 Token （Numbai）
  - [ ] USDT （Polygon Matic 主链）当测试链测试都没问题没 Bug 之后，再上主链。
  - [ ] 只立 flaG，不质押（Flag 广场）
- [ ] Essay： DAO organization（这个东西在 DAO 内的应用）
- [ ] 开源代码 + License
- [ ] 合约  @Zhipeng  Review
- [ ] 排行榜、排序
- [ ] 投票：Snapshot（多签）
- [ ] Flag 的 Roadmap，分批解锁
- [ ] 团队募资： 根据 **Roadmap** 分批解锁
- [ ] 支持 USDT/USDC 
- [ ] Deploy on Polygon、ZKSync、Arbitrum







### 合约测试



1. 部署 ERC-20.sol（**Mumbai**, VM）

Token 地址： 

```bash
["0x65d5b68A7878A987e7A19826A7f9Aa6F5F92e10F","0xab6Abd1177a962036DE7EBa695983c284100F61a","0x8976CF0CE595507d5A0F7Cc338BeC94C52524B98","0xD17BA0e9886aF3d2CF876f88Af69FEABb0010FC5"]

Deploy address :
  0x9D5080322FB0Af1fcC6E6674754CA0298d4B31b0
```

2. 部署 FlagDAO.sol

```bash
# _Token
如上
# _OWNERS   (多签 Contract Owners)
["0x65d5b68A7878A987e7A19826A7f9Aa6F5F92e10F","0xab6Abd1177a962036DE7EBa695983c284100F61a","0x8976CF0CE595507d5A0F7Cc338BeC94C52524B98","0xD17BA0e9886aF3d2CF876f88Af69FEABb0010FC5"]
# _NUMCONFIRMATIONSREQUIRED
1

FlagDAO depoly at:  
  0xD06f231b9f2eec96Cde92C6A6CaB27F5a8a05c17
```



3. 回到 ERC-20.sol  ApproveBatch 给多个地址授权 FlagDAO.sol 转移用户的这个 ERC-20 代币

ApproveBatch:

```bash
#appr_addrs: 
["0x65d5b68A7878A987e7A19826A7f9Aa6F5F92e10F","0xab6Abd1177a962036DE7EBa695983c284100F61a","0x8976CF0CE595507d5A0F7Cc338BeC94C52524B98"]
#spender(FlagDAO.sol 部署的合约地址): 
如上

amount: 10000  # 每人授权 FlagDAO 可以动用 10000 枚 token （方便测试，实际使用时需让用户 approve）
```

> 注意，这里是出于测试方便的目的，如果是在前端，需要在 frontend 代码里调用 2 个函数： 
>
> 1. ERC-20.sol 的 approve 函数。
> 2. FlagDAO.sol 的 launch 函数。



4. launch Flag（用户创建 Flag）

```rust
// 第一个 falg :
{
  id: 0,
  flager address: 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4,
  goal: 今晚完成作业,
  self_pledged: 20,  // In contract: 20000000000000000000 == 20* 10**18
  bettors_pledged: 0,
  flag_status: false,
  claimed: false
}

今晚分享 Semaphore
20  # 20 token

今晚上号上到冠绝一世 10000 分！
10  # 100 token

今晚怒赚它一个小目标！！
100  # 1000 token
```



5. No bettors, 设置 Flag 状态 - True

```bash
updateFlagStatus() - inputs:
  [0, 1]  # id 为 0 和 id 为 1 的 flag
  true

getAllFlags: 
  [pass] flag.status 为 true，flag.claimed 状态为 true，

updateFlagStatus  // 再次调用，应该失败，因为状态已经更改。
  [should failed]
  
ERC-20 用户余额测试：
  [pass] 余额取回.  
     目前：9859999999999999998000
 状态更新: 9879999999999999998000  ✅ 
          
```



6. No bettors, 设置 Flag 状态 - False

```bash
# 查询当前余额 balanceof:
7879999999999999998000

# 更新 flag 状态
updateFlagStatus() - inputs:
  [2]  # id 为 0 和 id 为 1 的 flag
  false

getAllFlags: 
  [pass]  flag.status 为 false，flag.claimed 状态为 true，

ERC-20 用户余额测试：
  [pass] 余额留在合约里. 
  7879999999999999998000  
 
```



7. 2 Bettors, 设置 Flag 状态 - True

```bash
```







### Tips

**前端+合约交互过程...**

1. 前端把所有的数值都 × `10 ** 18`
   1. 在链上进行转换需要消耗更多的gas。
   2. 用户可以清楚地看到他们将如何与合约互动，包括他们将要发送或接收的确切金额。





### Flags...

鸡蛋 Egg(Test)

共学多久了！？（10月，马上一周年），flag 来了 10月之前把共学的徽章搞搞！



阳小雪(Test)

感谢各位大佬帮我答疑解惑[Fight]，@keep，kyrin，笃行，po，郭老师，来成都请你们恰火锅 [Smart]



Demian

学会 Rust，开发小型区块链，录课程



Keep

研究 zkbridge，给大家分享代码实现和项目逻辑







### 文案：

Done，给了 1000 $LT 
Mumbai 合约地址：0xc7712D2FeEf05619269963A7D00baeFE8EDE6AEA

先领点 Polygon 测试币（Mumbai Faucet）：https://mumbaifaucet.com/

这笔 `$LT` 在 https://flag-dao.vercel.app/ 可以用来：

1. 建立你自己的 Flag：**Flag's Pledge Amount:** 输入自己的质押金额
2. 围观对赌别人 Flag：在首页点击 Pledge 质押对赌金额

Flag 完成或者 Rug 后，都可以再次 Claim 你的收益



### Chat/Prompts

```
用 Typescript React +Tailwind  实现一个弹出的 Modal ，
要求：
1. 点击 Create button 后触发
2. Modal 里包含 3 个 input，各占一行，分别是 goal(string), pledge_amt(Number), startAt(Number)
3. 三个 input 下面是一个 居中的 Submit 按钮，做的美观好看一些，加一些渐变、阴影
3. 点击 Modal 外的区域自动关闭该 Modal
4. 整体做的美观好看一些，加一些渐变、阴影
```



> 这个是杠杆的分钱逻辑，暂时弃用

现在我们有一个质押对赌的程序。他的逻辑大概这样：

- 比如用户 a 为 flag_1 下注100美元。比如他下注是 flag_1 - Done 
- 然后用户 b 和 c 下注的是分别是 1 美元和 9 美元，他们下注的是 flag_1 - Failed

用户身份：

- 用户 a 是 flag 的承诺人，通常只有 1 个，他自己质押 flag_1 的状态为 Done 来激励自己，克服拖延
- 用户 b、c、d ... 是 flag 的对赌人，通常可以是 0 ~ n  (n 无上限)，对赌人赌 flag 的状态是 Failed

这个游戏是这么玩的，每个 flag 都有 2 种状态：Done 和 Failed：

1. 假如 flag_1 最后的状态是 Done。那么用户 a 拿走所有对赌用户的钱，比如在上面这个例子中，他就把 b 和 c 的 1 美元和 9 美元都拿走了
2. 假如 flag_1 最后的状态是 Failed ，那么用户 a 的赌注就会被所有的投注用户瓜分，这里引入一个杠杆，假设杠杆率设置为 5，那么用户 b 就能拿走 1×5=5 美元，用户 c 就能拿走 9×5 = 45 美元。剩下的100 - 5 - 45 = 50 美元进入到国库。
3. 在 状态是 Failed 场景中，即使对赌用户投注的钱再多，他最多只能拿走不超过 100 美元的奖励。

我的问题是，这里的杠杆率设置似乎不太合理，因为用户 a 即使下注 Done 且赌对，他也最多只能拿走十美元，但是用户 b 和 c 的杠杆率都是 5 倍。

你能否帮我优化一下这个杠杆场景，使得不论对flag_1 的状态押注是怎样的，能够保证两方都愿意为其下注。



----



现在我们有一个质押对赌的程序。他的逻辑大概这样：

- 比如用户 a 为 flag_1 下注100美元。比如他下注是 flag_1 - Done 
- 然后用户 b 和 c 下注的是分别是 1 美元和 9 美元，他们下注的是 flag_1 - Failed

用户身份：

- 用户 a 是 flag 的承诺人，通常只有 1 个，他自己质押 flag_1 的状态为 Done 来激励自己，完成承诺，克服拖延
- 用户 b、c、d ... 是 flag 的对赌人，通常可以是 0 ~ n  (n 无上限)，对赌人赌 flag 的状态是 Failed



这个游戏是这么玩的，每个 flag 都有 2 种状态：Done 和 Failed：

1. 假如 flag_1 最后的状态是 Done。那么用户 a 拿走所有对赌用户的钱，比如在上面这个例子中，他就把 b 和 c 的 1 美元和 9 美元都拿走了
2. 假如 flag_1 最后的状态是 Failed ，那么用户 a 的赌注就会被所有的投注用户瓜分，用户 b  : 用户 c = 1: 9 , 那么用户 b 就能拿走 1/10 的钱，而用户 c 则能拿走 9/10 的钱。 
3. 假如
4. 在 状态是 Failed 场景中，即使对赌用户投注的钱再多，他最多只能拿走不超过 10倍杠杆的奖励。

我的问题是，这里的杠杆率设置似乎不太合理，因为用户 a 即使下注 Done 且赌对，他也最多只能拿走十美元，但是用户 b 和 c 的杠杆率都是 5 倍。

你能否帮我优化一下这个杠杆场景，使得不论对flag_1 的状态押注是怎样的，能够保证两方都愿意为其下注。





### 合约 Todo：

- [ ] 设置对赌最大杠杆率：4
- [ ] 分钱的逻辑：
  - 瓜分：池子 \$100 , 投注 \$0.01 , 杠杆率就是 10000 ❌
    - 问题：用户都想在时间的最后搏一搏，而不是一上来就投注
  - 固定杠杆率(如 5)：池子 \$100，投注 \$1，固定拿 \$5  ❌
    - 问题：没有 amazing 的超额收益
  - 方案：设置最大杠杆率为 10，防止杠杆率可能达到 1000/10000 这样子
    - 问题：用户只愿意付出 `100/杠杆率`  的钱，比如在 10 倍杠杆的情况下，用户只需要 \$10 就可以获得潜在的全部的 \$100，它就最多只会投注 \$10
    - 解决：我觉得这个倒不是什么问题，毕竟 flag 的完成与否取决于 flager，Bettors 的风险是大的。
    - 最终决定：杠杆率最大为 50

