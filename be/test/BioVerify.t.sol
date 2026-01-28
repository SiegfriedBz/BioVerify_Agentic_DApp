// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {BioVerifyScript} from "../script/BioVerify.s.sol";
import {Constants} from "../script/Constants.sol";
import {
    BioVerify,

    // events
    BioVerify_SubmittedPublication,

    // errors
    BioVerify_MustPayToSubmit
} from "../src/BioVerify.sol";

contract BioVerifyTest is Test, Constants {
    BioVerifyScript public deployer;
    BioVerify public bioVerify;

    address publisher = makeAddr(" publisher");
    string constant FAKE_CID = "ipfs://test-hash";

    function setUp() public {
        deployer = new BioVerifyScript();
        bioVerify = deployer.run();
    }

    function test_Deployment() public view {
        assertEq(bioVerify.I_SUBMISSION_FEE(), SUBMISSION_FEE);
        assertEq(bioVerify.I_MIN_STAKE(), MIN_STAKE);
    }

    /**
     * SubmitPublication
     */
    // SubmitPublication - happy path
    function test_SubmitPublication_EmitsCorrectEvent() public {
        uint256 totalToSend = SUBMISSION_FEE + MIN_STAKE + 50 wei; // Sending extra to test stake logic

        // 1. Give the  publisher some money
        vm.deal(publisher, 1 ether);

        // 2. Expect the event to be emitted
        // [checkTopic1, checkTopic2, checkTopic3, checkData]
        vm.expectEmit(true, false, false, true);
        emit BioVerify_SubmittedPublication(publisher, 0, FAKE_CID);

        // 3. Perform the call
        vm.prank(publisher);
        bioVerify.submitPublication{value: totalToSend}(FAKE_CID);
    }

    function test_SubmitPublication_RecordsCorrectAmountOnContract() public {
        uint256 totalToSend = SUBMISSION_FEE + MIN_STAKE + 50 wei; // Sending extra to test stake logic

        // 1. Give the  publisher some money
        vm.deal(publisher, 1 ether);

        // 2. Perform the call
        vm.prank(publisher);
        bioVerify.submitPublication{value: totalToSend}(FAKE_CID);

        // 3. Assertions
        assertEq(address(bioVerify).balance, totalToSend);
    }

    function test_SubmitPublication_StekesCorrectAmountOnPublication() public {
        uint256 totalToSend = SUBMISSION_FEE + MIN_STAKE + 50 wei; // Sending extra to test stake logic

        // 1. Give the  publisher some money
        vm.deal(publisher, 1 ether);

        // 2. Perform the call
        vm.prank(publisher);
        bioVerify.submitPublication{value: totalToSend}(FAKE_CID);

        // 3. Assertions
        uint256 expectedStake = totalToSend - SUBMISSION_FEE;
        assertEq(bioVerify.publicationTotalStake(0), expectedStake);
    }

    // SubmitPublication - unhappy path
    function test_SubmitPublication_RevertIfZeroValueSent() public {
        uint256 totalToSend = 0;

        // 1. Give the  publisher some money
        vm.deal(publisher, 1 ether);

        // 2. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayToSubmit.selector));

        // 3. Perform the call
        vm.prank(publisher);
        bioVerify.submitPublication{value: totalToSend}(FAKE_CID);
    }
}
