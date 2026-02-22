// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {BioVerify, BioVerifyConfig} from "../src/BioVerify.sol";
import {Constants} from ".//Constants.sol";

contract BioVerifyScript is Script, Constants {
    BioVerify public bioVerify;
    address aiAgentAddress = vm.envAddress("AI_AGENT_ADDRESS");
    address treasuryAddress = vm.envAddress("TREASURY_ADDRESS");
    uint256 vrfSubscriptionId = uint256(vm.envUint("VRF_SUBSCRIPTION_ID"));

    BioVerifyConfig config = BioVerifyConfig({
        reputationBoost: REPUTATION_BOOST,
        aiAgent: aiAgentAddress,
        treasury: treasuryAddress,
        // publisher
        pubMinFee: PUBLISHER_MIN_FEE,
        pubMinStake: PUBLISHER_MIN_STAKE,
        // reviewer
        revMinStake: REVIEWER_MIN_STAKE,
        revReward: REVIEWER_REWARD,
        // VRF
        vrfSubId: vrfSubscriptionId,
        vrfKeyHash: VRF_KEY_HASH,
        vrfGasLimit: VRF_CALLBACK_GAS_LIMIT,
        vrfConfirmations: VRF_REQUEST_CONFIRMATIONS,
        vrfNumWords: VRF_NUM_WORDS,
        vrfCoordinator: VRF_SEPOLIA_COORDINATOR
    });

    function setUp() public {}

    function run() public returns (BioVerify) {
        vm.startBroadcast();

        bioVerify = new BioVerify{value: 0.0005 ether}(config);

        vm.stopBroadcast();

        return bioVerify;
    }
}
