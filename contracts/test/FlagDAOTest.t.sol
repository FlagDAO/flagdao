// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";
import "forge-std/Test.sol";
import "../src/FlagDAO.sol";

contract FlagDAOTest is Test {
    
    // Foundty 目前对于 UUPSProxy 的支持还不完善，需要手动调用 initialize 函数,
    // 且报错信息不正确. 
    FlagDAO public f;
    address public demian = address(0x65);
    address public fred  = address(10086);
    address public alice = address(1);
    address public bob   = address(2);
    
    function setUp() public {
        address initialOwner = demian;
        address proxy = Upgrades.deployUUPSProxy(
            "FlagDAO.sol",
            abi.encodeCall(FlagDAO.initialize, (initialOwner))
        );

        f = FlagDAO(proxy);
        console2.log("contarct owner: ", address(f));    // 0x0000000000000000000000000000000000000000  

        /*
        console2.log("contarct owner: ", f.owner());    // 0x0000000000000000000000000000000000000000  
        // f.initialize();
        // // Upgradeable Contract:
        // vm.prank(demian); // 确保以 demian 的身份调用 initialize
        */

        // create a flag to gamble on
        hoax(fred, 10 ether);
        f.createFlag{value: 1 wei}("arTxId - flag-0");
    }
    
    function testCreate() public {
        // Fred calls create and sends 10 ETH
        hoax(fred, 10 ether);
        f.createFlag{value: 120 wei}("arTxId - flag-1");
        assertEq(address(f).balance, 120 + 1); // 1 ether in setUp

        // hoax(fred, 10 ether);
        // f.create{value: 1 ether}("arTxId - flag-2");
        // assertEq(address(f).balance, 1e18 + 120 + 1);
    }

    function testGamblePledge() public {
        testCreate();

        // Alice gamble on the `flag-1`
        uint256 id = 1; // flagId.

        hoax(alice, 10 ether);
        f.gamblePledge{value: 1 wei}(1);
        assertEq(f.getPools(id)[2], f.getPools(id)[0] + f.getPools(id)[1]);
        console2.log("contarct balance: ", address(f).balance);
    }

    function testFlagDone() public {
        // 1. fred create a flag.
        hoax(fred, 10 ether);
        f.createFlag{value: 120 wei}("flag-1 - I will achieve this goal!"); // flagId == 1
        uint256 flagId = 1;
        assertEq(f.balanceOf(fred, flagId), 120);

        // 2. alice and bob gamble on the `flag-1`
        hoax(alice, 10 ether);
        f.gamblePledge{value: 1 wei}(flagId);
        assertEq(f.balanceOf(alice, flagId), 1);
     
        hoax(bob, 10 ether);
        f.gamblePledge{value: 19 wei}(flagId);
        assertEq(f.balanceOf(bob, flagId), 19);

        assertEq(f.getPools(flagId)[0], 120);
        assertEq(f.getPools(flagId)[1], 20);
        assertEq(f.getPools(flagId)[2], 140);
     
        // 3. Finally, Fred achieve the goal.
        vm.prank(demian);
        // 4. owner of the contract call this function the set the flag `Done` .
        f.setFlagDone(flagId); 
        assertEq(f.balanceOf(alice, flagId), 0);
        assertEq(f.balanceOf(bob, flagId), 0);
        assertEq(f.balanceOf(fred, flagId), 120 + 1 + 19);

        // 5. fred withdraw the money. set fred's balance 1 ether.
        hoax(fred, 1 ether);
        f.flagerRetrive(flagId);
        assertEq(fred.balance, 1 ether + 120 + 1 + 19); 
    }

    function testFlagRug() public {
        // 1. fred create a flag.
        hoax(fred, 10 ether);
        f.createFlag{value: 120 wei}("flag-1 - I will achieve this goal!"); // flagId == 1
        uint256 flagId = 1;
        assertEq(f.balanceOf(fred, flagId), 120);

        // 2. alice and bob gamble on the `flag-1`
        hoax(alice, 10 ether);
        f.gamblePledge{value: 1 wei}(flagId);
        assertEq(f.balanceOf(alice, flagId), 1);
     
        hoax(bob, 10 ether);
        f.gamblePledge{value: 19 wei}(flagId);
        assertEq(f.balanceOf(bob, flagId), 19);

        assertEq(f.getPools(flagId)[0], 120);
        assertEq(f.getPools(flagId)[1], 20);
        assertEq(f.getPools(flagId)[2], 140);
     
        // 3. Finally, Fred rugs the goal, lol~
        vm.prank(demian);
        // 4. owner of the contract call this function the set the flag `Rug` .
        f.setFlagRug(flagId);
        assertEq(f.balanceOf(alice, flagId), 1);
        assertEq(f.balanceOf(bob, flagId), 19);
        assertEq(f.balanceOf(fred, flagId), 0);


        // 5. fred can't refund the money. 
        // hoax(fred, 0 ether);
        // f.gamblersRetrive(flagId);
        // vm.expectRevert(bytes("Flag owner can not refund."));
        // err.throwError();  [Bug] here ?
        //     and gamblers split the payment.

        // refundGambler
        hoax(alice, 0);
        f.gamblersRetrive(flagId);
        assertEq(alice.balance, 5);

        hoax(bob, 0);
        f.gamblersRetrive(flagId);
        assertEq(bob.balance, 95);

    }


    /*
    function _send(uint256 amount) private {
        (bool ok,) = address(f).call{value: amount}("");
        require(ok, "send ETH failed");
    } */

    function _util_return_balance(address addr, uint256 id) public view returns(uint256) {
        address[] memory addresses = new address[](1); // 声明动态数组并初始化
        uint256[] memory ids = new uint256[](1);
        addresses[0] = addr;   // 填充数组
        ids[0] = id;

        uint256[] memory balance = f.balanceOfBatch(addresses, ids);
        return balance[0];
    }


    function testUUPS() public {

        address _newImplementation = address(0x01); // Use a non-zero initial value of choice.

        // 0xe99005bc0000000000000000000000000000000000000000000000000000000000000001
        emit log_bytes(
            abi.encodeCall(
                FlagDAO._contractUpgradeTo,
                (_newImplementation)
            )
        );

        // cast sig "_contractUpgradeTo(address _newImplementation)"
        // 0xe99005bc not work.
    }

    /*
    function testBuy100() public {
        
        vm.prank(bob);
        bod.buy(1, 1e5);
        console2.log("price-1: ", bod.getBuyPrice(1, 1e10));
        console2.log("balance of bob: ", _util_return_balance(bob, 1) );
        console2.log("getSellPrice    ", bod.getSellPrice(1, 1e5));
        console2.log("getBuyPriceAfterFee ", bod.getBuyPriceAfterFee(1, 1e5));

        vm.prank(cli);
        bod.buy(1, 1e12);
        console2.log("price-2: ", bod.getBuyPrice(1, 1e12));
    }
    */

}