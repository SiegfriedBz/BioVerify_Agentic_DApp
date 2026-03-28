// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {TestHelpers} from "./01_Helpers.t.sol";
import {

    //  errors
    BioVerify_MustPayPublisherStake,
    BioVerify_InsufficientPublisherFee,

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
        bioVerify.submitPublication{value: validValue}(FAKE_CID, publisherMinFee);
    }

    // ===== unhappy path
    function test_RevertIf_StakeTooLow() public {
        uint256 stakeTooLow = publisherStake - 1;
        uint256 wrongTotal = publisherMinFee + stakeTooLow;

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayPublisherStake.selector));
        bioVerify.submitPublication{value: wrongTotal}(FAKE_CID, publisherMinFee);
    }

    function test_RevertIf_StakeTooHigh() public {
        uint256 stakeTooHigh = publisherStake + 1;
        uint256 wrongTotal = publisherMinFee + stakeTooHigh;

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayPublisherStake.selector));
        bioVerify.submitPublication{value: wrongTotal}(FAKE_CID, publisherMinFee);
    }

    function test_RevertIf_InsufficientFee() public {
        uint256 invalidFee = publisherMinFee - 1;
        uint256 validTotal = publisherStake + publisherMinFee;

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientPublisherFee.selector));
        bioVerify.submitPublication{value: validTotal}(FAKE_CID, invalidFee);
    }
}

contract FuzzSubmit is TestHelpers {
    function testFuzz_SubmitPublication(uint256 fee, uint256 stake) public {
        // Bound the inputs to realistic values to avoid overflow in test math
        fee = bound(fee, publisherMinFee, 100 ether);
        stake = bound(stake, publisherStake, publisherStake);

        uint256 total = fee + stake;
        vm.deal(publisher, total);

        vm.prank(publisher);
        bioVerify.submitPublication{value: total}(FAKE_CID, fee);

        // Invariant: Contract balance must have increased by exactly 'total'
        assertEq(address(bioVerify).balance, DEPLOY_VALUE + total);
    }
}
