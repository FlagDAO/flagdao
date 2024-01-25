// SPDX-License-Identifier: MIT

// 增加一个函数：要求在创建 ERC-20 的时候传入一个address 数组，名为 white_addrs, 然后给 white_addrs 里的所有地址转账 10000 枚 Token
pragma solidity ^0.8.17;

import "./IERC20.sol";

contract ERC20 is IERC20 {

    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    uint256 public override totalSupply;   // 代币总供给

    string public name;   // 名称
    string public symbol;  // 符号
    
    uint8 public decimals = 18; // 小数位数

    // @dev 在合约部署的时候实现合约名称和符号
    constructor(string memory name_, string memory symbol_, address[] memory white_addrs){
        name = name_;
        symbol = symbol_;

        // 为每一个白名单地址转账 10000 枚 Token
        uint256 initialAmount = 10000 * (10 ** uint256(decimals));
        for (uint256 i = 0; i < white_addrs.length; i++) {
            address recipient = white_addrs[i];
            balanceOf[recipient] += initialAmount;
            totalSupply += initialAmount;

            emit Transfer(address(0), recipient, initialAmount);
        }
    }

    function approveBatch(address[] memory appr_addrs, address spender, uint amount) external returns (bool) {
        for (uint256 i = 0; i < appr_addrs.length; i++) {
            address addr = appr_addrs[i];
            allowance[addr][spender] = amount * (10 ** uint256(decimals));
        }
        return true;
    }

    // @dev 实现`transfer`函数，代币转账逻辑
    function transfer(address recipient, uint amount) external override returns (bool) {
        uint256 amt = amount * (10 ** uint256(decimals));
        balanceOf[msg.sender] -= amt;
        balanceOf[recipient] += amt;
        emit Transfer(msg.sender, recipient, amt);
        return true;
    }

    // @dev 实现 `approve` 函数, 代币授权逻辑
    function approve(address spender, uint amount) external override returns (bool) {
        uint256 amt = amount * (10 ** uint256(decimals));
        allowance[msg.sender][spender] = amt;
        emit Approval(msg.sender, spender, amt);
        return true;
    }

    // @dev 实现`transferFrom`函数，代币授权转账逻辑
    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external override returns (bool) {
        uint256 amt = amount * (10 ** uint256(decimals));
        allowance[sender][msg.sender] -= amt;
        balanceOf[sender] -= amt;
        balanceOf[recipient] += amt;
        emit Transfer(sender, recipient, amt);
        return true;
    }

    // @dev 铸造代币，从 `0` 地址转账给 调用者地址
    function mint(uint amount) external {
        uint256 amt = amount * (10 ** uint256(decimals));
        balanceOf[msg.sender] += amt;
        totalSupply += amt;
        emit Transfer(address(0), msg.sender, amt);
    }

    // @dev 销毁代币，从 调用者地址 转账给  `0` 地址
    function burn(uint amount) external {
        uint256 amt = amount * (10 ** uint256(decimals));
        balanceOf[msg.sender] -= amt;
        totalSupply -= amt;
        emit Transfer(msg.sender, address(0), amt);
    }
}