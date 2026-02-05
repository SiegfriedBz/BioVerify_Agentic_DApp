// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {BioVerify} from "../src/BioVerify.sol";
import {Constants} from ".//Constants.sol";

contract BioVerifyScript is Script, Constants {
    BioVerify public bioVerify;
    address aiAgentAddress = vm.envAddress("AI_AGENT_ADDRESS");
    address treasuryAddress = vm.envAddress("TREASURY_ADDRESS");
    uint256 vrfSubscriptionId = uint256(vm.envUint("VRF_SUBSCRIPTION_ID"));

    function setUp() public {}

    function run() public returns (BioVerify) {
        vm.startBroadcast();

        /**
         * constructor
         * address _aiAgentAddress,
         * address _treasuryAddress,
         * uint256 _publisherMinFee,
         * uint256 _publisherMinStake,
         * uint256 _reviewerMinStake,
         * uint256 _vrfSubscriptionId,
         * bytes32 _vrfKeyHash,
         * uint32 _vrfCallbackGasLimit,
         * uint16 _vrfRequestConfirmations,
         * uint32 _vrfNumWords,
         * address _vrfCoordinator
         */
        bioVerify = new BioVerify(
            aiAgentAddress,
            treasuryAddress,
            PUBLISHER_MIN_FEE,
            PUBLISHER_MIN_STAKE,
            REVIEWER_MIN_STAKE,
            vrfSubscriptionId,
            VRF_KEY_HASH,
            VRF_CALLBACK_GAS_LIMIT,
            VRF_REQUEST_CONFIRMATIONS,
            VRF_NUM_WORDS,
            VRF_SEPOLIA_COORDINATOR
        );

        vm.stopBroadcast();

        return bioVerify;
    }
}
