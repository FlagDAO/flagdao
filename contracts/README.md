整体是一个基于 ERC1155 余额的分账逻辑，[逻辑图示](https://github.com/FlagDAO/flagdao/tree/main)：



## 函数说明

### `create(string calldata arTxId)`

#### 参数

- `arTxId`: 字符串，Arweave 交易ID，代表了资产在 Arweave 上的存储位置。

#### 行为逻辑

- 此函数用于创建一个新的 Flag。
- 首先，检查通过 `arTxId` 生成的哈希值是否已经关联了一个 Flag ID，以确保不会重复创建。
- 如果是新资产，则创建一个新的 `Flag` 结构，并初始化其状态为 `Undone`。
- 资产的质押金额（以发送到合约的 ETH 金额为准）被记录在 `pool` 和 `selfpool` 中。
- 使用 `_mint` 函数铸造一个新的 NFT，数量与发送到合约的 ETH 相等。

#### 变量变更

- `flags`: 增加了一个新的 Flag。
- `flagStatus`: 设置新 Flag 的状态为 `Undone`。
- `pool`, `selfpool`: 更新了相应的质押金额。
- `flagId`: 增加了以跟踪下一个 Flag 的 ID。



> 对应逻辑图示：Fred 是其 Flag 的 Creator，Fred 来调用这个 create 立 Flag.
>
> 假设 Fred 立 Flag 2023 年底暴瘦 30 斤。



### `gamblePledge`

#### 参数

- `id`: 数字，代表了要质押的 Flag 的 ID。

#### 行为逻辑

- 此函数允许用户对一个现有的 Flag 进行**对赌**。
- 验证 Flag 存在，并且调用者不是 Flag 的创建者。
- 更新质押者列表，记录新的质押金额。
- 为质押者铸造相应数量的 ERC1155NFT。

#### 变量变更

- `flagBettors`: 加入了新的质押者（对赌者）。
- `pool`, `betspool`: 更新了总质押金额和质押者质押金额。
- `flags`: 标记相关 Flag 质押信息的更新。



> 对应逻辑图示：Alice 和 Bob 是 Fred's Flag 的 Gambler(对赌者)，Alice 和 Bob 来调用这个 gamblePledge 来对该 Flag 进行质押（赌 Fred 年底不可能暴瘦 30 斤。）



### `setFlagDone`

#### 参数

- `id`: 数字，代表了要设置状态的 Flag 的 ID。

#### 行为逻辑

- 此函数只能**由合约所有者调用**，用于将 Flag 的状态从 `Undone` 更改为 `Done`。（相当于是一个 Flag 验证者的角色，后续升级中会将权限发给多签账户）
- 验证 Flag 存在并且其状态尚未改变。
- 调用 `_resetShares` 函数，重新分配质押份额。

#### 变量变更

- `flagStatus`: 将特定 Flag 的状态更新为 `Done`。



### `_resetShares`

#### 参数

- `id`: 数字，代表了要重置质押份额的 Flag 的 ID。

#### 行为逻辑

- 此函数用于在 Flag 状态改变为 `Done` 后重置质押份额。
- 验证 Flag 状态确实为 `Done`。
- 为 Flag 的创建者铸造等同于 `betspool` 金额的 NFT，并更新 `selfpool`。
- 为 Flag 所有质押者销毁他们的 NFT，更新 `pool`。

#### 变量变更

- `selfpool`, `pool`, `betspool`: 重置相关质押金额。



### `flagerRetrive`

#### 参数

- `id`: 数字，代表了要检索的 Flag 的 ID。

#### 行为逻辑

- 此函数允许 Flag 的创建者在 Flag 状态为 `Done` 后检索其质押的 ETH。
- 验证 Flag 存在，状态为 `Done`，调用者是 Flag 的创建者，且 `selfpool` 中有余额。
- 将 `selfpool` 中的余额发送给调用者。（此时 selfpool 中包含 Flager 自己的质押金额 和 对赌者（Gamblers） 的对赌金额）

#### 变量变更

- `selfpool`, `pool`: 将相应的金额清零。



> 对应逻辑图示： Fred 年底真的暴瘦了 30 斤！ 验证者将 Flag 的状态修改为 **Done**， Fred 拿回本金，并且将所有对赌者的钱也都拿走。）



---



### `setFlagRug`

#### 参数

- `id`: 数字，代表了要设置状态的 Flag 的 ID。

#### 行为逻辑

- 此函数由合约所有者调用，用于将 Flag 的状态从 `Undone` 更改为 `Rug`。
- 验证 Flag 存在并且其状态尚未改变。
- 调用 `_resetSharesForRug` 函数，重新分配质押份额以反映失败的状态。

#### 变量变更

- `flagStatus`: 将特定 Flag 的状态更新为 `Rug`。





### `_resetSharesForRug`

#### 参数

- `id`: 数字，代表了要重置质押份额的 Flag 的 ID。

#### 行为逻辑

- 此函数用于在 Flag 状态改变为 `Rug` 后重置质押份额。
- 验证 Flag 状态确实为 `Rug`。
- 销毁 Flag 创建者和所有质押者的 NFT，重置 `gamblepool`。

#### 变量变更

- `gamblepool`, `selfpool`, `pool`, `betspool`: 重置相关质押金额。



### `gamblersRetrive`

#### 参数

- `id`: 数字，代表Flag 的 ID。

#### 行为逻辑

- 此函数允许质押者在 Flag 状态为 `Rug` 后分账 Flager 在合约内质押的 ETH。
  - 如逻辑图示：
    - 假设 Fred 质押其暴瘦 30 斤的 Flag ` $120`
    - Alice 和 bbob 分别对赌该 Flag，并质押 `$1` 和 `$19`
    - Fred 的暴瘦 Flag 倒了之后， Alice 和 Bob 可以瓜分这笔金额；即按照 `1:19` 的比例来瓜分
    - 但是为了防止极小的投入也能杠杆到 Flager 的钱，同时也是为了激励大家多往池子里放钱，设置了了一个**最大杠杆率** MAX_LEVERAGE = 5
    - 也就是说，如果 alice 只投入了 `$1` 那么他即使对赌成功，也只能获得最多 `$5` 的收益。（这是为了防止 alice 能以 `$1`  杠杆出过大的金额）
- 验证 Flag 存在，状态为 `Rug`，调用者不是 Flag 的创建者，且有权检索金额。
- 将 `gamblepool` 中的余额发送给调用者。

#### 变量变更

- `gamblepool`: 将调用者的金额清零。





### Getting Started

Create a project using this example:

```bash
npx thirdweb create --contract --template forge-starter
```

You can start editing the page by modifying `contracts/Contract.sol`.

To add functionality to your contracts, you can use the `@thirdweb-dev/contracts` package which provides base contracts and extensions to inherit. The package is already installed with this project. Head to our [Contracts Extensions Docs](https://portal.thirdweb.com/thirdweb-deploy/contract-extensions) to learn more.

### Building the project

After any changes to the contract, run:

```bash
npm run build
# or
yarn build
```

to compile your contracts. This will also detect the [Contracts Extensions Docs](https://portal.thirdweb.com/thirdweb-deploy/contract-extensions) detected on your contract.

### Deploying Contracts

When you're ready to deploy your contracts, just run one of the following command to deploy you're contracts:

```bash
npm run deploy
# or
yarn deploy
```

### Releasing Contracts

If you want to release a version of your contracts publicly, you can use one of the followings command:

```bash
npm run release
# or
yarn release
```

### Join our Discord!

For any questions, suggestions, join our discord at [https://discord.gg/thirdweb](https://discord.gg/thirdweb).
