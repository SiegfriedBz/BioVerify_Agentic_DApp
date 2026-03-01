// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./01_Helpers.t.sol";
import {

    //  errors
    BioVerify_InsufficientReviewersPool,
    BioVerify_AlreadyInReview,
    BioVerify_OnlyAgent,
    BioVerify_InsufficientRewardPool
} from 

"../src/BioVerifyV3.sol";

contract PickReviewersTest is TestHelpers {
    function test_PickReviewers_Success() public {
        // Setup: publish publication
        _submitDefaultPub();
        // Ensure reviewers pool has enough candidates
        _fillValidReviewerPool();

        vm.startPrank(aiAgentAddress);

        // 1. Check Events
        _expectEmit_NewPublicationStatus(0, PublicationStatus.IN_REVIEW);

        // Note: requestId is 1 because it's the first request to the mock
        _expectEmit_Agent_RequestVRF(0, 1);

        // 2. Execute
        uint256 requestId = bioVerify.pickReviewers(0);

        // 3. Verify
        assertEq(requestId, 1);
        vm.stopPrank();
    }

    // ===== unhappy path

    function test_RevertIf_AlreadyInReview() public {
        // Setup: publish publication
        _submitDefaultPub();
        // Ensure reviewers pool has enough candidates
        _fillValidReviewerPool();

        vm.startPrank(aiAgentAddress);
        bioVerify.pickReviewers(0);

        // Attempting to pick again while status is already IN_REVIEW
        vm.expectRevert(abi.encodeWithSelector(BioVerify_AlreadyInReview.selector, 0));
        bioVerify.pickReviewers(0);
        vm.stopPrank();
    }

    function test_RevertIf_PoolTooSmall() public {
        // Setup: publish publication
        _submitDefaultPub();

        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientReviewersPool.selector, 0));
        bioVerify.pickReviewers(0);
    }

    function test_PickReviewers_RevertIf_InsufficientRewardPool() public {
        BioVerifyV3 poorContract = new BioVerifyV3{value: 0}(_getMockConfig());

        // Submit publication
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        poorContract.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // Fill reviewers pool
        for (uint256 i = 0; i < VALID_MIN_REVIEWERS_POOL_SIZE; ++i) {
            address rev = makeAddr(string(abi.encodePacked("reviewer_", i)));
            vm.deal(rev, REVIEWER_STAKE);
            vm.prank(rev);
            poorContract.payReviewerStake{value: REVIEWER_STAKE}();
        }

        // Execute
        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientRewardPool.selector, 0));
        poorContract.pickReviewers(0);
    }

    function test_RevertIf_NotAgent() public {
        // Setup: publish publication
        _submitDefaultPub();
        // Ensure reviewers pool has enough candidates
        _fillValidReviewerPool();

        vm.prank(publisher);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_OnlyAgent.selector));
        bioVerify.pickReviewers(0);
    }
}
