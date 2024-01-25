$$
\begin{aligned}
q_{i}^{1}(x) = \sum_{i=1}^{t} \ {\gamma_1}^{i-1} \ \cdot \frac{f_{i}(x) - f_{i}(z_1) }{ x - z_1} \\
{q_{i}^{2}}(x) = \sum_{i=1}^{t} \ {\gamma_2}^{i-1} \ \cdot \frac{\tilde{f_{i}}(x) - \tilde{f_{i}}(z_2) }{ x - z_2} \\
\end{aligned}
$$


write a React(Typescript) page, the content is :
a diagram, the x-axis is 
Use a javascript library ro draw a picture on the web.

Warning: SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing "" to each source file. Use "SPDX-License-Identifier: UNLICENSED" for non-open-source code. Please see https://spdx.org for more information.
--> FlagDlAO.sol





使用 solidity 帮我实现几个不同的智能合约，你可以命名为 FlagFactory.sol, UserFlag.sol 等 ...

我的要求是：
1. 给出几个文件的文件名，后面接着是他们的代码
2. 需求中所有的代码逻辑需要全部、详细地实现，且有清楚的代码注释。

以下是需求的正文：

"""
### 背景-FlagDAO

FlagDAO 是一个为爱立 Flag 的人准备的，每个人都有他自己的 Flag，每个人都想实现他的 Flag，每个人都会为其 Flag 进行质押，或者尝试判断别人的 Flag 什么时候失败。

### Roadmap

目前我已经实现了 CoLearnToken.sol 如下代码 , 注意 ERC20 的 "CoLearn Token", "$CT" 部分，供你参考

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CoLearnToken is ERC20, ERC20Burnable, Ownable {
    constructor(address[] memory whitelist) ERC20("CoLearn Token", "$CT") {
        for(uint i = 0; i < whitelist.length; i++){
            _mint(whitelist[i], 10000 * (10 ** decimals()));
        }
    }

    function addTokens(address to, uint num) public onlyOwner {
        _mint(to, num * (10 ** decimals()));
    }

    function burnTokens(address from, uint num) public onlyOwner {
        _burn(from, num * (10 ** decimals()));
    }
}
```

并假设，CoLearnToken contract 的 owner 已将 10000 $CT Token 打给所有的 whitelist address，

假设 Mike 是 whitelist addresses 中的一个用户：

Mike 可以创建一个 Flag，这个 Flag 应该继承自一个工厂合约，是一个 struct 或者是 NFT(ERC-721) 我不知道，你可以自己选择。
Flag 的内容包括自己的目标（文本），自己质押的 $CT 数额（这部分需要在 Flag 创建时就传入，比如自己质押了 300 $CT），和特定地址们的质押金额(mapping)（创建时为空，后续可以添加进去，比如 0xd63891.. 质押了 200 $CT ...;  0xabc3891），初始化的 Flag 的完成标志 bool status 的值为 false，

Flag 的完成标志： status == true 表示 Flag 完成， status == false 表示 Flag 失败，请注意！用户无权自己更改 status 的值!! 

用户在创建 Flag 时要继承一个父合约(工厂合约)，只有父合约的 owner 才有权更改这些用户创建的 Flag 的 status 变量，用户自己无权更改 status 的值!!

其他用户可以对某用户创建的 Flag 进行质押（代币类型为 $CT），这个过程叫做旁观者质押：
1. 如果用户的 Flag 成功，旁观者质押的 $CT 会被全部 transfer 给 Flag 的创建者，请在代码中实现这个函数
2. 如果该 Flag status 失败，旁观者可以瓜分这部分 $CT，瓜分方法下面会有详细的说明，请在代码中实现这个函数


上面提到的 2 种情况：

1. 用户创建并投资自己的 Flag ，review 函数会主动检查 Flag 的 status ，如果 status 为 true，说明 Flag 成功，该 Flag 所属用户的质押金额返还，其他旁观者质押者质押在这个 Flag 中的 $CT 全部 transfer 给 Flag 创建者，举个例子：

Mike 立了一个名为 ：“3 天学会 Rust” 的 Flag，他自己质押了 1000 $CT，旁观者有 2 个人，分别是 Jay 和 Joe。 Jay 对 Mike 的 Flag 质押了 200 $CT, Joe 对 Mike 的 Flag 质押了 300 $CT，review 函数检查 Mike 这个 Flag 的完成标志 status ，如果是 true， 说明 Mike 的 Flag 成功了，旁观质押者（Jay 和 Joe） 对该 Flag 质押的所有 $CT 会被全部 transfer 给 Mike。

请详细实现这个函数


2. 用户创建并投资自己的 Flag ，review 函数会主动检查 Flag 的 status，如果 Flag 的完成标志 为 false，说明 Flag 失败，该 Flag 所属用户的质押金额($CT) 被全部按质押比例 transfer 给其他质押者，举个例子：

Mike 立了一个名为 ：“3 天学会 Rust” 的 Flag，他自己质押了 1000 $CT，旁观者有 2 个人，分别是 Jay 和 Joe，Jay 对 Mike 的 Flag 质押了 200 $CT, Joe 对 Mike 的 Flag 质押了 300 $CT，如果调用 review 函数检查 Mike 这个 Flag 的完成标志，是 False，说明 Mike 的 Flag 失败了，所以 Mike 对该 Flag 质押的所有 $CT 会被全部 transfer 给旁观质押者（Jay 和 Joe），分配比例是 200:300 即 2:3 ，即 Jay 获得 400 $CT, Joe 获得 600 $CT

请详细实现这个函数

写到这里，你需要思考下 Flag 以什么形式存在是最好的方式，是 struct，还是 NFT ,还是工厂合约，你需要自己选择一个最合适的构建方式。


最后会有一个 review 函数，该函数应该被写在 Flag Factory 合约里面，该函数会循环判断所有 Flag 的 status 标志并处理质押的代币。
"""




