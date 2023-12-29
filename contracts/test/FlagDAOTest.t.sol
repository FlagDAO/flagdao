// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Upgrades, Options} from "openzeppelin-foundry-upgrades/Upgrades.sol";
import "forge-std/Test.sol";
import "../src/FlagDAO.sol";

/*
Test commands: 

$ forge test --mt testCreate  -vvvvv
$ forge test --mt testGamblePledge  -vvvvv
$ forge test --mt testFlagDone  -vvvvv
$ forge test --mt testUUPS  -vvvvv

*/

contract FlagDAOTest is Test {

 
    UUPSProxy proxy;
    FlagDAO public f_v1;
    FlagDAO public f;
    address public demian = address(0x65);  // owner
    address public fred  = address(10086);  // flager
    address public alice = address(1);      // better Alice.
    address public bob   = address(2);      // better Bob.
    
    function setUp() public {
        FlagDAO implementationV1 = new FlagDAO();

        // deploy proxy contract and point it to implementation
        proxy = new UUPSProxy(address(implementationV1), "");
        // wrap in ABI to support easier calls
        f_v1 = FlagDAO(address(proxy));
        f_v1.initialize(demian);
        f = f_v1;

        hoax(fred, 10 ether);
        f.createFlag{value: 1 wei}("arTxId - flag-0");

        // ------------------------------------------------------------
        // Foundry upgradeToAndCall not success yet....
        // new implementation
        // FlagDAO implementationV2 = new FlagDAO(); // FlagDAO_V2

        // f_v1.upgradeToAndCall(
        //     address(implementationV2),
        //     abi.encodeCall(
        //         f._contractUpgradeTo,
        //         (address(implementationV2))
        //     ));
        
        // wrappedProxyV2.setY(200);
        // console.log(wrappedProxyV2.x(), wrappedProxyV2.y());

        // create a flag to gamble on
    }
    
    // [PASS]
    function testCreate() public {
        /*
         *  Fred calls create and sends 10 ETH
         */
        hoax(fred, 100 wei); // ether
        f.createFlag{value: 100 wei}("arTxId - flag-1");

        uint256 id = 1;
        assertEq(100, f.getPools(id)[0]); // selfpool
        assertEq(0,   f.getPools(id)[1]); // betspool
        assertEq(0,   f.getFunds());      // treasury funds.

        assertEq(address(f).balance, 100 + 1); // 1 wei in setUp
    }

    // [PASS]
    function testGamblePledge() public {
        /*
         *  Alice gamble on the `flag-1`
         */
        testCreate();

        uint256 id = 1;   // flagId
        uint256 alice_pledgement = 1 wei;

        hoax(alice, 10 ether);
        f.gamblePledge{value: alice_pledgement}(id);
        console2.log("contarct balance: ", address(f).balance);
        assertEq(100, f.getPools(id)[0]); // selfpool
        assertEq(alice_pledgement, f.getPools(id)[1]); // betspool


        // Bob gamble on the `flag-1`
        hoax(bob, 10 ether);
        uint256 bob_pledgement = 4 wei;
        f.gamblePledge{value: bob_pledgement}(id);
        console2.log("contarct balance: ", address(f).balance);
        assertEq(alice_pledgement + bob_pledgement, f.getPools(id)[1]); // betspool

        // Bob gamble on the `flag-1` again
        hoax(bob, 10 ether);
        uint256 bob_pledgement_2 = 5 wei;
        f.gamblePledge{value: bob_pledgement_2}(id);
        console2.log("contarct balance: ", address(f).balance);
        assertEq(alice_pledgement + bob_pledgement + bob_pledgement_2, f.getPools(id)[1]); // betspool
       
        // console2.log(" bettorsMap: ", f.bettorsMap[id]);
    }


    function testFlagDone() public {
        /*
         * forge test --mt testGamblePledge  -vvvv
         * 1. Finally, Fred achieve the goal.
         * 2. owner of the contract call this function the set the flag `Done` .
         * 3. `Fred` withdraw the money back and earn others pledge !!
         */
        testGamblePledge();

        uint256 id = 1;

        vm.prank(demian); // owner of the contract set the flag `Done` .
        f.setFlagDone(id);

        assertEq(110, f.getPools(id)[0]); // selfpool is `110`.
        assertEq(0, f.getPools(id)[1]);   // betspool is `0`.
        assertEq(0, f.getFunds());        // treasury funds.

        // fred withdraw the money. set fred's balance 1 ether.
        hoax(fred, 0 ether);
        f.flagerRetrive(id);
        assertEq(fred.balance, 110); 
    }


    function testFlagRug() public {
        /*
         * forge test --mt testFlagRug  -vvvv
         * 0. Finally, Fred fail the goal.
         * 1. owner of the contract call this function the set the flag `Rug` .
         * 2. fred can't refund the money, but bettors will get the money and bonus back!
         */
        testGamblePledge();
        uint256 id = 1;

        // 1. owner of the contract call this function the set the flag `Rug` .
        vm.prank(demian);
        f.setFlagRug(id);

        assertEq(0, f.getPools(id)[0]);   // selfpool is `0`.
        assertEq(0, f.getPools(id)[1]);   // betspool is `0`.
        assertEq(6, f.getBettorShares(id, alice));  // alice can get 6 wei.
        assertEq(54, f.getBettorShares(id, bob));   // bob can get 54 wei.
        assertEq(50, f.getFunds());       // treasury funds.

        // hoax(fred, 0 ether);
        // f.gamblersRetrive(id);
        // vm.expectRevert(bytes("Flag owner can not refund."));
        // err.throwError();  [Bug] here ?
        //     and gamblers split the payment.

        // refundGambler
        hoax(alice, 0);
        f.gamblersRetrive(id);
        assertEq(alice.balance, 6); 
        console2.log("alice balance:", alice.balance);


        hoax(bob, 0);
        f.gamblersRetrive(id);
        assertEq(bob.balance, 54); 
        console2.log("bob balance:", bob.balance);
    }



    /*
    function _send(uint256 amount) private {
        (bool ok,) = address(f).call{value: amount}("");
        require(ok, "send ETH failed");
    }

    function _util_return_balance(address addr, uint256 id) public view returns(uint256) {
        address[] memory addresses = new address[](1); // 声明动态数组并初始化
        uint256[] memory ids = new uint256[](1);
        addresses[0] = addr;   // 填充数组
        ids[0] = id;

        uint256[] memory balance = f.balanceOfBatch(addresses, ids);
        return balance[0];
    }
 */



    /*  ------------------------------------------------------------------------------------
     *  Alice gamble on the `flag-1`
     *  ------------------------------------------------------------------------------------ */
    function test_1_10000_GamblePledge() public {
        /*
         *  Alice gamble on the `flag-1`
         */
        testCreate();     // flager Fred pledge 100 wei.

        uint256 id = 1;   // flagId
        uint256 alice_pledgement = 1 wei;

        hoax(alice, 10 ether);
        f.gamblePledge{value: alice_pledgement}(id);
        console2.log("contarct balance: ", address(f).balance);
        assertEq(100, f.getPools(id)[0]); // selfpool
        assertEq(alice_pledgement, f.getPools(id)[1]); // betspool


        // Bob gamble on the `flag-1`
        hoax(bob, 10 ether);
        uint256 bob_pledgement = 10000 wei;
        f.gamblePledge{value: bob_pledgement}(id);
        console2.log("contarct balance: ", address(f).balance);
        assertEq(alice_pledgement + bob_pledgement, f.getPools(id)[1]); // betspool
    }

    function test_1_10000_FlagDone() public {
        /*
         * forge test --mt testGamblePledge  -vvvv
         * 1. Finally, Fred achieve the goal.
         * 2. owner of the contract call this function the set the flag `Done` .
         * 3. `Fred` withdraw the money back and earn others pledge !!
         */
        test_1_10000_GamblePledge();

        uint256 id = 1;

        vm.prank(demian); // owner of the contract set the flag `Done` .
        f.setFlagDone(id);

        assertEq(600, f.getPools(id)[0]);   // selfpool is `110`.
        assertEq(0,   f.getPools(id)[1]);   // betspool is `0`.
        assertEq(100+1+10000 - 600,   f.getFunds());        // treasury funds.

        // fred withdraw the money. set fred's balance 1 ether.
        hoax(fred, 0 ether);
        f.flagerRetrive(id);
        assertEq(fred.balance, 600); 
    }

    function test_1_10000_FlagRug() public {
        /*
         * forge test --mt testGamblePledge  -vvvv
         * 1. Finally, Fred achieve the goal.
         * 2. owner of the contract call this function the set the flag `Done` .
         * 3. `Fred` withdraw the money back and earn others pledge !!
         */
        test_1_10000_GamblePledge();

        uint256 id = 1;

        vm.prank(demian); // owner of the contract set the flag `Done` .
        f.setFlagRug(id);
        console2.log("/.....", f.getPools(id)[0], f.getPools(id)[1]);    // 0, 0

        assertEq(0, f.getPools(id)[0]);   // selfpool is `0`.
        assertEq(0, f.getPools(id)[1]);   // betspool is `0`.
        assertEq(1, f.getBettorShares(id, alice));  // alice can get 1 wei.
        assertEq(10099, f.getBettorShares(id, bob));   // bob can get 54 wei.
        assertEq(1, f.getFunds());       // treasury funds.

        // refundGambler
        hoax(alice, 0);
        f.gamblersRetrive(id);
        assertEq(alice.balance, 1); 
        console2.log("alice balance:", alice.balance);


        hoax(bob, 0);
        f.gamblersRetrive(id);
        assertEq(bob.balance, 10099); 
        console2.log("bob balance:", bob.balance);
    }



    /*  ------------------------------------------------------------------------------------
     *  Alice gamble on the `flag-1`
     *  ------------------------------------------------------------------------------------ */
    function test_1_GamblePledge() public {
        /*
         *  Alice gamble on the `flag-1`
         */
        testCreate();     // flager Fred pledge 100 wei.

        uint256 id = 1;   // flagId
        uint256 alice_pledgement = 1 wei;

        hoax(alice, 10 ether);
        f.gamblePledge{value: alice_pledgement}(id);
        console2.log("contarct balance: ", address(f).balance);
        assertEq(100, f.getPools(id)[0]); // selfpool
        assertEq(alice_pledgement, f.getPools(id)[1]); // betspool
    }

    function test_1_FlagDone() public {
        /*
         * forge test --mt testGamblePledge  -vvvv
         * 1. Finally, Fred achieve the goal.
         * 2. owner of the contract call this function the set the flag `Done` .
         * 3. `Fred` withdraw the money back and earn others pledge !!
         */
        test_1_GamblePledge();

        uint256 id = 1;

        vm.prank(demian); // owner of the contract set the flag `Done` .
        f.setFlagDone(id);

        assertEq(101, f.getPools(id)[0]);   // selfpool is `110`.
        assertEq(0,   f.getPools(id)[1]);   // betspool is `0`.
        assertEq(0,   f.getFunds());        // treasury funds.

        // fred withdraw the money. set fred's balance 1 ether.
        hoax(fred, 0 ether);
        f.flagerRetrive(id);
        assertEq(fred.balance, 101); 
    }

    function test_1_FlagRug() public {
        /*
         * forge test --mt testGamblePledge  -vvvv
         * 1. Finally, Fred achieve the goal.
         * 2. owner of the contract call this function the set the flag `Done` .
         * 3. `Fred` withdraw the money back and earn others pledge !!
         */
        test_1_GamblePledge();

        uint256 id = 1;

        vm.prank(demian); // owner of the contract set the flag `Done` .
        f.setFlagRug(id);
        console2.log("/.....", f.getPools(id)[0], f.getPools(id)[1]);    //0, 0

        assertEq(0, f.getPools(id)[0]);             // selfpool is `0`.
        assertEq(0, f.getPools(id)[1]);             // betspool is `0`.
        assertEq(6, f.getBettorShares(id, alice));  // alice can get 1 wei.
        assertEq(100 + 1 - 6, f.getFunds());        // treasury funds.

        // refundGambler
        hoax(alice, 0);
        f.gamblersRetrive(id);
        assertEq(alice.balance, 6); 
        console2.log("alice balance:", alice.balance);

    }


    /*  ------------------------------------------------------------------------------------
     *  Alice gamble on the `flag-1`
     *  ------------------------------------------------------------------------------------ */
    function test_10000_GamblePledge() public {
        /*
         *  Alice gamble on the `flag-1`
         */
        testCreate();     // flager Fred pledge 100 wei.

        uint256 id = 1;   // flagId
        uint256 alice_pledgement = 10000 wei;

        hoax(alice, 10 ether);
        f.gamblePledge{value: alice_pledgement}(id);
        console2.log("contarct balance: ", address(f).balance);
        assertEq(100, f.getPools(id)[0]); // selfpool
        assertEq(alice_pledgement, f.getPools(id)[1]); // betspool
    }

    function test_10000_FlagDone() public {
        /*
         * forge test --mt testGamblePledge  -vvvv
         * 1. Finally, Fred achieve the goal.
         * 2. owner of the contract call this function the set the flag `Done` .
         * 3. `Fred` withdraw the money back and earn others pledge !!
         */
        test_10000_GamblePledge();

        uint256 id = 1;

        vm.prank(demian); // owner of the contract set the flag `Done` .
        f.setFlagDone(id);

        assertEq(600, f.getPools(id)[0]);   // selfpool is `110`.
        assertEq(0,   f.getPools(id)[1]);   // betspool is `0`.
        assertEq(9500,   f.getFunds());        // treasury funds.

        // fred withdraw the money. set fred's balance 1 ether.
        hoax(fred, 0 ether);
        f.flagerRetrive(id);
        assertEq(fred.balance, 600); 
    }

    function test_10000_FlagRug() public {
        /*
         * forge test --mt testGamblePledge  -vvvv
         * 1. Finally, Fred achieve the goal.
         * 2. owner of the contract call this function the set the flag `Done` .
         * 3. `Fred` withdraw the money back and earn others pledge !!
         */
        test_10000_GamblePledge();

        uint256 id = 1;

        vm.prank(demian); // owner of the contract set the flag `Done` .
        f.setFlagRug(id);
        console2.log("/.....", f.getPools(id)[0], f.getPools(id)[1]);    //0, 0

        assertEq(0, f.getPools(id)[0]);             // selfpool is `0`.
        assertEq(0, f.getPools(id)[1]);             // betspool is `0`.
        assertEq(10100, f.getBettorShares(id, alice));  // alice can get 1 wei.
        assertEq(0, f.getFunds());        // treasury funds.

        // refundGambler
        hoax(alice, 0);
        f.gamblersRetrive(id);
        assertEq(10100, alice.balance); 
        console2.log("alice balance:", alice.balance);
    }



    function testUUPS() public {

        // address _newImplementation = address(0x01); // Use a non-zero initial value of choice.

        // 0xe99005bc0000000000000000000000000000000000000000000000000000000000000001
        emit log_bytes(
            abi.encodeCall(
                f._contractUpgradeTo, (address(0x01)) // _newImplementation 也行,, 方正都一样的结果...
            )
        );

        // cast sig "_contractUpgradeTo(address _newImplementation)" -> 0xe99005bc, but not work.
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
