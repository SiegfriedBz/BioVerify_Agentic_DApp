// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {Constants} from "../script/Constants.sol";
import {
    BioVerify,
    BioVerifyConfig,

    // events
    BioVerify_SubmittedPublication,
    BioVerify_SlashedPublisher,
    BioVerify_JoinReviewerPool,
    BioVerify_Agent_TransferTotalSlashed,
    BioVerify_Agent_SetMemberReputationScore,

    // errors
    BioVerify_MustPayToPublish,
    BioVerify_InsufficientPublisherStake,
    BioVerify_InsufficientPublisherFee,
    BioVerify_OnlyAgent,
    BioVerify_InvalidPublicationId,
    BioVerify_AlreadySlashed,
    BioVerify_ZeroValueToTransfer,
    BioVerify_InsufficientReviewerStake,
    BioVerify_AlreadyReviewer,
    BioVerify_InsufficientReviewerPool
} from 

"../src/BioVerify.sol";

contract BioVerifyTest is Test, Constants {
    // BioVerifyScript public deployer;
    BioVerify public bioVerify;

    address aiAgentAddress = vm.envAddress("AI_AGENT_ADDRESS");
    address treasuryAddress = vm.envAddress("TREASURY_ADDRESS");

    address publisher = makeAddr("publisher");
    address user = makeAddr("user");

    uint256 constant VALID_PAID_PUBLISHER_FEE = PUBLISHER_MIN_FEE;
    uint256 constant VALID_PAID_PUBLISHER_STAKE = PUBLISHER_MIN_STAKE + 50 wei;
    uint256 constant VALID_PAID_PUBLISHER_AMOUNT = VALID_PAID_PUBLISHER_FEE + VALID_PAID_PUBLISHER_STAKE;
    string constant FAKE_CID = "ipfs://test-hash";

    VRFCoordinatorV2_5Mock vrfCoordinatorMock;
    uint256 vrfMockSubscriptionId;

    function setUp() public {
        // 1. Deploy the Mock Coordinator locally
        vrfCoordinatorMock = new VRFCoordinatorV2_5Mock(
            0.1 ether, // baseFee
            0.003 ether, // gasPriceLink
            1e18 // weiPerUnitLink
        );

        // 2. create & fund Subscription to mock vrf
        vrfMockSubscriptionId = vrfCoordinatorMock.createSubscription();
        vrfCoordinatorMock.fundSubscriptionWithNative{value: 1000 ether}(vrfMockSubscriptionId); // Sub ID 1

        // 3. Deploy BioVerify manually for the test to point to the Mock
        BioVerifyConfig memory mockConfig = BioVerifyConfig({
            aiAgent: aiAgentAddress,
            treasury: treasuryAddress,
            pubMinFee: PUBLISHER_MIN_FEE,
            pubMinStake: PUBLISHER_MIN_STAKE,
            revMinStake: REVIEWER_MIN_STAKE,
            minReviewsCount: MIN_REVIEWS_COUNT,
            vrfSubId: vrfMockSubscriptionId,
            vrfKeyHash: VRF_KEY_HASH,
            vrfGasLimit: VRF_CALLBACK_GAS_LIMIT,
            vrfConfirmations: VRF_REQUEST_CONFIRMATIONS,
            vrfNumWords: VRF_NUM_WORDS,
            vrfCoordinator: address(vrfCoordinatorMock)
        });
        bioVerify = new BioVerify(mockConfig);

        // 4. add bioVerify to mock vrf
        vrfCoordinatorMock.addConsumer(vrfMockSubscriptionId, address(bioVerify));
    }

    // ============= deployment
    function test_Deployment() public view {
        assertEq(bioVerify.I_AI_AGENT_ADDRESS(), aiAgentAddress);
        assertEq(bioVerify.I_TREASURY_ADDRESS(), treasuryAddress);
        assertEq(bioVerify.I_PUBLISHER_MIN_FEE(), PUBLISHER_MIN_FEE);
        assertEq(bioVerify.I_PUBLISHER_MIN_STAKE(), PUBLISHER_MIN_STAKE);
        assertEq(bioVerify.I_REVIEWER_MIN_STAKE(), REVIEWER_MIN_STAKE);
        assertEq(bioVerify.I_MIN_REVIEWS_COUNT(), MIN_REVIEWS_COUNT);
        assertEq(bioVerify.I_VRF_KEY_HASH(), VRF_KEY_HASH);
        assertEq(bioVerify.I_VRF_CALLBACK_GAS_LIMIT(), VRF_CALLBACK_GAS_LIMIT);
        assertEq(bioVerify.I_VRF_REQUEST_CONFIRMATIONS(), VRF_REQUEST_CONFIRMATIONS);
        assertEq(bioVerify.I_VRF_NUM_WORDS(), VRF_NUM_WORDS);

        // ENVIRONNEMENT SPECIFIC ASSERTIONS
        assertEq(bioVerify.I_VRF_SUBSCRIPTION_ID(), vrfMockSubscriptionId);
        assertEq(address(bioVerify.s_vrfCoordinator()), address(vrfCoordinatorMock));
    }

    // ============= SubmitPublication
    // SubmitPublication - happy path
    function test_SubmitPublication_EmitsCorrectEvent() public {
        // 1. Give the  publisher some money
        vm.deal(publisher, 1 ether);

        // 2. Expect the event to be emitted
        // [checkTopic1, checkTopic2, checkTopic3, checkData]
        vm.expectEmit(true, false, false, true);
        emit BioVerify_SubmittedPublication(publisher, 0, FAKE_CID);

        // 3. Perform the call
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
    }

    function test_SubmitPublication_RecordsCorrectAmountOnPublicationPaidSubmissionFee() public {
        // 1. Give the  publisher some money
        vm.deal(publisher, 1 ether);

        // 2. Perform the call
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 3. Assertions
        BioVerify.Publication memory publication = bioVerify.getFullPublication(0);
        assertEq(publication.paidSubmissionFee, VALID_PAID_PUBLISHER_FEE);
    }

    function test_SubmitPublication_RecordsCorrectAmountOnContract() public {
        // 1. Give the  publisher some money
        vm.deal(publisher, 1 ether);

        // 2. Perform the call
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 3. Assertions
        assertEq(address(bioVerify).balance, VALID_PAID_PUBLISHER_AMOUNT);
    }

    function test_SubmitPublication_StekesCorrectAmountOnPublication() public {
        // 1. Give the  publisher some money
        vm.deal(publisher, 1 ether);

        // 2. Perform the call
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 3. Assertions
        assertEq(bioVerify.publicationTotalStake(0), VALID_PAID_PUBLISHER_STAKE);
    }

    function test_SlashPublisher_ResetsReputation() public {
        // Set a fake high reputation score first
        vm.prank(aiAgentAddress);
        bioVerify.setMemberReputationScore(publisher, 100);

        // Submit a publication
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // Slash publisher
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        assertEq(bioVerify.getMemberReputationScore(publisher), 0);
    }

    // SubmitPublication - unhappy path
    function test_SubmitPublication_RevertIfZeroValueSent() public {
        // 1. Give the  publisher some money
        vm.deal(publisher, 1 ether);

        // 2. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayToPublish.selector));

        // 3. Perform the call
        vm.prank(publisher);
        bioVerify.submitPublication{value: 0}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
    }

    function test_SubmitPublication_RevertIfZeroPublisherStake() public {
        uint256 augmentedPublisherFee = PUBLISHER_MIN_FEE + 10 wei;
        uint256 invalidPublisherStake = PUBLISHER_MIN_STAKE - 10 wei;
        uint256 validPublisherAmount = invalidPublisherStake + augmentedPublisherFee;

        // 1. Give the  publisher some money
        vm.deal(publisher, 1 ether);

        // 2. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientPublisherStake.selector));

        // 3. Perform the call
        vm.prank(publisher);
        bioVerify.submitPublication{value: validPublisherAmount}(FAKE_CID, augmentedPublisherFee);
    }

    function test_SubmitPublication_RevertIfZeroPublisherFee() public {
        uint256 invalidPublisherFee = PUBLISHER_MIN_FEE - 10 wei;
        uint256 augmentedPublisherStake = PUBLISHER_MIN_STAKE + 10 wei;
        uint256 validPublisherAmount = augmentedPublisherStake + invalidPublisherFee;

        // 1. Give the  publisher some money
        vm.deal(publisher, 1 ether);

        // 2. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientPublisherFee.selector));

        // 3. Perform the call
        vm.prank(publisher);
        bioVerify.submitPublication{value: validPublisherAmount}(FAKE_CID, invalidPublisherFee);
    }

    // ============= slashPublisher
    // slashPublisher - happy path
    function test_SlashPublisher_ClearsStakeAndIncrementsTotalSlashed() public {
        vm.deal(publisher, 1 ether);

        // 1. Submit
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 2. Slash (Prank as the Agent)
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        // 3. Assertions
        assertEq(bioVerify.publicationTotalStake(0), 0);
        assertEq(bioVerify.publicationStakes(0, publisher), 0);
        assertEq(bioVerify.totalSlashed(), VALID_PAID_PUBLISHER_STAKE);

        // Check status is SLASHED
        BioVerify.Publication memory publication = bioVerify.getFullPublication(0);
        assertEq(uint256(publication.status), 4);
    }

    function test_SlashPublisher__EmitsCorrectEvent() public {
        vm.deal(publisher, 1 ether);

        // 1. Submit
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 2. Expect the event to be emitted
        // [checkTopic1, checkTopic2, checkTopic3, checkData]
        vm.expectEmit(true, false, false, true);
        // BioVerify_SlashedPublisher(_publicationId, publisher)
        emit BioVerify_SlashedPublisher(0, publisher);

        // 3. Perform the call
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);
    }

    // slashPublisher - unhappy path
    function test_SlashPublisher_RevertIfNotAgentCall() public {
        vm.deal(publisher, 1 ether);

        // 1. Submit
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 2. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_OnlyAgent.selector));

        // 3. Slash (Prank as Not Agent)
        vm.prank(user);
        bioVerify.slashPublisher(0);
    }

    function test_SlashPublisher_RevertIfPublicationIdNotValid() public {
        uint256 invalidPublicationId = 1;

        vm.deal(publisher, 1 ether);

        // 1. Submit
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 2. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InvalidPublicationId.selector, invalidPublicationId));

        // 3. Slash (Prank as Agent)
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(invalidPublicationId);
    }

    function test_SlashPublisher_RevertIfAlreadySlashed() public {
        vm.deal(publisher, 1 ether);

        // 1. Submit
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 2. Slash (Prank as Agent)
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        // 4. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_AlreadySlashed.selector, 0));

        // 5. Slash (Prank as Agent) again Publication
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);
    }

    // ============= transferTotalSlashed
    // transferTotalSlashed - happy path
    function test_TransferTotalSlashed_MovesFundsToTreasury() public {
        // Record initial balance of treasury
        uint256 initialTreasuryBalance = treasuryAddress.balance;

        //  Setup a slashed amount
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // Assertions

        // ---- Note: NO VRF

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        //  Trigger transfer as Agent
        vm.prank(aiAgentAddress);
        bioVerify.transferTotalSlashed();

        // Assertions
        assertEq(treasuryAddress.balance, initialTreasuryBalance + VALID_PAID_PUBLISHER_STAKE);
        assertEq(bioVerify.totalSlashed(), 0);
    }

    function test_TransferTotalSlashed_EmitCorrectEvent() public {
        // 1. Setup a slashed amount
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        // 2. Expect the event to be emitted
        // [checkTopic1, checkTopic2, checkTopic3, checkData]
        vm.expectEmit(true, false, false, true);
        //  BioVerify_Agent_TransferTotalSlashed(I_TREASURY_ADDRESS, value);
        emit BioVerify_Agent_TransferTotalSlashed(treasuryAddress, VALID_PAID_PUBLISHER_STAKE);

        // 3. Perform the call - Trigger transfer as Agent
        vm.prank(aiAgentAddress);
        bioVerify.transferTotalSlashed();
    }

    // transferTotalSlashed - unhappy path
    function test_TransferTotalSlashed_RevertIfNotAgentCall() public {
        // 1. Setup a slashed amount
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 2. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_OnlyAgent.selector));

        // 3. Perform the call - Trigger transfer as Not Agent
        vm.prank(user);
        bioVerify.transferTotalSlashed();
    }

    function test_TransferTotalSlashed_RevertIfZeroValueToTransfer() public {
        // 1. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_ZeroValueToTransfer.selector));

        // 2. Perform the call - Trigger transfer as Agent
        vm.prank(aiAgentAddress);
        bioVerify.transferTotalSlashed();
    }

    // ============= setMemberReputationScore
    // setMemberReputationScore - happy path
    function test_SetMemberReputationScore_Success() public {
        uint256 newScore = 85;

        vm.prank(aiAgentAddress);
        vm.expectEmit(true, false, false, true);
        emit BioVerify_Agent_SetMemberReputationScore(user, newScore);

        bioVerify.setMemberReputationScore(user, newScore);

        assertEq(bioVerify.getMemberReputationScore(user), newScore);
    }

    // setMemberReputationScore - unhappy path
    function test_SetMemberReputationScore_RevertIfNotAgent() public {
        vm.expectRevert(abi.encodeWithSelector(BioVerify_OnlyAgent.selector));
        vm.prank(user);
        bioVerify.setMemberReputationScore(user, 100);
    }

    // ============= joinReviewerPool
    // joinReviewerPool - path
    function test_JoinReviewerPool_Success() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        bioVerify.joinReviewerPool{value: REVIEWER_MIN_STAKE}();

        assertTrue(bioVerify.isReviewer(user));
        assertEq(bioVerify.reviewerPool(0), user);
        assertEq(bioVerify.reviewerTotalStake(user), REVIEWER_MIN_STAKE);
    }

    function test_JoinReviewerPool_Success_EmitsCorrectEvent() public {
        vm.deal(user, 1 ether);

        // 1. Expect the event to be emitted
        // [checkTopic1, checkTopic2, checkTopic3, checkData]
        vm.expectEmit(true, false, false, true);
        //  BioVerify_JoinReviewerPool(address reviewer);
        emit BioVerify_JoinReviewerPool(user);

        // 2. Perform the call
        vm.prank(user);
        bioVerify.joinReviewerPool{value: REVIEWER_MIN_STAKE}();
    }

    function test_JoinReviewerPool_RecordsHigherStake() public {
        // Test that if a reviewer sends more than the min, it's recorded
        uint256 highStake = REVIEWER_MIN_STAKE + 0.5 ether;
        vm.deal(user, 1 ether);

        vm.prank(user);
        bioVerify.joinReviewerPool{value: highStake}();

        assertEq(bioVerify.reviewerTotalStake(user), highStake);
    }

    // joinReviewerPool - unhappy path
    function test_JoinReviewerPool_RevertIfZeroStake() public {
        // Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientReviewerStake.selector));

        // Perform the call
        vm.deal(user, 1 ether);
        vm.prank(user);
        bioVerify.joinReviewerPool{value: 0}();
    }

    function test_JoinReviewerPool_RevertIfStakeTooLow() public {
        uint256 lowStake = REVIEWER_MIN_STAKE - 1 wei;
        vm.deal(user, 1 ether);

        // Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientReviewerStake.selector));

        // Perform the call
        vm.prank(user);
        bioVerify.joinReviewerPool{value: lowStake}();
    }

    function test_JoinReviewerPool_RevertIfAlreadyReviewer() public {
        // 1. joinReviewerPool
        vm.deal(user, 1 ether);
        vm.prank(user);
        bioVerify.joinReviewerPool{value: REVIEWER_MIN_STAKE}();

        // 2. Expect revert
        vm.expectRevert(abi.encodeWithSelector(BioVerify_AlreadyReviewer.selector));

        // 2. Perform the call - joinReviewerPool 2nd time
        vm.prank(user);
        bioVerify.joinReviewerPool{value: REVIEWER_MIN_STAKE}();
    }

    // ============= pickReviewers
    // pickReviewers - path
    function test_FullVRFReviewerSelectionFlow() public {
        // 1. Setup: Pool size must be VRF_NUM_WORDS + 1 (7)
        uint256 poolSize = VRF_NUM_WORDS + 1;
        uint32 highRepReviewerIndex = 1;

        address[] memory reviewers = new address[](poolSize);
        for (uint32 i = 0; i < poolSize; ++i) {
            reviewers[i] = makeAddr(string(abi.encodePacked("r", i)));
            vm.deal(reviewers[i], 1 ether);
            vm.prank(reviewers[i]);
            bioVerify.joinReviewerPool{value: REVIEWER_MIN_STAKE}();

            // Give one reviewer high rep to test Senior selection later
            if (i == highRepReviewerIndex) {
                vm.prank(aiAgentAddress);
                bioVerify.setMemberReputationScore(reviewers[i], 500);
            }
        }

        // 2. Submit Publication
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 3. Agent triggers pickReviewers
        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);

        // Assertions
        BioVerify.Publication memory pub = bioVerify.getFullPublication(0);
        assertEq(uint256(pub.status), 1); // Status.IN_REVIEW

        // 4. Simulate Chainlink VRF Fulfillment
        // This triggers fulfillRandomWords in contract
        vrfCoordinatorMock.fulfillRandomWords(requestId, address(bioVerify));

        // 5. Assertions
        pub = bioVerify.getFullPublication(0);
        // Total picked is 6 (1 Senior + 5 Peers)
        assertEq(pub.reviewers.length, VRF_NUM_WORDS - 1);
        assertEq(pub.seniorReviewer, reviewers[highRepReviewerIndex]);

        // Ensure publisher is NOT in the reviewer list (Self-Review Protection)
        for (uint256 i = 0; i < pub.reviewers.length; i++) {
            assertTrue(pub.reviewers[i] != publisher, "Publisher selected as reviewer!");
        }

        // Ensure publisher is NOT the seniorReviewer (Self-Review Protection)
        assertTrue(pub.seniorReviewer != publisher, "Publisher selected as seniorReviewer!");
    }

    // "Publisher Collision" Test
    // This forces the VRF to pick the publisher, proving the contract correctly increments the index to find a valid reviewer instead.
    function test_VRF_SkipsPublisherIfSelected() public {
        // 1. Setup: Pool size must be VRF_NUM_WORDS + 1 (7)
        uint256 poolSize = VRF_NUM_WORDS + 1;
        address[] memory users = new address[](poolSize);

        // Make index 0 the publisher
        users[0] = publisher;
        for (uint256 i = 1; i < poolSize; i++) {
            users[i] = makeAddr(string(abi.encodePacked("r", i)));
        }

        for (uint256 i = 0; i < poolSize; i++) {
            vm.deal(users[i], 1 ether);
            vm.prank(users[i]);
            bioVerify.joinReviewerPool{value: REVIEWER_MIN_STAKE}();
        }

        // 2. Submit as publisher
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 3. Request VRF
        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);

        // 4. Force Mock to return indices starting with 0 (the publisher)
        uint256[] memory words = new uint256[](VRF_NUM_WORDS);
        for (uint256 i = 0; i < VRF_NUM_WORDS; i++) {
            words[i] = i;
        }

        vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, address(bioVerify), words);

        // 5. Assertions
        BioVerify.Publication memory pub = bioVerify.getFullPublication(0);

        // Senior should not be publisher
        assertTrue(pub.seniorReviewer != publisher, "Senior Reviewer is publisher!");

        // Peers should not be publisher
        for (uint256 i = 0; i < pub.reviewers.length; i++) {
            assertTrue(pub.reviewers[i] != publisher, "Publisher was selected in peer reviewers!");
        }

        // Total picked is 6 (1 Senior + 5 Peers)
        assertEq(pub.reviewers.length, VRF_NUM_WORDS - 1);
        // seniorReviewer should have been picked
        assertTrue(pub.seniorReviewer != address(0));
    }

    // "Duplicate Selection" Test
    // This forces the VRF to pick the same index twice, triggering the branch that checks _isAlreadySelected.
    function test_VRF_HandlesDuplicateIndices() public {
        // 1. Setup Pool of 7
        uint256 poolSize = VRF_NUM_WORDS + 1;
        address[] memory r = new address[](poolSize);
        for (uint256 i = 0; i < poolSize; i++) {
            r[i] = makeAddr(string(abi.encodePacked("rev", i)));
            vm.deal(r[i], 1 ether);
            vm.prank(r[i]);
            bioVerify.joinReviewerPool{value: REVIEWER_MIN_STAKE}();
        }

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);

        // 2. Force Mock to return duplicates: [1, 1, 1, 1, 1, 1]
        // The contract must increment each time to find unique reviewers
        uint256[] memory words = new uint256[](VRF_NUM_WORDS);
        for (uint256 i = 0; i < VRF_NUM_WORDS; i++) {
            words[i] = 1;
        }

        vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, address(bioVerify), words);

        // 3. Assertions
        BioVerify.Publication memory pub = bioVerify.getFullPublication(0);

        // Total picked is 6 (1 Senior + 5 Peers)
        assertEq(pub.reviewers.length, VRF_NUM_WORDS - 1);
        // seniorReviewer should have been picked
        assertTrue(pub.seniorReviewer != address(0));

        // Verify uniqueness (Basic check: Senior is not in Peer array)
        for (uint256 i = 0; i < pub.reviewers.length; i++) {
            assertTrue(pub.reviewers[i] != pub.seniorReviewer, "Senior found in peer list!");
        }
    }

    // pickReviewers - unhappy path
    function test_PickReviewers_RevertsIfInsufficientPool() public {
        // 1. Submit a publication
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 2. Only 0 reviewers in pool (requires I_VRF_NUM_WORDS + 1)
        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientReviewerPool.selector, 0));
        bioVerify.pickReviewers(0);
    }
}