对于每个 Flag ，我们希望由多个地址来共同更改（比如 multi-sign，不知道能否实现，如果不能实现多个地址共同决定的话，那就让一个特定地址来更改这个合约的状态。）








修改如下代码, 帮我实现几个函数，

第 1 个函数
其功能是查询某个地址的 $CT 数量

num 代表给以上地址增加 num 个 "CoLearn Token" 即 "$CT"

第 2 个函数：
其功能是给某个地址追加 "CoLearn Token" 即 "$CT" num 个 Token

第 3 个函数：
其功能是 burn 掉某个地址 num 个 "CoLearn Token" 即 "$CT"  Token.


"""
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CoLearnToken is ERC20 {
    constructor(address[] memory whitelist) ERC20("CoLearn Token", "$CT") {
        for(uint i = 0; i < whitelist.length; i++){
            _mint(whitelist[i], 10000 * (10 ** decimals()));
        }
    }
}
"""








以下是一个 ERC-20 代币的代码：

CoLearnToken.sol :
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CoLearnToken is ERC20, ERC20Burnable, Ownable {
    constructor(address[] memory whitelist) ERC20("CoLearn Token", "$CT") {
        for(uint i = 0; i < whitelist.length; i++){
            _mint(whitelist[i], 10000 * (10 ** decimals()));
        }
    }

    function addTokens(address to, uint num) public onlyOwner {
        _mint(to, num * (10 ** decimals()));
    }

    function burnTokens(address from, uint num) public onlyOwner {
        _burn(from, num * (10 ** decimals()));
    }

    // Query the balance of a certain address
    function balanceOfAddress(address _address) public view returns (uint256) {
        return balanceOf(_address);
    }
}
```
假设我已经部署了此合约，且给 0x65 地址 mint 了 10000 枚 "CoLearn Token", "$CT" Coin.


现在另外有一个 Factory 合约：

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CoLearnToken.sol";
import "./UserFlag.sol";

contract FlagFactory is Ownable {
    CoLearnToken private token;
    address[] private flags; //声明了一个私有的动态数组，该数组的元素类型是地址（address）。

    function reviewFlag(uint index) external onlyOwner {
        require(index < flags.length, "Invalid index");
        UserFlag flag = UserFlag(flags[index]);

        if (flag.status()) {
            flag.refundPledges(); //
        } else {
            flag.distributePledges();
        }
    }
}
```

在上面这个 Factory 合约中，我想改动几个点：

1. 重构下 Flag 的结构：

Flag {
    string text; // Flag 内容
    uint stake_amt; // 自己质押的数量
    bool status;  // flag 完成状态
    mapping( address => uint) stake_mapping; // 旁观者质押的数量
}

2. 在 UserFlag.sol 合约中，我希望：
2.1 用户继承 Factory 的合约，并在构造函数中写入 text 和 stake_amt（其中 stake_amt 是指 CoLearnToken.sol 合约的 "CoLearn Token", "$CT" Coin）
2.2 实现上面提到的质押返还、质押分配逻辑
2.3 用户在 UserFlag.sol 合约中可以修改 text 和追加 stake_amt，但其无权更改 status， status 只能由Factory 合约的 owner 更改


`token = CoLearnToken(_token);` 这边写得有点问题： 因为在 CoLearnToken.sol 已经给白名单发放了代码，不需要再次调用构造函数。

