// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {TestHelpers} from "./01_Helpers.t.sol";
import {BioVerify_OnlyAgent, BioVerify_InvalidPublicationId} from "../src/BioVerifyV3.sol";

contract RecordReviewTest is TestHelpers {
    function test_RecordReview_Success() public {
        // Setup: publish publication
        _submitDefaultPub();
        // Ensure reviewers pool has enough candidates
        _fillValidReviewerPool();

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);

        // Mock VRF Fulfill to assign reviewers
        vrfCoordinatorMock.fulfillRandomWords(requestId, address(bioVerify));

        // Use a reviewer from the pool (reviewer_0 created by _fillValidReviewerPool)
        address reviewer = makeAddr("reviewer_0");

        _expectEmit_Agent_RecordReview(reviewer, 0);

        vm.prank(aiAgentAddress);
        bioVerify.recordReview(0, reviewer);
    }

    // ===== unhappy path
    function test_RecordReview_RevertIf_NotAgent() public {
        // Setup: publish publication
        _submitDefaultPub();

        vm.expectRevert(BioVerify_OnlyAgent.selector);
        vm.prank(user);
        bioVerify.recordReview(0, user);
    }

    function test_RecordReview_RevertIf_InvalidPubId() public {
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InvalidPublicationId.selector, 99));
        vm.prank(aiAgentAddress);
        bioVerify.recordReview(99, user);
    }
}
