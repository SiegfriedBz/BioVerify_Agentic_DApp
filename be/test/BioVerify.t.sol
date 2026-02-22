// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {Constants} from "../script/Constants.sol";
import {
    BioVerify,
    BioVerifyConfig,
    Publication,
    Member,
    Assignment,

    // events
    BioVerify_SubmitPublication,
    BioVerify_PayReviewerMinStake,
    BioVerify_Agent_TransferSlashedPool,
    BioVerify_Agent_SlashPublisher,
    BioVerify_Agent_SetMemberReputation,
    BioVerify_Agent_ReviewRecorded,

    // errors
    BioVerify_MustPayToPublish,
    BioVerify_InsufficientPublisherStake,
    BioVerify_InsufficientPublisherFee,
    BioVerify_OnlyAgent,
    BioVerify_InvalidPublicationId,
    BioVerify_AlreadySlashed,
    BioVerify_ZeroValueToTransfer,
    BioVerify_MustPayReviewerMinStake,
    BioVerify_InsufficientReviewersPool,
    BioVerify_PublicationStatusNotFinalized,
    BioVerify_MustBeInReviewToSettle,
    BioVerify_AlreadyInReview,
    BioVerify_InsufficientRewardPool,
    BioVerify_FailedToTransferTo,
    BioVerify_InSufficientContractBalance
} from "../src/BioVerify.sol";

// Helper contract to test failed ETH transfers
contract ETHRejector {
    receive() external payable {
        revert("I refuse your ETH");
    }
}

