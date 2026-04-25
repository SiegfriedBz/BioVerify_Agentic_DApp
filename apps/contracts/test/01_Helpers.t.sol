// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Vm} from "forge-std/Vm.sol";
import {BaseTest} from "./00_BaseTest.t.sol";
import {

    // events
    RewardPool,
    SlashPool,
    RewardMember,
    SlashMember,
    MemberAvailableStake,
    MemberLockedStake,
    MemberLockedStakeOnPubId,
    MemberReputation,
    IsAvailableReviewer,
    Claim,
    NewPublicationStatus,
    SubmitPublication,
    LockedStakeOnPubId,
    Agent_RequestVRF,
    Agent_PickReviewers,
    Agent_FinalizePublication,
    Agent_RecordReview,
    Agent_TransferSlashPoolToTreasury,
    Agent_MoveSlashPoolToRewardPool,

    // enum
    PublicationStatus
} from "../src/BioVerifyV3.sol";

contract ETHRejector {
    // ================================================================
    // HELPER CONTRACT TO TEST FAILED ETH TRANSFERS
    // ================================================================

    receive() external payable {
        revert("I refuse your ETH");
    }
}

contract TestHelpers is BaseTest {
    // ================================================================
    // EVENTS HELPERS
    // ================================================================

    function _expectEmit_RewardPool(uint256 _amount) internal {
        // event RewardPool(uint256 rewardPool);
        vm.expectEmit(true, false, false, true);
        emit RewardPool(_amount);
    }

    function _expectEmit_SlashPool(uint256 _amount) internal {
        // event SlashPool(uint256 slashPool);
        vm.expectEmit(true, false, false, true);
        emit SlashPool(_amount);
    }

    // ---
    function _expectEmit_MemberAvailableStake(address _member, uint256 _amount) internal {
        // event MemberAvailableStake(address indexed member, uint256 stake);
        vm.expectEmit(true, false, false, true);
        emit MemberAvailableStake(_member, _amount);
    }

    function _expectEmit_MemberLockedStake(address _member, uint256 _amount) internal {
        // event MemberLockedStake(address indexed member, uint256 stake);
        vm.expectEmit(true, false, false, true);
        emit MemberLockedStake(_member, _amount);
    }

    function _expectEmit_SlashMember(address _member) internal {
        // event SlashMember(address indexed member);
        vm.expectEmit(true, false, false, false);
        emit SlashMember(_member);
    }

    function _expectEmit_RewardMember(address _member) internal {
        // event RewardMember(address indexed member);
        vm.expectEmit(true, false, false, false);
        emit RewardMember(_member);
    }

    function _expectEmit_MemberReputation(address _member, uint256 _reputation) internal {
        // event MemberReputation(address indexed member, uint256 reputation);
        vm.expectEmit(true, false, false, true);
        emit MemberReputation(_member, _reputation);
    }

    function _expectEmit_MemberLockedStakeOnPubId(address _member, uint256 _pubId, uint256 _amount) internal {
        // event MemberLockedStakeOnPubId(address indexed member, uint256 indexed pubId, uint256 stake);
        vm.expectEmit(true, true, false, true);
        emit MemberLockedStakeOnPubId(_member, _pubId, _amount);
    }

    function _expectEmit_IsAvailableReviewer(address _member, bool _isAvailable, uint256 _count) internal {
        // event IsAvailableReviewer(address indexed reviewer, bool isAvailableReviewer, uint256 currentActiveReviewsCount);
        vm.expectEmit(true, false, false, true);
        emit IsAvailableReviewer(_member, _isAvailable, _count);
    }

    function _expectEmit_Claim(
        address _member,
        uint256 _claimAmount,
        uint256 _memberAvailableStake,
        uint256 _contractBalance
    ) internal {
        // event Claim(address indexed member, uint256 claimAmount, uint256 memberAvailableStake, uint256 contractBalance);
        vm.expectEmit(true, false, false, true);
        emit Claim(_member, _claimAmount, _memberAvailableStake, _contractBalance);
    }
    // ---

    function _expectEmit_Agent_RecordReview(address _member, uint256 _pubId) internal {
        // event Agent_RecordReview(address indexed member, uint256 indexed pubId);
        vm.expectEmit(true, true, false, false);
        emit Agent_RecordReview(_member, _pubId);
    }

    // ---

    function _expectEmit_NewPublicationStatus(uint256 _pubId, PublicationStatus _status) internal {
        // event NewPublicationStatus(uint256 indexed pubId, PublicationStatus status);
        vm.expectEmit(true, false, false, true);
        emit NewPublicationStatus(_pubId, _status);
    }

    function _expectEmit_LockedStakeOnPubId(uint256 _pubId, uint256 _amount) internal {
        // event LockedStakeOnPubId(uint256 indexed pubId, uint256 stake);
        vm.expectEmit(true, false, false, true);
        emit LockedStakeOnPubId(_pubId, _amount);
    }

    function _expectEmit_SubmitPublication(address _member, uint256 _pubId, string memory _cid, uint256 _paidFee)
        internal
    {
        // event SubmitPublication(address indexed publisher, uint256 indexed pubId, string cid, uint256 paidFee);
        vm.expectEmit(true, true, false, true);
        emit SubmitPublication(_member, _pubId, _cid, _paidFee);
    }

    function _expectEmit_Agent_RequestVRF(uint256 _pubId, uint256 _requestId) internal {
        // event Agent_RequestVRF(uint256 indexed pubId, uint256 requestId);
        vm.expectEmit(true, false, false, true);
        emit Agent_RequestVRF(_pubId, _requestId);
    }

    function _expectEmit_Agent_PickReviewers(
        uint256 _pubId,
        address _publisher,
        address[] memory _reviewers,
        address _senior,
        string memory _cid
    ) internal {
        // event Agent_PickReviewers(uint256 indexed pubId, address indexed publisher, address[] reviewers, address seniorReviewer, string cid);
        vm.expectEmit(true, true, false, true);
        emit Agent_PickReviewers(_pubId, _publisher, _reviewers, _senior, _cid);
    }

    function _expectEmit_Agent_FinalizePublication(uint256 _pubId, string memory _verdictCid, PublicationStatus _status)
        internal
    {
        // event Agent_FinalizePublication(uint256 indexed pubId, string verdictCid, PublicationStatus status);
        vm.expectEmit(true, false, false, true);
        emit Agent_FinalizePublication(_pubId, _verdictCid, _status);
    }

    function _expectEmit_Agent_TransferSlashPoolToTreasury(address _to, uint256 _value, uint256 _newSlashPool)
        internal
    {
        // event Agent_TransferSlashPoolToTreasury(address indexed to, uint256 amount, uint256 newSlashPool);
        vm.expectEmit(true, false, false, true);
        emit Agent_TransferSlashPoolToTreasury(_to, _value, _newSlashPool);
    }

    function _expectEmit_Agent_MoveSlashPoolToRewardPool(uint256 _value, uint256 _newSlashPool, uint256 _newRewardPool)
        internal
    {
        // event Agent_MoveSlashPoolToRewardPool(uint256 amount, uint256 newSlashPool, uint256 newRewardPool);
        vm.expectEmit(false, false, false, true);
        emit Agent_MoveSlashPoolToRewardPool(_value, _newSlashPool, _newRewardPool);
    }

    // ================================================================
    // FUNCTIONS HELPERS
    // ================================================================

    function _submitDefaultPub() internal {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: validPaidPublisherAmount}(FAKE_CID);
    }

    // Helpers to fill the reviewer pool before testing pickReviewers
    function _fillValidReviewerPool() internal {
        _fillReviewerPool(validMinReviewersPoolSize);
    }

    function _fillReviewerPool(uint256 _count) internal {
        for (uint256 i = 0; i < _count; ++i) {
            address rev = makeAddr(string(abi.encodePacked("reviewer_", i)));
            vm.deal(rev, reviewerStake);
            vm.prank(rev);
            bioVerify.payReviewerStake{value: reviewerStake}();
        }
    }

    function _successEarlySlashPublication() internal {
        // Setup state: need a publication
        _submitDefaultPub();

        vm.prank(aiAgentAddress);
        bioVerify.earlySlashPublication(0, FAKE_VERDICT_CID);
    }

    function _successSlashPublication() internal {
        // --- 1. SETUP ---
        _submitDefaultPub();
        _fillValidReviewerPool();

        uint256 honestCount = (vrfNumWords * 3) / 4;
        if (honestCount == 0) honestCount = 1;
        uint256 negligentCount = vrfNumWords - honestCount;

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

        uint256[] memory words = new uint256[](vrfNumWords);
        for (uint256 i = 0; i < vrfNumWords; ++i) {
            words[i] = i;
        }
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, address(bioVerify), words);

        // --- 6. EXECUTION ---
        vm.prank(aiAgentAddress);
        bioVerify.slashPublication(0, honest, negligent, FAKE_VERDICT_CID);
    }

    function _successPublishPublication(uint256 _pubId) internal {
        _submitDefaultPub();
        _fillValidReviewerPool();

        // 1. Start recording logs
        vm.recordLogs();

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(_pubId);

        // 2. Fulfill (This emits Agent_PickReviewers)
        uint256[] memory words = new uint256[](vrfNumWords);
        for (uint256 i = 0; i < vrfNumWords; ++i) {
            words[i] = i;
        }
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, address(bioVerify), words);

        // 3. Catch the logs and find the assigned reviewers
        Vm.Log[] memory entries = vm.getRecordedLogs();
        address[] memory actualReviewers;
        address actualSenior;

        for (uint256 i = 0; i < entries.length; i++) {
            // Topic 0 is the hash of the event signature
            if (entries[i].topics[0] == keccak256("Agent_PickReviewers(uint256,address,address[],address,string)")) {
                // Decode the non-indexed data: (address[] reviewers, address seniorReviewer, string cid)
                (actualReviewers, actualSenior,) = abi.decode(entries[i].data, (address[], address, string));
                break;
            }
        }

        // 4. Build the honest array using the REAL reviewers
        address[] memory honest = new address[](vrfNumWords);
        honest[0] = actualSenior; // Senior is always one of the reviewers
        for (uint256 i = 0; i < actualReviewers.length; i++) {
            honest[i + 1] = actualReviewers[i];
        }

        address[] memory negligent = new address[](0);

        // 5. Settle
        vm.prank(aiAgentAddress);
        bioVerify.publishPublication(_pubId, honest, negligent, FAKE_VERDICT_CID);
    }
}
