// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {TestHelpers} from "./01_Helpers.t.sol";

import {

    // errors
    BioVerify_MustPayReviewerStake
} from "../src/BioVerifyV3.sol";

// ================================================================
// REVIEWER ONBOARDING - PAY REVIEWER STAKE
// ================================================================

contract PayReviewerStakeTest is TestHelpers {
    function test_PayReviewerStake_Success() public {
        vm.deal(user, reviewerStake);

        _expectEmit_MemberAvailableStake(user, reviewerStake);
        _expectEmit_IsAvailableReviewer(user, true, 0);

        vm.prank(user);
        bioVerify.payReviewerStake{value: reviewerStake}();

        assertEq(address(bioVerify).balance, DEPLOY_VALUE + reviewerStake);
    }

    // ===== unhappy path
    function test_RevertIf_IncorrectStakeAmount() public {
        vm.deal(user, 1 ether);
        vm.prank(user);

        // Try to pay double the stake
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayReviewerStake.selector));

        bioVerify.payReviewerStake{value: reviewerStake * 2}();
    }
}
