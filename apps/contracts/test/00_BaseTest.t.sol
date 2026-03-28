// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {Constants} from "../script/Constants.sol";
import {BioVerifyV3, BioVerifyConfig} from "../src/BioVerifyV3.sol";

contract BaseTest is Test, Constants {
    BioVerifyV3 public bioVerify;

    uint256 constant DEPLOY_VALUE = 1_000 ether;
    string constant FAKE_CID = "ipfs://test-hash";
    string constant FAKE_VERDICT_CID = "ipfs://test-verdict-hash";

    address publisher = makeAddr("publisher");
    address user = makeAddr("user");

    uint256 deployerPrivateKey;
    uint256 reputationBoost;
    address aiAgentAddress;
    address treasuryAddress;
    uint256 publisherMinFee;
    uint256 publisherStake;
    uint256 reviewerStake;
    uint256 reviewerReward;
    uint256 validPaidPublisherAmount;
    uint32 vrfNumWords;
    uint256 validMinReviewersPoolSize;

    VRFCoordinatorV2_5Mock vrfCoordinatorMock;
    uint256 vrfMockSubscriptionId;

    function setUp() public {
        // 1. Fetch Environment Variables
        deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        aiAgentAddress = vm.envAddress("AI_AGENT_ADDRESS");
        treasuryAddress = vm.envAddress("TREASURY_ADDRESS");
        reputationBoost = vm.envUint("REPUTATION_BOOST");
        // Publisher
        publisherMinFee = vm.envUint("PUBLISHER_MIN_FEE");
        publisherStake = vm.envUint("PUBLISHER_STAKE");
        validPaidPublisherAmount = publisherMinFee + publisherStake;

        // Reviewer
        reviewerStake = vm.envUint("REVIEWER_STAKE");
        reviewerReward = vm.envUint("REVIEWER_REWARD");

        vrfNumWords = uint32(vm.envUint("VRF_NUM_WORDS"));
        validMinReviewersPoolSize = vrfNumWords + 1; // + 1 needed to prevent publisher to self-review
        vrfCoordinatorMock = new VRFCoordinatorV2_5Mock(0.01 ether, 0.0003 ether, 1e18);
        vrfMockSubscriptionId = vrfCoordinatorMock.createSubscription();
        vrfCoordinatorMock.fundSubscriptionWithNative{value: 1000 ether}(vrfMockSubscriptionId);

        BioVerifyConfig memory mockConfig = _getMockConfig();
        bioVerify = new BioVerifyV3{value: DEPLOY_VALUE}(mockConfig);
        vrfCoordinatorMock.addConsumer(vrfMockSubscriptionId, address(bioVerify));
    }

    function _getMockConfig() internal view returns (BioVerifyConfig memory) {
        return BioVerifyConfig({
            reputationBoost: reputationBoost,
            aiAgent: aiAgentAddress,
            treasury: treasuryAddress,
            pubMinFee: publisherMinFee,
            pubMinStake: publisherStake,
            revMinStake: reviewerStake,
            revReward: reviewerReward,
            vrfNumWords: vrfNumWords,
            vrfGasLimit: VRF_CALLBACK_GAS_LIMIT,
            vrfConfirmations: VRF_REQUEST_CONFIRMATIONS,
            vrfKeyHash: VRF_BASE_SEPOLIA_KEY_HASH,
            vrfSubId: vrfMockSubscriptionId,
            vrfCoordinator: address(vrfCoordinatorMock)
        });
    }
}
