// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Vm} from "forge-std/Vm.sol";
import {TestHelpers} from "./01_Helpers.t.sol";
import {
    BioVerifyV3,

    //  errors
    BioVerify_InsufficientReviewersPool,
    BioVerify_InsufficientRewardPool
} from "../src/BioVerifyV3.sol";

contract FulfillVRFTest is TestHelpers {
    function test_FulfillRandomWords_Success() public {
        // --- 1. SETUP ---
        // publish publication
        _submitDefaultPub();
        // Ensure reviewers pool has enough candidates
        _fillValidReviewerPool();

        uint256 rewardPoolInit = bioVerify.rewardPool();

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);
        // Since all reputations are 0, reviewer_0 remains Senior.
        uint256 idx = 0;
        address senior = makeAddr(string(abi.encodePacked("reviewer_", idx)));

        uint256 numOfPeers = vrfNumWords - 1;
        address[] memory peers = new address[](numOfPeers);
        for (uint256 i = 0; i < numOfPeers; ++i) {
            peers[i] = makeAddr(string(abi.encodePacked("reviewer_", i + 1)));
        }

        // 2. Setup Expectations
        uint256 expectedRewardPool = rewardPoolInit - (vrfNumWords * reviewerReward);
        _expectEmit_RewardPool(expectedRewardPool);
        _expectEmit_Agent_PickReviewers(0, publisher, peers, senior, FAKE_CID);

        // 3. Enforce VRF picked words & Execute
        uint256[] memory words = new uint256[](vrfNumWords);

        for (uint256 i = 0; i < vrfNumWords; ++i) {
            words[i] = i;
        }

        vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, address(bioVerify), words);

        // Verification of State
        assertEq(bioVerify.rewardPool(), expectedRewardPool);
    }

    function test_FulfillRandomWords_LoopBypassLogic() public {
        // --- 1. SETUP ---
        // publish publication
        _submitDefaultPub();
        // Ensure reviewers pool has enough candidates
        _fillValidReviewerPool();

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);
        uint256 initialRewardPool = bioVerify.rewardPool();

        // The rewardPool is reduced by REWARD, not STAKE.
        uint256 expectedRewardPoolDeduction = vrfNumWords * reviewerReward;
        // The STAKE is what gets locked, not deducted from the pool.
        uint256 expectedTotalLockedStake = vrfNumWords * reviewerStake;

        // Force collision: All VRF words are identical
        uint256[] memory words = new uint256[](vrfNumWords);
        for (uint256 i = 0; i < vrfNumWords; i++) {
            words[i] = 1;
        }

        vm.recordLogs();
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, address(bioVerify), words);

        Vm.Log[] memory entries = vm.getRecordedLogs();
        address[] memory lockedReviewers = new address[](vrfNumWords);
        uint256 uniqueCount = 0;
        uint256 totalDetectedLockStake = 0;
        bytes32 eventSig = keccak256("MemberLockedStakeOnPubId(address,uint256,uint256)");

        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == eventSig) {
                address decodedAddress = address(uint160(uint256(entries[i].topics[1])));
                uint256 amountLocked = abi.decode(entries[i].data, (uint256));

                totalDetectedLockStake += amountLocked;

                // Validate uniqueness
                for (uint256 j = 0; j < uniqueCount; j++) {
                    if (lockedReviewers[j] == decodedAddress) {
                        revert("Duplicate reviewer detected in selection");
                    }
                }

                lockedReviewers[uniqueCount] = decodedAddress;
                uniqueCount++;
            }
        }

        // --- ASSERTIONS ---
        // 1. Verify unique reviewers were actually picked (proves the 'while' loop collision logic works)
        assertEq(uniqueCount, vrfNumWords);

        // 2. Verify the correct amount of STAKE was locked
        assertEq(totalDetectedLockStake, expectedTotalLockedStake);

        // 3. Verify the REWARD POOL only dropped by the Reward amount, not the Stake amount
        assertEq(bioVerify.rewardPool(), initialRewardPool - expectedRewardPoolDeduction);
    }

    // ===== unhappy path
    function test_FulfillRandomWords_RevertIf_PoolShrinksDuringVRF() public {
        // 1. Setup: Submit and fill the pool with exactly enough reviewers
        _submitDefaultPub();
        _fillValidReviewerPool();

        // 2. Identify a reviewer to remove
        uint256 idx = 0;
        address reviewerToLeave = makeAddr(string(abi.encodePacked("reviewer_", idx)));

        // 3. Request VRF
        vm.prank(aiAgentAddress);
        uint256 reqId = bioVerify.pickReviewers(0);

        // 4. The reviewer leaves the pool, dropping size below I_vrfNumWords + 1
        vm.prank(reviewerToLeave);
        bioVerify.claim(reviewerStake);

        // 5. Prepare random words
        uint256[] memory words = new uint256[](vrfNumWords);
        for (uint256 i = 0; i < vrfNumWords; i++) {
            words[i] = i;
        }

        // 6. Execution: Call rawFulfillRandomWords directly pranking the coordinator.
        // This bypasses the mock's "catch" block, allowing vm.expectRevert to see the error.
        vm.prank(address(vrfCoordinatorMock));
        vm.expectRevert(
            abi.encodeWithSelector(
                BioVerify_InsufficientReviewersPool.selector,
                vrfNumWords // The pool size is now exactly I_vrfNumWords, but needs +1
            )
        );
        bioVerify.rawFulfillRandomWords(reqId, words);
    }

    function test_FulfillRandomWords_RevertIf_RewardsDepletedDuringVRF() public {
        // 1. Setup contract with 0 initial rewards
        BioVerifyV3 poorContract = new BioVerifyV3{value: 0}(_getMockConfig());
        vrfCoordinatorMock.addConsumer(vrfMockSubscriptionId, address(poorContract));

        // 2. Submit 2 publications
        vm.deal(publisher, 2 ether);
        vm.startPrank(publisher);
        poorContract.submitPublication{value: validPaidPublisherAmount}(FAKE_CID, publisherMinFee);
        poorContract.submitPublication{value: validPaidPublisherAmount}(FAKE_CID, publisherMinFee);
        vm.stopPrank();

        // 3. Fill reviewers pool
        for (uint256 i = 0; i < (vrfNumWords * 2) + 1; i++) {
            address rev = makeAddr(string(abi.encodePacked("large_pool_rev_", i)));
            vm.deal(rev, reviewerStake);
            vm.prank(rev);
            poorContract.payReviewerStake{value: reviewerStake}();
        }

        // 4. FUND FOR 1 FULFILLMENTS ONLY
        // Both pickReviewers calls check if enough rewards for 1 fullfillment.
        uint256 rewardsForOnefillment = vrfNumWords * reviewerReward;

        vm.deal(address(this), rewardsForOnefillment);
        (bool success,) = address(poorContract).call{value: rewardsForOnefillment}("");
        require(success, "Transfer failed");

        // 5. Request reviewers for both (Both pass the reward check >= vrfNumWords * REVIEWER_REWARD)
        vm.startPrank(aiAgentAddress);
        uint256 req1 = poorContract.pickReviewers(0);
        uint256 req2 = poorContract.pickReviewers(1);
        vm.stopPrank();

        // 6. Fulfill the first one
        // This SUBTRACTS 1 rewardsForOnefillment from the rewardPool. Remaining: 0.
        uint256[] memory wordsOne = new uint256[](vrfNumWords);
        for (uint256 i = 0; i < vrfNumWords; ++i) {
            wordsOne[i] = i;
        }
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(req1, address(poorContract), wordsOne);

        // 8. Second fulfillment - Should now hit the reward check
        // It checks (pool >= vrfNumWords * REVIEWER_REWARD). Pool is only 0 REVERT!
        uint256[] memory wordsTwo = new uint256[](vrfNumWords);
        for (uint256 i = 0; i < vrfNumWords; ++i) {
            wordsTwo[i] = i + vrfNumWords;
        }

        vm.prank(address(vrfCoordinatorMock));
        // The expected balance in the error will be the 0 left in the pool
        uint256 remainingPool = 0;
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientRewardPool.selector, remainingPool));

        poorContract.rawFulfillRandomWords(req2, wordsTwo);
    }
}
