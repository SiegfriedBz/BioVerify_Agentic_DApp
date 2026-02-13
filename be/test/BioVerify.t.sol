// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {Constants} from "../script/Constants.sol";
import {
    BioVerify,
    BioVerifyConfig,

    // events
    BioVerify_SubmitPublication,
    BioVerify_PayReviewerMinStake,
    BioVerify_Agent_TransferSlashedPool,
    BioVerify_Agent_SlashPublisher,
    BioVerify_Agent_SlashMember,
    BioVerify_Agent_SetMemberReputation,

    // errors
    BioVerify_MustPayToPublish,
    BioVerify_InsufficientPublisherStake,
    BioVerify_InsufficientPublisherFee,
    BioVerify_OnlyAgent,
    BioVerify_InvalidPublicationId,
    BioVerify_AlreadySlashed,
    BioVerify_ZeroValueToTransfer,
    BioVerify_MustPayReviewerMinStake,
    BioVerify_InsufficientReviewersPool
} from  // Updated to plural
"../src/BioVerify.sol";

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

    VRFCoordinatorV2_5Mock vrfCoordinatorMock;
    uint256 vrfMockSubscriptionId;

    function setUp() public {
        // 1. Deploy the Mock Coordinator locally
        vrfCoordinatorMock = new VRFCoordinatorV2_5Mock(
            0.01 ether, // baseFee
            0.0003 ether, // gasPriceLink
            1e18 // weiPerUnitLink
        );

        // 2. create & fund Subscription to mock vrf
        vrfMockSubscriptionId = vrfCoordinatorMock.createSubscription();
        vrfCoordinatorMock.fundSubscriptionWithNative{value: 1000 ether}(vrfMockSubscriptionId);

        // 3. Deploy BioVerify
        BioVerifyConfig memory mockConfig = BioVerifyConfig({
            reputationBoost: REPUTATION_BOOST,
            aiAgent: aiAgentAddress,
            treasury: treasuryAddress,
            pubMinFee: PUBLISHER_MIN_FEE,
            pubMinStake: PUBLISHER_MIN_STAKE,
            revMinStake: REVIEWER_MIN_STAKE,
            revReward: REVIEWER_REWARD,
            minReviewsCount: MIN_REVIEWS_COUNT,
            vrfSubId: vrfMockSubscriptionId,
            vrfKeyHash: VRF_KEY_HASH,
            vrfGasLimit: VRF_CALLBACK_GAS_LIMIT,
            vrfConfirmations: VRF_REQUEST_CONFIRMATIONS,
            vrfNumWords: VRF_NUM_WORDS,
            vrfCoordinator: address(vrfCoordinatorMock)
        });
        bioVerify = new BioVerify{value: DEPLOYMENT_VALUE}(mockConfig);

        // 4. add bioVerify to mock vrf
        vrfCoordinatorMock.addConsumer(vrfMockSubscriptionId, address(bioVerify));
    }

    // ============= deployment
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
        assertEq(bioVerify.I_MIN_REVIEWS_COUNT(), MIN_REVIEWS_COUNT);
        assertEq(bioVerify.I_VRF_KEY_HASH(), VRF_KEY_HASH);
        assertEq(bioVerify.I_VRF_CALLBACK_GAS_LIMIT(), VRF_CALLBACK_GAS_LIMIT);
        assertEq(bioVerify.I_VRF_REQUEST_CONFIRMATIONS(), VRF_REQUEST_CONFIRMATIONS);
        assertEq(bioVerify.I_VRF_NUM_WORDS(), VRF_NUM_WORDS);
        assertEq(bioVerify.I_VRF_SUBSCRIPTION_ID(), vrfMockSubscriptionId);
    }

    // ============= SubmitPublication
    function test_SubmitPublication_EmitsCorrectEvent() public {
        vm.deal(publisher, 1 ether);

        vm.expectEmit(true, true, true, false); // Checked topics: publisher, pubId, cid
        emit BioVerify_SubmitPublication(publisher, 0, FAKE_CID);

        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);
    }

    function test_SubmitPublication_RecordsCorrectAmountOnPublicationPaidSubmissionFee() public {
        vm.deal(publisher, 1 ether);

        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        BioVerify.Publication memory publication = bioVerify.getPublication(0);
        assertEq(publication.paidSubmissionFee, VALID_PAID_PUBLISHER_FEE);
    }

    function test_SubmitPublication_IncreasesContractBalance() public {
        uint256 initContractBalance = address(bioVerify).balance;

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        uint256 expectedContractBalance = initContractBalance + VALID_PAID_PUBLISHER_AMOUNT;
        assertEq(address(bioVerify).balance, expectedContractBalance);
    }

    function test_SubmitPublication_StakesCorrectAmountOnPublication() public {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // Updated to use getPublication struct
        assertEq(bioVerify.getPublication(0).stakes, VALID_PAID_PUBLISHER_STAKE);
    }

    // SubmitPublication - unhappy path
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

    // ============= slashPublisher
    // slashPublisher - happy path
    function test_SlashPublisher_DropsHighReputation() public {
        uint256 initReputation = 1_000_000; // > REPUTATION_BOOST

        vm.prank(aiAgentAddress);
        bioVerify.setMemberReputation(publisher, initReputation);

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        uint256 expectedReputation = initReputation > REPUTATION_BOOST ? initReputation - REPUTATION_BOOST : 0;
        assertEq(bioVerify.getMemberReputation(publisher), expectedReputation);
    }

    function test_SlashPublisher_ZeroesLowReputation() public {
        uint256 initReputation = 10; // < REPUTATION_BOOST

        vm.prank(aiAgentAddress);
        bioVerify.setMemberReputation(publisher, initReputation);

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        uint256 expectedReputation = initReputation > REPUTATION_BOOST ? initReputation - REPUTATION_BOOST : 0;
        assertEq(bioVerify.getMemberReputation(publisher), expectedReputation);
    }

    function test_SlashPublisher_SlashesPublicationStakeAndIncreasesSlashedPool() public {
        uint256 initSlashedPool = bioVerify.slashedPool();
        uint256 initReputation = 1_000;

        vm.prank(aiAgentAddress);
        bioVerify.setMemberReputation(publisher, initReputation);

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        uint256 publisherStake = VALID_PAID_PUBLISHER_AMOUNT - VALID_PAID_PUBLISHER_FEE;
        uint256 expectedSlashedPool = initSlashedPool + publisherStake;

        assertEq(bioVerify.slashedPool(), expectedSlashedPool);
    }

    function test_SlashPublisher_SetCorrectPublicationStatus() public {
        uint256 initReputation = 1_000;

        vm.prank(aiAgentAddress);
        bioVerify.setMemberReputation(publisher, initReputation);

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        assertEq(uint256(bioVerify.getPublication(0).status), 2); // Status.SLASHED
    }

    function test_SlashPublisher_EmitsCorrectEvent() public {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // Expect the slash event from _slashMember
        vm.expectEmit(true, true, true, false);
        // Event: BioVerify_Agent_SlashPublisher(uint256 indexed pubId, address indexed publisher);
        emit BioVerify_Agent_SlashPublisher(0, publisher);

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);
    }

    // slashPublisher - unhappy path
    function test_SlashPublisher_RevertIfNotAgentCall() public {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_OnlyAgent.selector));
        vm.prank(user);
        bioVerify.slashPublisher(0);
    }

    function test_SlashPublisher_RevertIfPublicationIdNotValid() public {
        uint256 invalidPublicationId = 1;
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_InvalidPublicationId.selector, invalidPublicationId));
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(invalidPublicationId);
    }

    function test_SlashPublisher_RevertIfAlreadySlashed() public {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_AlreadySlashed.selector, 0));
        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);
    }

    // ============= transferSlashedPool
    function test_TransferTotalSlashed_MovesFundsToTreasury() public {
        uint256 initialTreasuryBalance = treasuryAddress.balance;

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        vm.prank(aiAgentAddress);
        bioVerify.transferSlashedPool();

        assertEq(treasuryAddress.balance, initialTreasuryBalance + VALID_PAID_PUBLISHER_STAKE);
        assertEq(bioVerify.slashedPool(), 0);
    }

    function test_TransferTotalSlashed_EmitCorrectEvent() public {
        uint256 initSlashedPool = bioVerify.slashedPool();

        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        uint256 publisherStake = VALID_PAID_PUBLISHER_AMOUNT - VALID_PAID_PUBLISHER_FEE;
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        bioVerify.slashPublisher(0);

        uint256 expectedSlashedPool = initSlashedPool + publisherStake;

        vm.expectEmit(true, true, false, true);
        emit BioVerify_Agent_TransferSlashedPool(treasuryAddress, expectedSlashedPool);

        vm.prank(aiAgentAddress);
        bioVerify.transferSlashedPool();
    }

    // transferSlashedPool - unhappy path
    function test_TransferTotalSlashed_RevertIfNotAgentCall() public {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_OnlyAgent.selector));
        vm.prank(user);
        bioVerify.transferSlashedPool();
    }

    function test_TransferTotalSlashed_RevertIfZeroValueToTransfer() public {
        vm.expectRevert(abi.encodeWithSelector(BioVerify_ZeroValueToTransfer.selector));
        vm.prank(aiAgentAddress);
        bioVerify.transferSlashedPool();
    }

    // ============= setMemberReputation
    // setMemberReputation - happy path
    function test_SetMemberReputation_Success() public {
        uint256 newScore = 85;

        vm.prank(aiAgentAddress);
        vm.expectEmit(true, false, false, true);
        emit BioVerify_Agent_SetMemberReputation(user, newScore);

        bioVerify.setMemberReputation(user, newScore);

        assertEq(bioVerify.getMemberReputation(user), newScore);
    }

    // setMemberReputation - unhappy path
    function test_SetMemberReputation_RevertIfNotAgent() public {
        vm.expectRevert(abi.encodeWithSelector(BioVerify_OnlyAgent.selector));
        vm.prank(user);
        bioVerify.setMemberReputation(user, 100);
    }

    // ============= payReviewerMinStake
    function test_PayReviewerMinStake_Success() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();

        (address mAddr, uint256 mStakes, bool isRev,) = bioVerify.addressToMember(user);

        assertEq(mAddr, user);
        assertTrue(isRev);
        assertEq(mStakes, REVIEWER_MIN_STAKE);
    }

    function test_PayReviewerMinStake_Success_EmitsCorrectEvent() public {
        vm.deal(user, 1 ether);
        vm.expectEmit(true, false, false, true);
        emit BioVerify_PayReviewerMinStake(user);

        vm.prank(user);
        bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();
    }

    // unhappy path
    function test_PayReviewerMinStake_RevertIfZeroStake() public {
        vm.deal(user, 1 ether);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayReviewerMinStake.selector));
        vm.prank(user);
        bioVerify.payReviewerMinStake{value: 0}();
    }

    function test_PayReviewerMinStake_RevertIfStakeTooLow() public {
        uint256 lowStake = REVIEWER_MIN_STAKE - 1 wei;
        vm.deal(user, 1 ether);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_MustPayReviewerMinStake.selector));
        vm.prank(user);
        bioVerify.payReviewerMinStake{value: lowStake}();
    }

    // Updated: The new contract allows paying again (topping up), so we verify that behavior instead of reverting
    function test_PayReviewerMinStake_AllowsTopUp() public {
        vm.deal(user, 2 ether);

        // First pay
        vm.prank(user);
        bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();

        // Second pay (Top Up)
        vm.prank(user);
        bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();

        // Stakes should be doubled
        (, uint256 mStakes,,) = bioVerify.addressToMember(user);
        assertEq(mStakes, REVIEWER_MIN_STAKE * 2);
    }

    // ============= pickReviewers
    function test_FullVRFReviewerSelectionFlow() public {
        // 1. Setup: Pool size must be VRF_NUM_WORDS + 1
        uint256 poolSize = VRF_NUM_WORDS + 1;
        uint32 highRepReviewerIndex = 1;

        address[] memory reviewers = new address[](poolSize);
        for (uint32 i = 0; i < poolSize; ++i) {
            reviewers[i] = makeAddr(string(abi.encodePacked("r", i)));
            vm.deal(reviewers[i], 1 ether);
            vm.prank(reviewers[i]);
            bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();

            if (i == highRepReviewerIndex) {
                vm.prank(aiAgentAddress);
                bioVerify.setMemberReputation(reviewers[i], 500);
            }
        }

        // 2. Submit
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        // 3. Pick
        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);

        BioVerify.Publication memory pub = bioVerify.getPublication(0);
        assertEq(uint256(pub.status), 1); // Status.IN_REVIEW

        // 4. Fulfill VRF
        vrfCoordinatorMock.fulfillRandomWords(requestId, address(bioVerify));

        // 5. Assertions
        pub = bioVerify.getPublication(0);
        // We pick VRF_NUM_WORDS total. The senior is one of them.
        // The contract pushes (VRF_NUM_WORDS - 1) into `reviewers` array, and assigns 1 to `seniorReviewer`.
        assertEq(pub.reviewers.length, VRF_NUM_WORDS - 1);
        assertEq(pub.seniorReviewer, reviewers[highRepReviewerIndex]);

        for (uint256 i = 0; i < pub.reviewers.length; i++) {
            assertTrue(pub.reviewers[i] != publisher);
        }
        assertTrue(pub.seniorReviewer != publisher);
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

        BioVerify.Publication memory pub = bioVerify.getPublication(0);
        assertTrue(pub.seniorReviewer != publisher);
        for (uint256 i = 0; i < pub.reviewers.length; i++) {
            assertTrue(pub.reviewers[i] != publisher);
        }
    }

    function test_PickReviewers_RevertsIfInsufficientPool() public {
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientReviewersPool.selector, 0));
        bioVerify.pickReviewers(0);
    }

    // ============= publishPublication
    function test_PublishPublication_RewardsHonestAndSlashesNegligent() public {
        // --- 1. SETUP: Initialize the Reviewer Pool ---
        // Total needed: The peers picked by VRF + the 1 Senior Reviewer
        uint32 numReviewers = VRF_NUM_WORDS + 1;

        for (uint32 i = 0; i < numReviewers; i++) {
            address rev = makeAddr(string(abi.encodePacked("rev", i)));
            vm.deal(rev, 1 ether);
            vm.prank(rev);
            bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();
        }

        // 2. SUBMIT & PICK
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerify.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(FAKE_CID, VALID_PAID_PUBLISHER_FEE);

        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);
        vrfCoordinatorMock.fulfillRandomWords(requestId, address(bioVerify));

        BioVerify.Publication memory pub = bioVerify.getPublication(0);

        // 3. DYNAMICALLY SORT ALL ASSIGNED REVIEWERS
        // We must account for the Senior + all 5 Peers = 6 total reviewers
        address[] memory honest = new address[](3);
        address[] memory negligent = new address[](3);

        // Fill Honest: Senior + first 2 peers
        honest[0] = pub.seniorReviewer;
        honest[1] = pub.reviewers[0];
        honest[2] = pub.reviewers[1];

        // Fill Negligent: the remaining 3 peers
        negligent[0] = pub.reviewers[2];
        negligent[1] = pub.reviewers[3];
        negligent[2] = pub.reviewers[4];

        uint256 initSlashedPool = bioVerify.slashedPool();

        // 4. ACTION
        vm.prank(aiAgentAddress);
        bioVerify.publishPublication(0, honest, negligent);

        // 5. ASSERTIONS
        BioVerify.Publication memory finalizedPub = bioVerify.getPublication(0);

        // PUBLISHER STAKE: (VALID_PAID_PUBLISHER_AMOUNT - VALID_PAID_PUBLISHER_FEE)
        uint256 publisherStake = VALID_PAID_PUBLISHER_AMOUNT - VALID_PAID_PUBLISHER_FEE;

        // HONEST PAYOUT: 3 people * (Stake + Reward)
        uint256 honestPayoutTotal = honest.length * (REVIEWER_MIN_STAKE + REVIEWER_REWARD);

        // The new declarative total
        uint256 expectedStakes = publisherStake + honestPayoutTotal;

        assertEq(finalizedPub.stakes, expectedStakes, "Publication stakes mismatch");
        assertEq(
            bioVerify.slashedPool(), initSlashedPool + (negligent.length * REVIEWER_MIN_STAKE), "Slashed pool mismatch"
        );
    }

    // ============= slashPublication
    function test_SlashPublication_SlashesPublisherAndNegligentReviewers() public {
        // --- 1. SETUP: Initialize the Reviewer Pool ---
        // Total needed: The peers picked by VRF + the 1 Senior Reviewer
        uint32 totalReviewersNeeded = VRF_NUM_WORDS + 1;

        for (uint32 i = 0; i < totalReviewersNeeded; i++) {
            address rev = makeAddr(string(abi.encodePacked("reviewer", i)));
            vm.deal(rev, 1 ether);
            vm.prank(rev);
            bioVerify.payReviewerMinStake{value: REVIEWER_MIN_STAKE}();
        }

        // --- 2. SUBMISSION & VRF SELECTION ---
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        // Publisher pays stake + fee
        bioVerify.submitPublication{value: PUBLISHER_MIN_STAKE + PUBLISHER_MIN_FEE}("ipfs://test", PUBLISHER_MIN_FEE);

        // AI Agent triggers the VRF to pick the committee
        vm.prank(aiAgentAddress);
        uint256 requestId = bioVerify.pickReviewers(0);
        vrfCoordinatorMock.fulfillRandomWords(requestId, address(bioVerify));

        // --- 3. DYNAMIC CATEGORIZATION (Sorting the Committee) ---
        BioVerify.Publication memory pub = bioVerify.getPublication(0);

        // We decide our split: Senior + first 2 peers = Honest (3 total)
        // The remaining peers = Negligent (VRF_NUM_WORDS - 2)
        uint256 peersToMakeHonest = 2;

        address[] memory honest = new address[](1 + peersToMakeHonest); // +1 for Senior
        address[] memory negligent = new address[](VRF_NUM_WORDS - peersToMakeHonest);

        // A. Senior always goes to Honest
        honest[0] = pub.seniorReviewer;

        // B. Distribute Peers based on the index
        uint256 hIdx = 1; // Start at 1 because Senior is at 0
        uint256 nIdx = 0;

        for (uint256 i = 0; i < pub.reviewers.length; i++) {
            if (i < peersToMakeHonest) {
                honest[hIdx] = pub.reviewers[i];
                hIdx++;
            } else {
                negligent[nIdx] = pub.reviewers[i];
                nIdx++;
            }
        }

        // --- 4. THE ACTION: SLASHER ---
        uint256 startSlashedPool = bioVerify.slashedPool();

        vm.prank(aiAgentAddress);
        bioVerify.slashPublication(0, honest, negligent);

        // --- 5. VERIFICATION (Using Array Lengths, No Magic Numbers) ---
        BioVerify.Publication memory finalizedPub = bioVerify.getPublication(0);

        // Treasury Gain: Publisher's stake + stakes of everyone in the negligent array
        uint256 expectedSlashedIncrease = PUBLISHER_MIN_STAKE + (negligent.length * REVIEWER_MIN_STAKE);
        assertEq(bioVerify.slashedPool(), startSlashedPool + expectedSlashedIncrease, "Treasury accounting failed");

        // Contract Liability: Remaining stakes should only belong to honest reviewers
        // Each honest reviewer now holds: (Original Stake + Reward)
        uint256 expectedRemainingStakes = honest.length * (REVIEWER_MIN_STAKE + REVIEWER_REWARD);
        assertEq(finalizedPub.stakes, expectedRemainingStakes, "Publication stakes accounting failed");

        // Final State Checks
        assertEq(bioVerify.memberStakeOnPubId(publisher, 0), 0, "Publisher not fully slashed");
        assertEq(bioVerify.memberStakeOnPubId(negligent[0], 0), 0, "Negligent reviewer not fully slashed");
        assertEq(
            bioVerify.memberStakeOnPubId(honest[0], 0),
            REVIEWER_MIN_STAKE + REVIEWER_REWARD,
            "Honest reviewer did not receive reward"
        );
    }
}
