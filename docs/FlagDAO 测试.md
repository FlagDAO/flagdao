# 先别管样式问题，先完成 Roadmap 里的核心功能



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





### Token constructor：

￥399  ->    10000 `$LT`

["0x65d5b68A7878A987e7A19826A7f9Aa6F5F92e10F","0xab6Abd1177a962036DE7EBa695983c284100F61a","0x8976CF0CE595507d5A0F7Cc338BeC94C52524B98"]
10000
Co-Learn Token
`$LT`



Token 地址（**Mumbai**）：
**0xf9FaE855dAf6d4EB256b742d188382B8465d139D**  




### FlagDAO Deploy：

**ERC-20 合约地址 ：** 如上                             

["0x65d5b68A7878A987e7A19826A7f9Aa6F5F92e10F"]                         (多签 Contract Owners)

1

FlagDAO 部署之后，ERC-20 Token 要授权给 FlagDAO 合约地址 `0xc7712D2FeEf05619269963A7D00baeFE8EDE6AEA` 足够大的额度。



### **approveBatch**

["0x65d5b68A7878A987e7A19826A7f9Aa6F5F92e10F","0xab6Abd1177a962036DE7EBa695983c284100F61a","0x8976CF0CE595507d5A0F7Cc338BeC94C52524B98"]

FlagDAO 合约地址




#### launch
0x5B38Da6a701c568545dCfcB03FcB875f56beddC4：
在共学期间，使用 Rust 构建一个小型区块链。
500
1685156971
1686971371









### CHat

```
用 Typescript React +Tailwind  实现一个弹出的 Modal ，
要求：
1. 点击 Create button 后触发
2. Modal 里包含 3 个 input，各占一行，分别是 goal(string), pledge_amt(Number), startAt(Number)
3. 三个 input 下面是一个 居中的 Submit 按钮，做的美观好看一些，加一些渐变、阴影
3. 点击 Modal 外的区域自动关闭该 Modal
4. 整体做的美观好看一些，加一些渐变、阴影
```







# Flag

鸡蛋 Egg(Test)

共学多久了！？（10月，马上一周年），flag 来了 10月之前把共学的徽章搞搞！



阳小雪(Test)

感谢各位大佬帮我答疑解惑[Fight]，@keep，kyrin，笃行，po，郭老师，来成都请你们恰火锅 [Smart]



Demian

学会 Rust，开发小型区块链，录课程



Keep

研究 zkbridge，给大家分享代码实现和项目逻辑





### 社区测试

#### 1. 发 `$LT` 立 Flag

比如十一的钱包：0x4bbd2A03A0aD7449EB273f4385cE25E9D2c8D8fE

1. 先 import ERC-20 合约地址
2. **addTokens()**
3. approveBatch:
   1. whitelist: ["0x4bbd2A03A0aD7449EB273f4385cE25E9D2c8D8fE"]
   2. spender: Flag 合约





文案：

Done，给了 1000 $LT 
Mumbai 合约地址：0xc7712D2FeEf05619269963A7D00baeFE8EDE6AEA

先领点 Polygon 测试币（Mumbai Faucet）：https://mumbaifaucet.com/

这笔 `$LT` 在 https://flag-dao.vercel.app/ 可以用来：

1. 建立你自己的 Flag：**Flag's Pledge Amount:** 输入自己的质押金额
2. 围观对赌别人 Flag：在首页点击 Pledge 质押对赌金额

Flag 完成或者 Rug 后，都可以再次 Claim 你的收益
