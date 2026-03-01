// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {Constants} from "../script/Constants.sol";
import {
    BioVerifyV3,
    BioVerifyConfig,

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

contract BaseTest is Test, Constants {
    BioVerifyV3 public bioVerify;

    address aiAgentAddress = vm.envAddress("AI_AGENT_ADDRESS");
    address treasuryAddress = vm.envAddress("TREASURY_ADDRESS");

    address publisher = makeAddr("publisher");
    address user = makeAddr("user");

    uint256 constant DEPLOYMENT_VALUE = 1_000 ether;
    uint256 constant VALID_PAID_PUBLISHER_FEE = PUBLISHER_MIN_FEE;
    uint256 constant VALID_PAID_PUBLISHER_STAKE = PUBLISHER_STAKE;
    uint256 constant VALID_PAID_PUBLISHER_AMOUNT = VALID_PAID_PUBLISHER_FEE + VALID_PAID_PUBLISHER_STAKE;

    uint256 VALID_MIN_REVIEWERS_POOL_SIZE = VRF_NUM_WORDS + 1; // + 1 needed to prevent publisher to self-review

    string constant FAKE_CID = "ipfs://test-hash";
    string constant FAKE_VERDICT_CID = "ipfs://test-verdict-hash";

    VRFCoordinatorV2_5Mock vrfCoordinatorMock;
    uint256 vrfMockSubscriptionId;

    function setUp() public {
        vrfCoordinatorMock = new VRFCoordinatorV2_5Mock(0.01 ether, 0.0003 ether, 1e18);
        vrfMockSubscriptionId = vrfCoordinatorMock.createSubscription();
        vrfCoordinatorMock.fundSubscriptionWithNative{value: 1000 ether}(vrfMockSubscriptionId);

        BioVerifyConfig memory mockConfig = _getMockConfig();
        bioVerify = new BioVerifyV3{value: DEPLOYMENT_VALUE}(mockConfig);
        vrfCoordinatorMock.addConsumer(vrfMockSubscriptionId, address(bioVerify));
    }

    function _getMockConfig() internal view returns (BioVerifyConfig memory) {
        return BioVerifyConfig({
            reputationBoost: REPUTATION_BOOST,
            aiAgent: aiAgentAddress,
            treasury: treasuryAddress,
            pubMinFee: PUBLISHER_MIN_FEE,
            pubMinStake: PUBLISHER_STAKE,
            revMinStake: REVIEWER_STAKE,
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
