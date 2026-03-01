// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./01_Helpers.t.sol";
import {

    //  errors
    BioVerify_MustPayPublisherStake,
    BioVerify_InsufficientPublisherFee
} from "../src/BioVerifyV3.sol";

contract SubmitPublicationTest is TestHelpers {
    function test_SubmitPublication_Success() public {
        uint256 validValue = VALID_PAID_PUBLISHER_FEE + VALID_PAID_PUBLISHER_STAKE;
        vm.deal(publisher, validValue);

        _expectEmit_NewPublicationStatus(0, PublicationStatus.SUBMITTED);
        _expectEmit_MemberAvailableStake(publisher, VALID_PAID_PUBLISHER_STAKE);
        _expectEmit_MemberAvailableStake(publisher, 0);
        _expectEmit_MemberLockedStake(publisher, VALID_PAID_PUBLISHER_STAKE);
        _expectEmit_MemberLockedStakeOnPubId(publisher, 0, VALID_PAID_PUBLISHER_STAKE);
        _expectEmit_LockedStakeOnPubId(0, VALID_PAID_PUBLISHER_STAKE);
        _expectEmit_SubmitPublication(publisher, 0, FAKE_CID);

        // 3. Execute
        vm.prank(publisher);
        bioVerify.submitPublication{value: validValue}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
    }

    // ===== unhappy path
    function test_RevertIf_StakeTooLow() public {
        uint256 stakeTooLow = VALID_PAID_PUBLISHER_STAKE - 1;
        uint256 wrongTotal = VALID_PAID_PUBLISHER_FEE + stakeTooLow;

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayPublisherStake.selector));
        bioVerify.submitPublication{value: wrongTotal}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
    }

    function test_RevertIf_StakeTooHigh() public {
        uint256 stakeTooHigh = VALID_PAID_PUBLISHER_STAKE + 1;
        uint256 wrongTotal = VALID_PAID_PUBLISHER_FEE + stakeTooHigh;

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayPublisherStake.selector));
        bioVerify.submitPublication{value: wrongTotal}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
    }

    function test_RevertIf_InsufficientFee() public {
        uint256 invalidFee = VALID_PAID_PUBLISHER_FEE - 1;
        uint256 validTotal = VALID_PAID_PUBLISHER_STAKE + VALID_PAID_PUBLISHER_FEE;

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientPublisherFee.selector));
        bioVerify.submitPublication{value: validTotal}(FAKE_CID, invalidFee);
    }
}

contract FuzzSubmit is TestHelpers {
    function testFuzz_SubmitPublication(uint256 fee, uint256 stake) public {
        // Bound the inputs to realistic values to avoid overflow in test math
        fee = bound(fee, PUBLISHER_MIN_FEE, 100 ether);
        stake = bound(stake, PUBLISHER_STAKE, PUBLISHER_STAKE);

        uint256 total = fee + stake;
        vm.deal(publisher, total);

        vm.prank(publisher);
        bioVerify.submitPublication{value: total}(FAKE_CID, fee);

        // Invariant: Contract balance must have increased by exactly 'total'
        assertEq(address(bioVerify).balance, DEPLOYMENT_VALUE + total);
    }
}
