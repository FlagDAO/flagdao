// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.0.0/contracts/token/ERC20/IERC20.sol
interface IERC20 {
    function totalSupply() external view returns (uint);

    function balanceOf(address account) external view returns (uint);

    function transfer(address recipient, uint amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
}

// // SPDX-License-Identifier: MIT
// // WTF Solidity by 0xAA

// pragma solidity ^0.8.17;

// interface IERC20 {
//     /**
//      * @dev 释放条件：当 `value` 单位的货币从账户 (`from`) 转账到另一账户 (`to`)时.
//      */
//     event Transfer(address indexed from, address indexed to, uint256 value);

//     /**
//      * @dev 释放条件：当 `value` 单位的货币从账户 (`owner`) 授权给另一账户 (`spender`)时.
//      */
//     event Approval(address indexed owner, address indexed spender, uint256 value);

//     /**
//      * @dev 返回代币总供给.
//      */
//     function totalSupply() external view returns (uint256);

//     /**
//      * @dev 返回账户`account`所持有的代币数.
//      */
//     function balanceOf(address account) external view returns (uint256);

//     /**
//      * @dev 转账 `amount` 单位代币，从调用者账户到另一账户 `to`.
//      *
//      * 如果成功，返回 `true`.
//      *
//      * 释放 {Transfer} 事件.
//      */
//     function transfer(address to, uint256 amount) external returns (bool);

//     /**
//      * @dev 返回`owner`账户授权给`spender`账户的额度，默认为0。
//      *
//      * 当{approve} 或 {transferFrom} 被调用时，`allowance`会改变.
//      */
//     function allowance(address owner, address spender) external view returns (uint256);

//     /**
//      * @dev 调用者账户给`spender`账户授权 `amount`数量代币。
//      *
//      * 如果成功，返回 `true`.
//      *
//      * 释放 {Approval} 事件.
//      */
//     function approve(address spender, uint256 amount) external returns (bool);

//     /**
//      * @dev 通过授权机制，从`from`账户向`to`账户转账`amount`数量代币。转账的部分会从调用者的`allowance`中扣除。
//      *
//      * 如果成功，返回 `true`.
//      *
//      * 释放 {Transfer} 事件.
//      */
//     function transferFrom(
//         address from,
//         address to,
//         uint256 amount
//     ) external returns (bool);
// }