// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./01_Helpers.t.sol";
import {

    // errors
    BioVerify_OnlyAgent,
    BioVerify_InvalidPublicationId,
    BioVerify_InvalidReviewerCount,
    BioVerify_MemberNotReviewerForThisPub,
    BioVerify_CanNotSettle
} from 

"../src/BioVerifyV3.sol";

contract PublishPublicationTest is TestHelpers {
    function test_PublishPublication_DynamicPool_Success() public {
        // --- 1. SETUP ---
        // publish publication
        _submitDefaultPub();
        // Ensure reviewers pool has enough candidates
        _fillValidReviewerPool();

        // Construct Honest/Negligent arrays (3/4 split)
        uint256 honestCount = (VRF_NUM_WORDS * 3) / 4;
        if (honestCount == 0) honestCount = 1;
        uint256 negligentCount = VRF_NUM_WORDS - honestCount;

        address[] memory honest = new address[](honestCount);
        address[] memory negligent = new address[](negligentCount);

        for (uint256 i = 0; i < honestCount; i++) {
            honest[i] = makeAddr(string(abi.encodePacked("reviewer_", i)));
        }
        for (uint256 i = 0; i < negligentCount; i++) {
            negligent[i] = makeAddr(string(abi.encodePacked("reviewer_", i + honestCount)));
        }

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);

        // Enforce VRF picked words
        uint256[] memory words = new uint256[](VRF_NUM_WORDS);
        for (uint256 i = 0; i < VRF_NUM_WORDS; ++i) {
            words[i] = i;
        }

        vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, address(bioVerify), words);

        // --- 2. EXPECTATIONS: PUBLISHER ---
        // Publisher gets back their stake only
        uint256 remainingLocked = PUBLISHER_STAKE + (VRF_NUM_WORDS * REVIEWER_STAKE);
        remainingLocked -= PUBLISHER_STAKE;

        _expectEmit_RewardMember(publisher);
        _expectEmit_MemberReputation(publisher, REPUTATION_BOOST);
        _expectEmit_MemberLockedStake(publisher, 0);
        _expectEmit_MemberLockedStakeOnPubId(publisher, 0, 0);
        _expectEmit_LockedStakeOnPubId(0, remainingLocked);
        _expectEmit_MemberAvailableStake(publisher, PUBLISHER_STAKE);

        // --- 3. EXPECTATIONS: HONEST REVIEWERS ---
        for (uint256 i = 0; i < honestCount; i++) {
            remainingLocked -= REVIEWER_STAKE;

            _expectEmit_RewardMember(honest[i]);
            _expectEmit_MemberReputation(honest[i], REPUTATION_BOOST);
            _expectEmit_MemberLockedStake(honest[i], 0);
            _expectEmit_MemberLockedStakeOnPubId(honest[i], 0, 0);
            _expectEmit_LockedStakeOnPubId(0, remainingLocked);
            _expectEmit_MemberAvailableStake(honest[i], REVIEWER_STAKE + REVIEWER_REWARD);
            _expectEmit_IsAvailableReviewer(honest[i], true, 0);
        }

        // --- 4. EXPECTATIONS: NEGLIGENT REVIEWERS ---
        // Reward pool after fulfillRandomWords has deducted total rewards
        uint256 runningRewardPool = DEPLOYMENT_VALUE - (VRF_NUM_WORDS * REVIEWER_REWARD);
        uint256 runningSlashPool = 0;

        for (uint256 i = 0; i < negligentCount; i++) {
            remainingLocked -= REVIEWER_STAKE;
            runningRewardPool += REVIEWER_REWARD;
            runningSlashPool += REVIEWER_STAKE;

            _expectEmit_SlashMember(negligent[i]);
            _expectEmit_MemberReputation(negligent[i], 0);
            _expectEmit_MemberLockedStake(negligent[i], 0);
            _expectEmit_MemberLockedStakeOnPubId(negligent[i], 0, 0);
            _expectEmit_LockedStakeOnPubId(0, remainingLocked);

            _expectEmit_SlashPool(runningSlashPool);
            _expectEmit_RewardPool(runningRewardPool);
            _expectEmit_IsAvailableReviewer(negligent[i], false, 0);
        }

        // --- 5. FINALIZATION ---
        _expectEmit_Agent_FinalizePublication(0, FAKE_VERDICT_CID, PublicationStatus.PUBLISHED);

        // --- 6. EXECUTION ---
        vm.prank(aiAgentAddress);
        bioVerify.publishPublication(0, honest, negligent, FAKE_VERDICT_CID);
    }

    // ===== unhappy path
    function test_PublishPublication_RevertIf_Not_InReview() public {
        // 1. Setup: Submit but DO NOT pick reviewers (Status stays SUBMITTED)
        _submitDefaultPub();

        // 2. Prepare valid length arrays to bypass the ReviewerCount check
        address[] memory honest = new address[](VRF_NUM_WORDS);
        address[] memory negligent = new address[](0);

        // 3. Execution: Revert because Status is SUBMITTED, not IN_REVIEW
        vm.prank(aiAgentAddress);
        vm.expectRevert(
            abi.encodeWithSelector(
                BioVerify_CanNotSettle.selector,
                0, // _pubId
                PublicationStatus.SUBMITTED, // current status
                PublicationStatus.PUBLISHED // attempted status
            )
        );
        bioVerify.publishPublication(0, honest, negligent, FAKE_VERDICT_CID);
    }

    function test_PublishPublication_RevertIf_InvalidReviewerCount() public {
        // --- 1. SETUP ---
        _submitDefaultPub();
        _fillValidReviewerPool();

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);

        // Fulfill VRF normally
        uint256[] memory words = new uint256[](VRF_NUM_WORDS);
        for (uint256 i = 0; i < VRF_NUM_WORDS; ++i) {
            words[i] = i;
        }
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, address(bioVerify), words);

        // --- 2. CONSTRUCT INVALID ARRAYS ---
        // We intentionally make the total count different from VRF_NUM_WORDS
        // If VRF_NUM_WORDS is 4, we provide 3.
        uint256 totalProvided = VRF_NUM_WORDS - 1;

        address[] memory honest = new address[](totalProvided);
        address[] memory negligent = new address[](0);

        for (uint256 i = 0; i < totalProvided; i++) {
            honest[i] = makeAddr(string(abi.encodePacked("reviewer_", i)));
        }

        // --- 3. EXECUTION & EXPECTED REVERT ---
        vm.expectRevert(BioVerify_InvalidReviewerCount.selector);
        vm.prank(aiAgentAddress);
        bioVerify.publishPublication(0, honest, negligent, FAKE_VERDICT_CID);
    }

    function test_PublishPublication_RevertIf_HonestNotReviewer() public {
        // --- 1. SETUP ---
        _submitDefaultPub();
        _fillValidReviewerPool();

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);

        // Enforce VRF picked words
        uint256[] memory words = new uint256[](VRF_NUM_WORDS);
        for (uint256 i = 0; i < VRF_NUM_WORDS; i++) {
            words[i] = i;
        }
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, address(bioVerify), words);

        // --- 2. CONSTRUCT MALICIOUS ARRAY ---
        address[] memory honestButHacked = new address[](VRF_NUM_WORDS);
        address[] memory negligent = new address[](0);

        for (uint256 i = 0; i < VRF_NUM_WORDS; i++) {
            honestButHacked[i] = makeAddr(string(abi.encodePacked("reviewer_", i)));
        }
        address imposter = makeAddr("imposter"); // This address was never picked
        honestButHacked[0] = imposter;

        // --- 3. EXECUTION ---
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MemberNotReviewerForThisPub.selector, imposter, 0));

        vm.prank(aiAgentAddress);
        bioVerify.publishPublication(0, honestButHacked, negligent, FAKE_VERDICT_CID);
    }

    function test_PublishPublication_RevertIf_NegligentNotReviewer() public {
        // --- 1. SETUP ---
        _submitDefaultPub();
        _fillValidReviewerPool();

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);

        // Enforce VRF picked words
        uint256[] memory words = new uint256[](VRF_NUM_WORDS);
        for (uint256 i = 0; i < VRF_NUM_WORDS; i++) {
            words[i] = i;
        }
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, address(bioVerify), words);

        // --- 2. CONSTRUCT MALICIOUS ARRAY ---
        address[] memory honest = new address[](0);
        address[] memory negligentButHacked = new address[](VRF_NUM_WORDS);

        for (uint256 i = 0; i < VRF_NUM_WORDS; i++) {
            negligentButHacked[i] = makeAddr(string(abi.encodePacked("reviewer_", i)));
        }
        address imposter = makeAddr("imposter"); // This address was never picked
        negligentButHacked[0] = imposter;

        // --- 3. EXECUTION ---
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MemberNotReviewerForThisPub.selector, imposter, 0));

        vm.prank(aiAgentAddress);
        bioVerify.publishPublication(0, honest, negligentButHacked, FAKE_VERDICT_CID);
    }

    function test_PublishPublication_RevertIf_NotAgent() public {
        // --- 1. SETUP ---
        // publish publication
        _submitDefaultPub();

        vm.expectRevert(BioVerify_OnlyAgent.selector);
        bioVerify.publishPublication(0, new address[](0), new address[](0), "verdict");
    }

    function test_PublishPublication_RevertIf_InvalidPubId() public {
        uint256 nonExistentId = 999; // nextPubId starts at 0

        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InvalidPublicationId.selector, nonExistentId));
        bioVerify.publishPublication(nonExistentId, new address[](0), new address[](0), "verdict");
    }
}
