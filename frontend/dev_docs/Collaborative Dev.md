# Solidity 合约

## 函数简介

1. **constructor**：构造函数。在部署智能合约时进行调用，用于初始化智能合约的状态变量。主要用于设置合约的 ERC-20 token 地址、多签所有者地址、及所需的确认数。
2. **getOwners**：返回多签所有者地址的列表。
3. **launch**：启动一个新的“Flag”目标。用户提交一个目标描述、一个初始的投注数量、一个开始时间和一个结束时间，然后这个目标会被创建并存储。
4. **cancel**：取消一个特定的“Flag”目标。只有创建该目标的用户可以取消它。
5. **pledge**：用户可以向某个目标进行质押（投注）。这包括目标的创建者自己增加他的投注或其他用户投注。
6. **unpledge**：用户可以取回他们之前对某个目标的部分质押。
   1. 输入：flag ID `_id` 和金额 `_amt`。
   2. 行为：如果调用者是创建目标的用户，则他们可以取回他们的投注；  否则，投注者可以取回他们的部分投注。
7. **redeemTokensForFlager**：如果目标完成了，创建者可以赎回所有被其他用户质押的 token。他也可以取回自己的质押。
   1. 输入：flag ID `_id`。
   2. 只有 flag 的创建者才能调用这个函数，并且只有当目标成功完成后才能取回他们的承诺资金和其他用户的所有承诺资金。
8. **redeemTokensForBettors**：如果目标失败了，投注者 用户可以基于他们的质押比例来分配 flag 创建者的质押。
   1. 输入：flag ID `_id`。
9. **updateFlagStatus**：这是一个只有多签所有者可以调用的函数，用于更新某个目标是否已经完成。它可以同时更新多个目标的状态，并根据每个目标的结果进行 token 的分配。
   1. 用于更新一个或多个 flags 的状态。
   2. 输入：一个成功 ID 数组 `_succ_id_arr` 和一个布尔值 `res`。
   3. 行为：这个函数根据传入的成功ID数组更新目标的状态，并根据这些状态分配承诺资金。
10. **getFlags**：这是一个用于获取一定范围内的目标列表的函数。用户可以提供一个开始和结束的索引，然后得到这个范围内的所有目标。
11. **getAllFlags**：返回所有已创建的目标列表。
12. **updateFlagStatus**：此函数由合约的多签所有者调用，用来更新“Flag”目标的状态。
    - 输入参数有一个成功ID数组`_succ_id_arr`，和一个布尔值`res`（结果）。
    - 对于那些状态为成功的目标（ID在成功数组中），该函数会把所有的非创建者用户投注的token转给目标的创建者。
    - 对于那些状态为失败的目标（不在成功数组中），该函数会把创建者的token按照投注比例分给其他用户。
13. **getFlags**：此函数允许用户查询一个指定范围内的“Flag”目标。
    - 输入参数是`startIndex`和`endIndex`，代表要查询的目标的范围。
    - 返回的是在这个范围内的所有目标。
14. **getAllFlags**：此函数返回所有已创建的目标。
15. **getBettor**：返回一个特定目标下指定地址的用户的投注金额。
    - 输入参数是目标ID `_id` 和一个地址 `addr`。
    - 返回的是这个地址在这个目标下的投注金额。
16. **getTotalBet**：返回一个特定目标的所有投注金额之和。
    - 输入参数是目标ID `_id`。
    - 这个函数会遍历这个目标下的所有用户和他们的投注，然后计算并返回投注的总额。
17. **getBettors**：返回一个特定目标下的所有投注用户的地址。
    - 输入参数是目标ID `_id`。
    - 返回的是这个目标下的所有用户的地址列表。
18. **getBettorsPledgement**：返回一个特定目标下的所有用户的投注金额。
    - 输入参数是目标ID `_id`。
    - 返回的是这个目标下的所有用户的投注金额列表。




