// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {TestHelpers} from "./01_Helpers.t.sol";
import {

    //  errors
    BioVerify_InsufficientPayment,

    // enum
    PublicationStatus
} from "../src/BioVerifyV3.sol";

contract SubmitPublicationTest is TestHelpers {
    function test_SubmitPublication_Success() public {
        uint256 validValue = publisherMinFee + publisherStake;
        vm.deal(publisher, validValue);

        _expectEmit_NewPublicationStatus(0, PublicationStatus.SUBMITTED);
        _expectEmit_MemberAvailableStake(publisher, publisherStake);
        _expectEmit_MemberAvailableStake(publisher, 0);
        _expectEmit_MemberLockedStake(publisher, publisherStake);
        _expectEmit_MemberLockedStakeOnPubId(publisher, 0, publisherStake);
        _expectEmit_LockedStakeOnPubId(0, publisherStake);
        _expectEmit_SubmitPublication(publisher, 0, FAKE_CID, publisherMinFee);

        // 3. Execute
        vm.prank(publisher);
        bioVerify.submitPublication{value: validValue}(FAKE_CID);
    }

    // ===== unhappy path
    function test_RevertIf_InsufficientPayment() public {
        // Anything below stake + min fee should revert.
        uint256 insufficientTotal = publisherStake + publisherMinFee - 1;

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientPayment.selector));
        bioVerify.submitPublication{value: insufficientTotal}(FAKE_CID);
    }
}

contract FuzzSubmit is TestHelpers {
    function testFuzz_SubmitPublication(uint256 total) public {
        total = bound(total, publisherStake + publisherMinFee, 100 ether);
        vm.deal(publisher, total);

        vm.prank(publisher);
        bioVerify.submitPublication{value: total}(FAKE_CID);

        // Invariant: Contract balance must have increased by exactly 'total'
        assertEq(address(bioVerify).balance, DEPLOY_VALUE + total);
    }
}
