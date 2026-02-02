// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {BioVerifyScript} from "../script/BioVerify.s.sol";
import {Constants} from "../script/Constants.sol";
import {
    BioVerify,

    // events
    BioVerify_SubmittedPublication,
    BioVerify_SlashedPublisher,
    BioVerify_TransferTotalSlashed,

    // errors
    BioVerify_MustPayToSubmit,
    BioVerify_OnlyAgent,
    BioVerify_InvalidPublicationId,
    BioVerify_AlreadySlashed,
    BioVerify_ZeroValueToTransfer
} from "../src/BioVerify.sol";

contract BioVerifyTest is Test, Constants {
    BioVerifyScript public deployer;
    BioVerify public bioVerify;

    string constant FAKE_CID = "ipfs://test-hash";
    address publisher = makeAddr("publisher");
    address user = makeAddr("user");
    address aiAgentAddress = vm.envAddress("AI_AGENT_ADDRESS");
    address treasuryAddress = vm.envAddress("TREASURY_ADDRESS");

    function setUp() public {
        deployer = new BioVerifyScript();
        bioVerify = deployer.run();
    }

    function test_Deployment() public view {
        assertEq(bioVerify.I_AI_AGENT_ADDRESS(), aiAgentAddress);
        assertEq(bioVerify.I_TREASURY_ADDRESS(), treasuryAddress);
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

    /**
     * slashPublisher
     */
    // slashPublisher - happy path
    function test_SlashPublisher_ClearsStakeAndIncrementsTotalSlashed() public {
        uint256 stakeAmount = MIN_STAKE + 20 wei;
        uint256 totalToSend = SUBMISSION_FEE + stakeAmount;
        vm.deal(publisher, 1 ether);

        // 1. Submit
        vm.prank(publisher);
        bioVerify.submitPublication{value: totalToSend}(FAKE_CID);

        // 2. Slash (Prank as the Agent)
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        // 3. Assertions
        assertEq(bioVerify.publicationTotalStake(0), 0);
        assertEq(bioVerify.publicationStakes(0, publisher), 0);
        assertEq(bioVerify.totalSlashed(), stakeAmount);

        // Check status is SLASHED
        BioVerify.Publication memory publication = bioVerify.getFullPublication(0);
        assertEq(uint256(publication.status), 4);
    }

    function test_SlashPublisher__EmitsCorrectEvent() public {
        uint256 stakeAmount = MIN_STAKE + 20 wei;
        uint256 totalToSend = SUBMISSION_FEE + stakeAmount;
        vm.deal(publisher, 1 ether);

        // 1. Submit
        vm.prank(publisher);
        bioVerify.submitPublication{value: totalToSend}(FAKE_CID);

        // 2. Expect the event to be emitted
        // [checkTopic1, checkTopic2, checkTopic3, checkData]
        vm.expectEmit(true, false, false, true);
        // BioVerify_SlashedPublisher(_publicationId, publisher)
        emit BioVerify_SlashedPublisher(0, publisher);

        // 3. Perform the call
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);
    }

    // slashPublisher - unhappy path
    function test_SlashPublisher_RevertIfNotAgentCall() public {
        uint256 stakeAmount = MIN_STAKE + 20 wei;
        uint256 totalToSend = SUBMISSION_FEE + stakeAmount;
        vm.deal(publisher, 1 ether);

        // 1. Submit
        vm.prank(publisher);
        bioVerify.submitPublication{value: totalToSend}(FAKE_CID);

        // 2. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_OnlyAgent.selector));

        // 3. Slash (Prank as Not Agent)
        vm.prank(user);
        bioVerify.slashPublisher(0);
    }

    function test_SlashPublisher_RevertIfPublicationIdNotValid() public {
        uint256 invalidPublicationId = 1;
        uint256 stakeAmount = MIN_STAKE + 20 wei;
        uint256 totalToSend = SUBMISSION_FEE + stakeAmount;
        vm.deal(publisher, 1 ether);

        // 1. Submit
        vm.prank(publisher);
        bioVerify.submitPublication{value: totalToSend}(FAKE_CID);

        // 2. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InvalidPublicationId.selector, invalidPublicationId));

        // 3. Slash (Prank as Agent)
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(invalidPublicationId);
    }

    function test_SlashPublisher_RevertIfAlreadySlashed() public {
        uint256 stakeAmount = MIN_STAKE + 20 wei;
        uint256 totalToSend = SUBMISSION_FEE + stakeAmount;
        vm.deal(publisher, 1 ether);

        // 1. Submit
        vm.prank(publisher);
        bioVerify.submitPublication{value: totalToSend}(FAKE_CID);

        // 2. Slash (Prank as Agent)
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        // 4. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_AlreadySlashed.selector, 0));

        // 5. Slash (Prank as Agent) again Publication
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);
    }

    /**
     * transferTotalSlashed
     */
    // transferTotalSlashed - happy path
    function test_TransferTotalSlashed_MovesFundsToTreasury() public {
        // 1. Setup a slashed amount
        uint256 stakeAmount = 100 wei;
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: SUBMISSION_FEE + stakeAmount}(FAKE_CID);

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        // 2. Record initial balance of treasury
        uint256 initialTreasuryBalance = treasuryAddress.balance;

        // 3. Trigger transfer as Agent
        vm.prank(aiAgentAddress);
        bioVerify.transferTotalSlashed();

        // 4. Assertions
        assertEq(treasuryAddress.balance, initialTreasuryBalance + stakeAmount);
        assertEq(bioVerify.totalSlashed(), 0);
    }

    function test_TransferTotalSlashed_EmitCorrectEvent() public {
        // 1. Setup a slashed amount
        uint256 stakeAmount = 100 wei;
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: SUBMISSION_FEE + stakeAmount}(FAKE_CID);

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        // 2. Expect the event to be emitted
        // [checkTopic1, checkTopic2, checkTopic3, checkData]
        vm.expectEmit(true, false, false, true);
        //  BioVerify_TransferTotalSlashed(I_TREASURY_ADDRESS, value);
        emit BioVerify_TransferTotalSlashed(treasuryAddress, stakeAmount);

        // 3. Perform the call - Trigger transfer as Agent
        vm.prank(aiAgentAddress);
        bioVerify.transferTotalSlashed();
    }

    // transferTotalSlashed - unhappy path
    function test_TransferTotalSlashed_RevertIfNotAgentCall() public {
        // 1. Setup a slashed amount
        uint256 stakeAmount = 100 wei;
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: SUBMISSION_FEE + stakeAmount}(FAKE_CID);

        // 2. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_OnlyAgent.selector));

        // 3. Perform the call - Trigger transfer as Not Agent
        vm.prank(user);
        bioVerify.transferTotalSlashed();
    }

    function test_TransferTotalSlashed_RevertIfZeroValueToTransfer() public {
        // 1. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_ZeroValueToTransfer.selector));

        // 2. Perform the call - Trigger transfer as Agent
        vm.prank(aiAgentAddress);
        bioVerify.transferTotalSlashed();
    }
}

