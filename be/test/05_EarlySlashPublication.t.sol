// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./01_Helpers.t.sol";
import {

    //  errors
    BioVerify_OnlyAgent,
    BioVerify_InvalidPublicationId,
    BioVerify_CanNotSettle
} from "../src/BioVerifyV3.sol";

contract EarlySlashPublicationTest is TestHelpers {
    function test_EarlySlashPublication_Success() public {
        // Setup state: need a publication
        _submitDefaultPub();

        // _unLockStakeAndSlash
        _expectEmit_SlashMember(publisher);
        _expectEmit_MemberReputation(publisher, 0);

        _expectEmit_MemberLockedStake(publisher, 0);
        _expectEmit_MemberLockedStakeOnPubId(publisher, 0, 0);
        _expectEmit_LockedStakeOnPubId(0, 0);
        _expectEmit_SlashPool(VALID_PAID_PUBLISHER_STAKE);

        // _markPubAsFinalized
        _expectEmit_Agent_FinalizePublication(0, FAKE_VERDICT_CID, PublicationStatus.EARLY_SLASHED);
        _expectEmit_NewPublicationStatus(0, PublicationStatus.EARLY_SLASHED);

        vm.prank(aiAgentAddress);
        bioVerify.earlySlashPublication(0, FAKE_VERDICT_CID);
    }

    function test_EarlySlashPublication_DecreasesHighReputation() public {
        // 1. First success -> Publisher Rep = I_REPUTATION_BOOST
        _successPublishPublication(0);

        // 2. Second success -> Publisher Rep = 2 * I_REPUTATION_BOOST
        _successPublishPublication(1);

        // 3. Third success -> Publisher Rep = 3 * I_REPUTATION_BOOST
        _successPublishPublication(2);

        // 2. NOW submit a SECOND publication to slash
        _submitDefaultPub(); // pubId 3
        _fillValidReviewerPool();

        // When we slash pubId 3, it will hit:
        // currentRep > I_REPUTATION_BOOST ? currentRep - I_REPUTATION_BOOST : 0;
        _expectEmit_MemberReputation(publisher, 2 * REPUTATION_BOOST); // (3 * REPUTATION_BOOST - 2 * REPUTATION_BOOST)

        vm.prank(aiAgentAddress);
        bioVerify.earlySlashPublication(3, FAKE_VERDICT_CID);
        vm.stopPrank();
    }

    // ===== unhappy path

    function test_EarlySlashPublication_RevertIf_AlreadyFinalized() public {
        _submitDefaultPub();

        // First slash: status moves SUBMITTED -> EARLY_SLASHED
        vm.prank(aiAgentAddress);
        bioVerify.earlySlashPublication(0, FAKE_VERDICT_CID);

        // Second slash: status is EARLY_SLASHED, so it's != SUBMITTED
        vm.prank(aiAgentAddress);
        vm.expectRevert(
            abi.encodeWithSelector(
                BioVerify_CanNotSettle.selector, 0, PublicationStatus.EARLY_SLASHED, PublicationStatus.EARLY_SLASHED
            )
        );
        bioVerify.earlySlashPublication(0, "ipfs://another-one");
    }

    function test_EarlySlashPublication_RevertIf_NotAgent() public {
        _submitDefaultPub();

        address attacker = makeAddr("attacker");
        vm.prank(attacker);

        vm.expectRevert(BioVerify_OnlyAgent.selector);
        bioVerify.earlySlashPublication(0, FAKE_VERDICT_CID);
    }

    function test_EarlySlashPublication_RevertIf_InvalidPubId() public {
        uint256 nonExistentId = 999; // nextPubId starts at 0

        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InvalidPublicationId.selector, nonExistentId));
        bioVerify.earlySlashPublication(nonExistentId, FAKE_VERDICT_CID);
    }
}
