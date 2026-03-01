// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./01_Helpers.t.sol";
import {

    // errors
    BioVerify_NotAMember,
    BioVerify_ClaimTooMuch,
    BioVerify_ClaimFailTransferTo
} from "../src/BioVerifyV3.sol";

contract ClaimTest is TestHelpers {
    // test claim just after payReviewerStake
    function test_Claim_Success() public {
        // 1. Setup: Make a user a member with available stake
        vm.startPrank(user);
        vm.deal(user, REVIEWER_STAKE);
        bioVerify.payReviewerStake{value: REVIEWER_STAKE}();

        uint256 claimAmount = REVIEWER_STAKE / 4;
        uint256 expectedRemaining = REVIEWER_STAKE - claimAmount;
        uint256 expectedContractBalance = address(bioVerify).balance - claimAmount;

        // 2. Expectations
        _expectEmit_MemberAvailableStake(user, expectedRemaining);
        _expectEmit_IsAvailableReviewer(user, false, 0);
        _expectEmit_Claim(user, claimAmount, expectedRemaining, expectedContractBalance);

        // 3. Execution
        bioVerify.claim(claimAmount);
        vm.stopPrank();

        // 4. Final Assertion
        assertEq(user.balance, claimAmount, "Unexpected User Balance");
        assertEq(address(bioVerify).balance, expectedContractBalance, "Unexpected Contract Balance");
    }

    // ===== unhappy path

    function test_Claim_RevertIf_NotAMember() public {
        uint256 contractBalanceInit = address(bioVerify).balance;

        vm.prank(user);
        // Expectations
        vm.expectRevert(abi.encodeWithSelector(BioVerify_NotAMember.selector));
        // Execution
        bioVerify.claim(REVIEWER_STAKE);
        vm.stopPrank();

        assertEq(address(bioVerify).balance, contractBalanceInit, "Contract balance should not have changed.");
    }

    function test_Claim_RevertIf_ClaimTooMuch() public {
        // Setup: Make a user a member with available stake
        vm.startPrank(user);
        vm.deal(user, REVIEWER_STAKE);
        bioVerify.payReviewerStake{value: REVIEWER_STAKE}();

        uint256 expectedUserBalanceAfterStaking = 0;
        uint256 claimAmount = 2 * REVIEWER_STAKE;
        uint256 contractBalanceAfterStaking = address(bioVerify).balance;

        // Expectations
        vm.expectRevert(abi.encodeWithSelector(BioVerify_ClaimTooMuch.selector));
        // Execution
        bioVerify.claim(claimAmount);
        vm.stopPrank();

        assertEq(user.balance, expectedUserBalanceAfterStaking, "User balance should not have changed.");
        assertEq(address(bioVerify).balance, contractBalanceAfterStaking, "Contract balance should not have changed.");
    }

    function test_Claim_RevertIf_ClaimFailTransferTo() public {
        // Setup
        ETHRejector ethRejector = new ETHRejector();

        vm.startPrank(address(ethRejector));
        vm.deal(address(ethRejector), REVIEWER_STAKE);
        bioVerify.payReviewerStake{value: REVIEWER_STAKE}();

        uint256 claimAmount = REVIEWER_STAKE;
        uint256 contractBalanceAfterStaking = address(bioVerify).balance;

        // Expectations
        vm.expectRevert(
            abi.encodeWithSelector(BioVerify_ClaimFailTransferTo.selector, address(ethRejector), claimAmount)
        );
        // Execution
        bioVerify.claim(claimAmount);
        vm.stopPrank();

        assertEq(address(bioVerify).balance, contractBalanceAfterStaking, "Contract balance should not have changed.");
    }
}

