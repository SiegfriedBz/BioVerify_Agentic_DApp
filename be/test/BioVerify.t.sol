// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {BioVerifyScript} from "../script/BioVerify.s.sol";
import {Constants} from "../script/Constants.sol";
import {
    BioVerify,

    // events
    BioVerify_SubmittedProject
} from "../src/BioVerify.sol";

contract BioVerifyTest is Test, Constants {
    BioVerifyScript public deployer;
    BioVerify public bioVerify;

    address scientist = makeAddr("scientist");

    function setUp() public {
        deployer = new BioVerifyScript();
        bioVerify = deployer.run();
    }

    function test_Deployment() public view {
        assertEq(bioVerify.I_SUBMISSION_FEE(), SUBMISSION_FEE);
        assertEq(bioVerify.I_MIN_STAKE(), MIN_STAKE);
    }

    function test_SubmitPublication() public {
        string memory cid = "ipfs://test-hash";
        uint256 totalToSend = SUBMISSION_FEE + MIN_STAKE + 50 wei; // Sending extra to test stake logic

        // 1. Give the scientist some money
        vm.deal(scientist, 1 ether);

        // 2. Expect the event to be emitted
        // [checkTopic1, checkTopic2, checkTopic3, checkData]
        vm.expectEmit(true, false, false, true);
        emit BioVerify_SubmittedProject(scientist, 0, cid);

        // 3. Perform the call
        vm.prank(scientist);
        bioVerify.submitPublication{value: totalToSend}(cid);

        // 4. Assertions
        uint256 expectedStake = totalToSend - SUBMISSION_FEE;
        assertEq(bioVerify.totalProjectStake(0), expectedStake);
        assertEq(address(bioVerify).balance, totalToSend);
    }
}