contract BioVerifyTest is Test, Constants {
    BioVerify public bioVerify;

    address aiAgentAddress = vm.envAddress("AI_AGENT_ADDRESS");
    address treasuryAddress = vm.envAddress("TREASURY_ADDRESS");

    address publisher = makeAddr("publisher");
    address user = makeAddr("user");

    uint256 constant DEPLOYMENT_VALUE = 1_000 ether;
    uint256 constant VALID_PAID_PUBLISHER_FEE = PUBLISHER_MIN_FEE;
    uint256 constant VALID_PAID_PUBLISHER_STAKE = PUBLISHER_MIN_STAKE;
    uint256 constant VALID_PAID_PUBLISHER_AMOUNT = VALID_PAID_PUBLISHER_FEE + VALID_PAID_PUBLISHER_STAKE;
    string constant FAKE_CID = "ipfs://test-hash";
    string constant FAKE_VERDICT_CID = "ipfs://test-verdict-hash";

    VRFCoordinatorV2_5Mock vrfCoordinatorMock;
    uint256 vrfMockSubscriptionId;

    function setUp() public {
        vrfCoordinatorMock = new VRFCoordinatorV2_5Mock(0.01 ether, 0.0003 ether, 1e18);
        vrfMockSubscriptionId = vrfCoordinatorMock.createSubscription();
        vrfCoordinatorMock.fundSubscriptionWithNative{value: 1000 ether}(vrfMockSubscriptionId);

        BioVerifyConfig memory mockConfig = BioVerifyConfig({
            reputationBoost: REPUTATION_BOOST,
            aiAgent: aiAgentAddress,
            treasury: treasuryAddress,
            pubMinFee: PUBLISHER_MIN_FEE,
            pubMinStake: PUBLISHER_MIN_STAKE,
            revMinStake: REVIEWER_MIN_STAKE,
            revReward: REVIEWER_REWARD,
            vrfSubId: vrfMockSubscriptionId,
            vrfKeyHash: VRF_KEY_HASH,
            vrfGasLimit: VRF_CALLBACK_GAS_LIMIT,
            vrfConfirmations: VRF_REQUEST_CONFIRMATIONS,
            vrfNumWords: VRF_NUM_WORDS,
            vrfCoordinator: address(vrfCoordinatorMock)
        });
        bioVerify = new BioVerify{value: DEPLOYMENT_VALUE}(mockConfig);
        vrfCoordinatorMock.addConsumer(vrfMockSubscriptionId, address(bioVerify));
    }

    // ================================================================
    // 1. DEPLOYMENT
    // ================================================================

    function test_Deployment() public view {
        assertEq(address(bioVerify).balance, DEPLOYMENT_VALUE);
        assertEq(bioVerify.rewardPool(), DEPLOYMENT_VALUE);
        assertEq(bioVerify.I_REPUTATION_BOOST(), REPUTATION_BOOST);
        assertEq(bioVerify.I_AI_AGENT_ADDRESS(), aiAgentAddress);
        assertEq(bioVerify.I_TREASURY_ADDRESS(), treasuryAddress);
        assertEq(bioVerify.I_PUBLISHER_MIN_FEE(), PUBLISHER_MIN_FEE);
        assertEq(bioVerify.I_PUBLISHER_MIN_STAKE(), PUBLISHER_MIN_STAKE);
        assertEq(bioVerify.I_REVIEWER_MIN_STAKE(), REVIEWER_MIN_STAKE);
        assertEq(bioVerify.I_REVIEWER_REWARD(), REVIEWER_REWARD);
    }

    // ================================================================
    // 2. MEMBER ONBOARDING (STAKING & REPUTATION)
    // ================================================================

    function test_PayReviewerMinStake_Success() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();

        Member memory member = bioVerify.getMember(user);
        assertEq(member.mbAddress, user);
        assertTrue(member.isReviewer);
        assertEq(member.stakes, REVIEWER_MIN_STAKE);
    }

    function test_PayReviewerMinStake_Success_EmitsCorrectEvent() public {
        vm.deal(user, 1 ether);
        vm.expectEmit(true, false, false, true);
        emit BioVerify_PayReviewerMinStake(user);
        vm.prank(user);
        bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();
    }

    function test_PayReviewerMinStake_AllowsTopUp() public {
        vm.deal(user, 2 ether);
        vm.prank(user);
        bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();
        vm.prank(user);
        bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();
        assertEq(bioVerify.getMember(user).stakes, REVIEWER_MIN_STAKE * 2);
    }

    function test_PayReviewerMinStake_RevertIfZeroStake() public {
        vm.deal(user, 1 ether);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayReviewerMinStake.selector));
        vm.prank(user);
        bioVerify.payReviewerMinStake{value: 0}();
    }

    function test_PayReviewerMinStake_RevertIfStakeTooLow() public {
        vm.deal(user, 1 ether);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayReviewerMinStake.selector));
        vm.prank(user);
        bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE - 1 wei}();
    }

    function test_PayReviewerMinStake_RevertIfStakeTooHigh() public {
        vm.deal(user, 1 ether);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayReviewerMinStake.selector));
        vm.prank(user);
        bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE + 1 wei}();
    }

    function test_SetMemberReputation_Success() public {
        vm.prank(aiAgentAddress);
        vm.expectEmit(true, false, false, true);
        emit BioVerify_Agent_SetMemberReputation(user, 85);
        bioVerify.setMemberReputation(user, 85);
        assertEq(bioVerify.getMember(user).reputation, 85);
    }

    function test_SetMemberReputation_RevertIfNotAgent() public {
        vm.expectRevert(abi.encodeWithSelector(BioVerify_OnlyAgent.selector));
        vm.prank(user);
        bioVerify.setMemberReputation(user, 100);
    }

    // ================================================================
    // 3. PUBLICATION SUBMISSION
    // ================================================================

    function test_SubmitPublication_EmitsCorrectEvent() public {
        vm.deal(publisher, 1 ether);
        vm.expectEmit(true, true, true, false);
        emit BioVerify_SubmitPublication(publisher, 0, FAKE_CID);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
    }

    function test_SubmitPublication_RecordsCorrectAmountOnPublicationPaidSubmissionFee() public {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
        assertEq(bioVerify.getPublication(0).paidSubmissionFee, VALID_PAID_PUBLISHER_FEE);
    }

    function test_SubmitPublication_IncreasesContractBalance() public {
        uint256 initContractBalance = address(bioVerify).balance;
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
        assertEq(address(bioVerify).balance, initContractBalance + VALID_PAID_PUBLISHER_AMOUNT);
    }

    function test_SubmitPublication_StakesCorrectAmountOnPublication() public {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
        assertEq(bioVerify.getPublication(0).stakes, VALID_PAID_PUBLISHER_STAKE);
    }

    function test_SeniorReviewer_Logic_Branch() public {
        _setupReviewerPool(VRF_NUM_WORDS + 1);
        _submitDefaultPub();
        _fulfillVrfForPub(0);

        Publication memory pub = bioVerify.getPublication(0);
        address senior = pub.seniorReviewer;

        address[] memory honest = new address[](1);
        honest[0] = senior;

        vm.prank(aiAgentAddress);
        bioVerify.publishPublication(0, honest, new address[](0), FAKE_VERDICT_CID);

        // Senior should have: Initial Stake + Reviewer Reward
        uint256 expectedBalance = REVIEWER_MIN_STAKE + REVIEWER_REWARD;
        assertEq(bioVerify.getMember(senior).stakes, expectedBalance);
    }

    function test_SubmitPublication_RevertIfZeroValueSent() public {
        vm.deal(publisher, 1 ether);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayToPublish.selector));
        vm.prank(publisher);
        bioVerify.submitPublication{value: 0}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
    }

    function test_SubmitPublication_RevertIfZeroPublisherStake() public {
        uint256 augmentedPublisherFee = PUBLISHER_MIN_FEE + 10 wei;
        uint256 invalidPublisherStake = PUBLISHER_MIN_STAKE - 10 wei;
        uint256 validPublisherAmount = invalidPublisherStake + augmentedPublisherFee;

        vm.deal(publisher, 1 ether);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientPublisherStake.selector));
        vm.prank(publisher);
        bioVerify.submitPublication{value: validPublisherAmount}(FAKE_CID, augmentedPublisherFee);
    }

    function test_SubmitPublication_RevertIfZeroPublisherFee() public {
        uint256 invalidPublisherFee = PUBLISHER_MIN_FEE - 10 wei;
        uint256 augmentedPublisherStake = PUBLISHER_MIN_STAKE + 10 wei;
        uint256 validPublisherAmount = augmentedPublisherStake + invalidPublisherFee;

        vm.deal(publisher, 1 ether);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientPublisherFee.selector));
        vm.prank(publisher);
        bioVerify.submitPublication{value: validPublisherAmount}(FAKE_CID, invalidPublisherFee);
    }

    // ================================================================
    // 4. VRF & REVIEWER SELECTION
    // ================================================================

    function test_FullVRFReviewerSelectionFlow() public {
        _setupReviewerPool(VRF_NUM_WORDS + 1);
        vm.prank(aiAgentAddress);
        bioVerify.setMemberReputation(makeAddr("r1"), 500); // Set high rep for one

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);
        vrfCoordinatorMock.fulfillRandomWords(requestId, address(bioVerify));

        Publication memory pub = bioVerify.getPublication(0);
        assertEq(uint256(pub.status), 1); // Status.IN_REVIEW
        assertEq(pub.reviewers.length, VRF_NUM_WORDS - 1);
    }

    function test_VRF_SkipsPublisherIfSelected() public {
        uint256 poolSize = VRF_NUM_WORDS + 1;
        address[] memory users = new address[](poolSize);

        users[0] = publisher; // Collision target
        for (uint256 i = 1; i < poolSize; i++) {
            users[i] = makeAddr(string(abi.encodePacked("r", i)));
        }

        for (uint256 i = 0; i < poolSize; i++) {
            vm.deal(users[i], 1 ether);
            vm.prank(users[i]);
            bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();
        }

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);

        uint256[] memory words = new uint256[](VRF_NUM_WORDS);
        for (uint256 i = 0; i < VRF_NUM_WORDS; i++) {
            words[i] = i; // Will hit index 0 (publisher)
        }

        vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, address(bioVerify), words);

        Publication memory pub = bioVerify.getPublication(0);
        assertTrue(pub.seniorReviewer != publisher);
        for (uint256 i = 0; i < pub.reviewers.length; i++) {
            assertTrue(pub.reviewers[i] != publisher);
        }
    }

    function test_VRF_HandlesDuplicateAndPublisherCollisions() public {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}(); // Pub at index 0
        _setupReviewerPool(VRF_NUM_WORDS + 1);

        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);

        uint256[] memory words = new uint256[](VRF_NUM_WORDS);
        words[0] = 0; // Hits publisher, skips
        words[1] = 1; // Hits rev1, stays
        words[2] = 1; // Hits rev1 (duplicate), skips
        for (uint256 i = 3; i < VRF_NUM_WORDS; i++) {
            words[i] = i + 1;
        }

        vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, address(bioVerify), words);
        assertNotEq(bioVerify.getPublication(0).seniorReviewer, publisher);
    }

    function test_VRF_HeavyCollisions_Branch() public {
        // 1. Setup a small pool (only 5 people)
        _setupReviewerPool(5);
        _submitDefaultPub();

        // 2. Start pick
        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);

        // 3. Create a word array that forces every type of collision
        uint256[] memory words = new uint256[](VRF_NUM_WORDS);
        words[0] = 0; // Hits index 0 (likely publisher) -> Collision branch 1
        words[1] = 1; // Hits index 1 -> Success
        words[2] = 1; // Hits index 1 AGAIN -> Collision branch 2 (Duplicate)
        words[3] = 1; // Hits index 1 AGAIN -> Collision branch 2
        for (uint256 i = 4; i < VRF_NUM_WORDS; i++) {
            words[i] = i + 1;
        }

        // This should force the internal loop to skip the duplicates/publisher
        vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, address(bioVerify), words);

        Publication memory pub = bioVerify.getPublication(0);
        assertEq(uint256(pub.status), 1); // Should still succeed after skipping
    }

    function test_PickReviewers_RevertIfAlreadyInReview() public {
        _setupReviewerPool(VRF_NUM_WORDS + 1);
        _submitDefaultPub();

        // First call sets status to IN_REVIEW (via VRF)
        _fulfillVrfForPub(0);

        // Second call should hit the branch: if (pub.status == IN_REVIEW) revert AlreadyInReview
        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_AlreadyInReview.selector, 0));
        bioVerify.pickReviewers(0);
    }

    function test_PickReviewers_RevertsIfRewardPoolEmpty() public {
        BioVerifyConfig memory brokeConfig = _getMockConfig();
        BioVerify brokeVerify = new BioVerify{value: 0}(brokeConfig);

        _setupReviewerPoolForContract(address(brokeVerify), VRF_NUM_WORDS + 1);

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        brokeVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientRewardPool.selector, 0));
        brokeVerify.pickReviewers(0);
    }

    function test_PickReviewers_RevertIfInsufficientRewardPool() public {
        // 1. Setup config and calculate a "not enough" value
        BioVerifyConfig memory brokeConfig = _getMockConfig();
        uint256 requiredValue = VRF_NUM_WORDS * REVIEWER_REWARD;
        uint256 insufficientValue = requiredValue - 1; // 1 wei below threshold

        // 2. Deploy the new contract with insufficient funds
        BioVerify brokeVerify = new BioVerify{value: insufficientValue}(brokeConfig);

        // --- THE CRITICAL FIX: Authorize the new contract for VRF ---
        vrfCoordinatorMock.addConsumer(vrfMockSubscriptionId, address(brokeVerify));

        // 3. Setup reviewers and publication for this new instance
        _setupReviewerPoolForContract(address(brokeVerify), VRF_NUM_WORDS + 1);
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        brokeVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 4. Expect Revert: Should fail the math check inside pickReviewers
        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientRewardPool.selector, insufficientValue));
        brokeVerify.pickReviewers(0);
    }

    // ================================================================
    // 4.1 REVIEW RECORDING
    // ================================================================

    function test_RecordReviewSubmission_Success() public {
        _submitDefaultPub();

        // Only the AI Agent should be able to record a submission
        vm.prank(aiAgentAddress);
        vm.expectEmit(true, true, false, false);
        emit BioVerify_Agent_ReviewRecorded(publisher, 0);

        bioVerify.recordReviewSubmission(publisher, 0);

        assertTrue(bioVerify.hasSubmittedReviewOnPubId(publisher, 0));
    }

    function test_RecordReviewSubmission_RevertIfNotAgent() public {
        _submitDefaultPub();
        vm.expectRevert(abi.encodeWithSelector(BioVerify_OnlyAgent.selector));
        vm.prank(user);
        bioVerify.recordReviewSubmission(publisher, 0);
    }

    function test_RecordReviewSubmission_RevertIfInvalidId() public {
        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InvalidPublicationId.selector, 999));
        bioVerify.recordReviewSubmission(publisher, 999);
    }

    // ================================================================
    // 5. SETTLEMENT (PUBLISH & SLASH)
    // ================================================================

    function test_PublishPublication_RewardsHonestAndSlashesNegligent() public {
        _setupReviewerPool(10);
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);
        vrfCoordinatorMock.fulfillRandomWords(requestId, address(bioVerify));

        Publication memory pub = bioVerify.getPublication(0);
        address[] memory honest = new address[](2);
        address[] memory negligent = new address[](2);
        honest[0] = pub.seniorReviewer;
        honest[1] = pub.reviewers[0];
        negligent[0] = pub.reviewers[1];
        negligent[1] = pub.reviewers[2];

        uint256 initSlashed = bioVerify.slashedPool();
        vm.prank(aiAgentAddress);
        bioVerify.publishPublication(0, honest, negligent, FAKE_VERDICT_CID);

        assertEq(uint256(bioVerify.getPublication(0).status), 3); // Status.PUBLISHED
        assertEq(bioVerify.slashedPool(), initSlashed + (negligent.length * REVIEWER_MIN_STAKE));
    }

    function test_SlashPublication_SlashesPublisherAndNegligentReviewers() public {
        _setupReviewerPool(VRF_NUM_WORDS + 1);
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        uint256 rid = bioVerify.pickReviewers(0);
        vrfCoordinatorMock.fulfillRandomWords(rid, address(bioVerify));

        Publication memory pub = bioVerify.getPublication(0);
        address[] memory honest = new address[](1);
        address[] memory negligent = new address[](VRF_NUM_WORDS);
        honest[0] = pub.seniorReviewer;
        for (uint256 i = 0; i < pub.reviewers.length; i++) {
            negligent[i] = pub.reviewers[i];
        }

        uint256 startSlashed = bioVerify.slashedPool();
        vm.prank(aiAgentAddress);
        bioVerify.slashPublication(0, honest, negligent, FAKE_VERDICT_CID);

        assertEq(
            bioVerify.slashedPool(), startSlashed + VALID_PAID_PUBLISHER_STAKE + (negligent.length * REVIEWER_MIN_STAKE)
        );
    }

    function test_SlashPublication_RevertsIfNotInReview() public {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustBeInReviewToSettle.selector, 0));
        vm.prank(aiAgentAddress);
        bioVerify.slashPublication(0, new address[](0), new address[](0), FAKE_VERDICT_CID);
    }

    function test_PublishPublication_RevertIfAlreadyFinalized() public {
        // 1. Setup a valid publication in the IN_REVIEW state
        _setupReviewerPool(VRF_NUM_WORDS + 1);
        _submitDefaultPub();
        _fulfillVrfForPub(0);

        address[] memory empty = new address[](0);

        // 2. First Settlement: This call succeeds and moves status to Status.PUBLISHED
        vm.prank(aiAgentAddress);
        bioVerify.publishPublication(0, empty, empty, FAKE_VERDICT_CID);

        // 3. Second Settlement: This must fail because the status is no longer IN_REVIEW
        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustBeInReviewToSettle.selector, 0));
        bioVerify.publishPublication(0, empty, empty, FAKE_VERDICT_CID);
    }

    function test_PublishPublication_RevertIfInvalidId() public {
        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InvalidPublicationId.selector, 999));
        bioVerify.publishPublication(999, new address[](0), new address[](0), FAKE_VERDICT_CID);
    }

    function test_PublishPublication_WorksWithEmptyArrays() public {
        // 1. Setup the pool so VRF has people to pick
        _setupReviewerPool(VRF_NUM_WORDS + 1);

        // 2. Submit the pub (creates ID 0)
        _submitDefaultPub();

        // 3. Move ID 0 to IN_REVIEW using the VRF mock
        _fulfillVrfForPub(0);

        // 4. Settle with empty arrays (The "Empty Loop" Branch)
        vm.prank(aiAgentAddress);
        bioVerify.publishPublication(0, new address[](0), new address[](0), FAKE_VERDICT_CID);

        assertEq(uint256(bioVerify.getPublication(0).status), 3); // Status.PUBLISHED
    }

    function test_PublishPublication_RevertIfNotInReview() public {
        _submitDefaultPub();
        // Skip VRF! Status is still SUBMITTED

        vm.prank(aiAgentAddress);
        // This hits the branch: if (status != IN_REVIEW) revert MustBeInReviewToSettle
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustBeInReviewToSettle.selector, 0));
        bioVerify.publishPublication(0, new address[](0), new address[](0), FAKE_VERDICT_CID);
    }

    // ================================================================
    // 6. PUBLISHER SLASHING
    // ================================================================

    function test_SlashPublisher_DropsHighReputation() public {
        vm.prank(aiAgentAddress);
        bioVerify.setMemberReputation(publisher, 1_000_000);
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0, FAKE_VERDICT_CID);
        assertEq(bioVerify.getMember(publisher).reputation, 1_000_000 - REPUTATION_BOOST);
    }

    function test_SlashPublisher_ZeroesLowReputation() public {
        vm.prank(aiAgentAddress);
        bioVerify.setMemberReputation(publisher, 10);
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0, FAKE_VERDICT_CID);
        assertEq(bioVerify.getMember(publisher).reputation, 0);
    }

    function test_SlashPublisher_RevertIfNotAgentCall() public {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_OnlyAgent.selector));
        vm.prank(user);
        bioVerify.slashPublisher(0, FAKE_VERDICT_CID);
    }

    function test_SlashPublisher_RevertIfAlreadySlashed() public {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0, FAKE_VERDICT_CID);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_AlreadySlashed.selector, 0));
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0, FAKE_VERDICT_CID);
    }

    // ================================================================
    // 6.1 REPUTATION FLOORING (INTERNAL BRANCHES)
    // ================================================================

    function test_SlashPublisher_ReputationFloorsAtZero() public {
        // Give publisher exactly REPUTATION_BOOST - 1
        uint256 lowRep = REPUTATION_BOOST - 1;
        vm.prank(aiAgentAddress);
        bioVerify.setMemberReputation(publisher, lowRep);

        _submitDefaultPub();

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0, FAKE_VERDICT_CID);

        // Branch check: Should be 0, not a negative overflow or a large number
        assertEq(bioVerify.getMember(publisher).reputation, 0);
    }

    function test_SlashPublisher_ReputationSubtractsCorrectly() public {
        // Give publisher 2x REPUTATION_BOOST
        uint256 highRep = REPUTATION_BOOST * 2;
        vm.prank(aiAgentAddress);
        bioVerify.setMemberReputation(publisher, highRep);

        _submitDefaultPub();

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0, FAKE_VERDICT_CID);

        // Branch check: Should subtract exactly the boost
        assertEq(bioVerify.getMember(publisher).reputation, highRep - REPUTATION_BOOST);
    }

    // ================================================================
    // 7. FINANCIALS & CLAIMS
    // ================================================================

    function test_ClaimStake_HonestReviewerCanClaimAfterPublish() public {
        test_PublishPublication_RewardsHonestAndSlashesNegligent();
        address honestReviewer = bioVerify.getPublication(0).seniorReviewer;
        uint256 initBal = honestReviewer.balance;

        vm.prank(honestReviewer);
        bioVerify.claimStakeOnPublication(0);
        assertEq(honestReviewer.balance, initBal + REVIEWER_MIN_STAKE + REVIEWER_REWARD);
    }

    function test_ClaimStake_RevertsIfNotFinalized() public {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_PublicationStatusNotFinalized.selector, 0));
        vm.prank(publisher);
        bioVerify.claimStakeOnPublication(0);
    }

    function test_ClaimStake_RevertsIfTransferFails() public {
        ETHRejector rejector = new ETHRejector();
        address honestRejector = address(rejector);
        vm.deal(honestRejector, 1 ether);
        vm.prank(honestRejector);
        bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();
        vm.prank(aiAgentAddress);
        bioVerify.setMemberReputation(honestRejector, 10_000);

        _setupReviewerPool(VRF_NUM_WORDS);
        _submitDefaultPub();
        vm.prank(aiAgentAddress);
        uint256 rid = bioVerify.pickReviewers(0);
        vrfCoordinatorMock.fulfillRandomWords(rid, address(bioVerify));

        vm.prank(aiAgentAddress);
        address[] memory h = new address[](1);
        h[0] = honestRejector;
        bioVerify.publishPublication(0, h, new address[](0), FAKE_VERDICT_CID);

        vm.prank(honestRejector);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_FailedToTransferTo.selector, honestRejector));
        bioVerify.claimStakeOnPublication(0);
    }

    function test_TransferTotalSlashed_MovesFundsToTreasury() public {
        _submitDefaultPub();
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0, FAKE_VERDICT_CID);

        uint256 treasuryInit = treasuryAddress.balance;
        vm.prank(aiAgentAddress);
        bioVerify.transferSlashedPool();
        assertEq(treasuryAddress.balance, treasuryInit + VALID_PAID_PUBLISHER_STAKE);
    }

    function test_TransferTotalSlashed_RevertIfZeroValueToTransfer() public {
        vm.expectRevert(abi.encodeWithSelector(BioVerify_ZeroValueToTransfer.selector));
        vm.prank(aiAgentAddress);
        bioVerify.transferSlashedPool();
    }

    function test_ClaimStake_RevertIfZeroValue() public {
        // Setup a successful publish
        _setupReviewerPool(VRF_NUM_WORDS + 1);
        _submitDefaultPub();
        _fulfillVrfForPub(0);

        address senior = bioVerify.getPublication(0).seniorReviewer;
        address[] memory honest = new address[](1);
        honest[0] = senior;

        vm.prank(aiAgentAddress);
        bioVerify.publishPublication(0, honest, new address[](0), FAKE_VERDICT_CID);

        // First claim works
        vm.prank(senior);
        bioVerify.claimStakeOnPublication(0);

        // Second claim hits the branch: if (amount == 0) revert ZeroValueToTransfer
        vm.prank(senior);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_ZeroValueToTransfer.selector));
        bioVerify.claimStakeOnPublication(0);
    }

    // ================================================================
    // 8. GETTERS & FALLBACKS
    // ================================================================

    function test_Receive_FundsRewardPool() public {
        uint256 initPool = bioVerify.rewardPool();
        (bool success,) = address(bioVerify).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(bioVerify.rewardPool(), initPool + 1 ether);
    }

    function test_GetVerdictCid_ReturnsCorrectString() public {
        test_PublishPublication_RewardsHonestAndSlashesNegligent();
        assertEq(bioVerify.getVerdictCid(0), FAKE_VERDICT_CID);
    }

    function test_GetMembersCount_IncreasesCorrectly() public {
        uint256 initCount = bioVerify.getMembersCount();
        vm.deal(user, 1 ether);
        vm.prank(user);
        bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();
        assertEq(bioVerify.getMembersCount(), initCount + 1);
    }

    // ================================================================
    // INTERNAL TEST HELPERS
    // ================================================================

    function _setupReviewerPool(uint256 count) internal {
        for (uint32 i = 0; i < count; i++) {
            address rev = makeAddr(string(abi.encodePacked("r", i)));
            vm.deal(rev, 1 ether);
            vm.prank(rev);
            bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();
        }
    }

    function _setupReviewerPoolForContract(address target, uint256 count) internal {
        for (uint32 i = 0; i < count; i++) {
            address rev = makeAddr(string(abi.encodePacked("br", i)));
            vm.deal(rev, 1 ether);
            vm.prank(rev);
            BioVerify(payable(target)).payReviewerMinStake{value: REVIEWER_MIN_STAKE}();
        }
    }

    function _fulfillVrfForPub(uint256 pubId) internal {
        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(pubId);
        vrfCoordinatorMock.fulfillRandomWords(requestId, address(bioVerify));
    }

    function _submitDefaultPub() internal {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
    }

    function _getMockConfig() internal view returns (BioVerifyConfig memory) {
        return BioVerifyConfig({
            reputationBoost: REPUTATION_BOOST,
            aiAgent: aiAgentAddress,
            treasury: treasuryAddress,
            pubMinFee: PUBLISHER_MIN_FEE,
            pubMinStake: PUBLISHER_MIN_STAKE,
            revMinStake: REVIEWER_MIN_STAKE,
            revReward: REVIEWER_REWARD,
            vrfSubId: vrfMockSubscriptionId,
            vrfKeyHash: VRF_KEY_HASH,
            vrfGasLimit: VRF_CALLBACK_GAS_LIMIT,
            vrfConfirmations: VRF_REQUEST_CONFIRMATIONS,
            vrfNumWords: VRF_NUM_WORDS,
            vrfCoordinator: address(vrfCoordinatorMock)
        });
    }
}
