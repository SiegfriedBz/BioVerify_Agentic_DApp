// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./01_Helpers.t.sol";

import {

    // errors
    BioVerify_MustPayReviewerStake
} from "../src/BioVerifyV3.sol";

// ================================================================
// REVIEWER ONBOARDING - PAY REVIEWER STAKE
// ================================================================

contract PayReviewerStakeTest is TestHelpers {
    function test_PayReviewerStake_Success() public {
        vm.deal(user, REVIEWER_STAKE);

        _expectEmit_MemberAvailableStake(user, REVIEWER_STAKE);
        _expectEmit_IsAvailableReviewer(user, true, 0);

        vm.prank(user);
        bioVerify.payReviewerStake{value: REVIEWER_STAKE}();

        assertEq(address(bioVerify).balance, DEPLOYMENT_VALUE + REVIEWER_STAKE);
    }

    // ===== unhappy path
    function test_RevertIf_IncorrectStakeAmount() public {
        vm.deal(user, 1 ether);
        vm.prank(user);

        // Try to pay double the stake
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayReviewerStake.selector));

        bioVerify.payReviewerStake{value: REVIEWER_STAKE * 2}();
    }
}
