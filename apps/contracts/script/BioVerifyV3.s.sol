// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {BioVerifyV3, BioVerifyConfig} from "../src/BioVerifyV3.sol";
import {Constants} from "./Constants.sol";

contract BioVerifyV3Script is Script, Constants {
    BioVerifyV3 public bioVerify;

    function run() public returns (BioVerifyV3) {
        // 1. Fetch Environment Variables
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        uint256 deployValue = vm.envUint("DEPLOY_VALUE");
        address aiAgent = vm.envAddress("AI_AGENT_ADDRESS");
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        uint32 vrfNumWords = uint32(vm.envUint("VRF_NUM_WORDS"));
        uint256 reputationBoost = vm.envUint("REPUTATION_BOOST");
        // Publisher
        uint256 publisherMinFee = vm.envUint("PUBLISHER_MIN_FEE");
        uint256 publisherStake = vm.envUint("PUBLISHER_STAKE");
        // Reviewer
        uint256 reviewerStake = vm.envUint("REVIEWER_STAKE");
        uint256 reviewerReward = vm.envUint("REVIEWER_REWARD");

        // Pick the right SubID based on chain
        uint256 vrfSubId = (block.chainid == 84532)
            ? vm.envUint("VRF_BASE_SEPOLIA_SUBSCRIPTION_ID")
            : vm.envUint("VRF_SEPOLIA_SUBSCRIPTION_ID");

        // 2. Build Config
        BioVerifyConfig memory config = _buildConfig(
            block.chainid,
            aiAgent,
            treasury,
            vrfSubId,
            vrfNumWords,
            reputationBoost,
            publisherMinFee,
            publisherStake,
            reviewerStake,
            reviewerReward
        );

        // 3. Deploy
        vm.startBroadcast(deployerPrivateKey);
        bioVerify = new BioVerifyV3{value: deployValue}(config);
        vm.stopBroadcast();

        return bioVerify;
    }

    function _buildConfig(
        uint256 _chainId,
        address _ai,
        address _treasury,
        uint256 _vrfSubId,
        uint32 _vrfNumWords,
        uint256 _reputationBoost,
        uint256 _publisherMinFee,
        uint256 _publisherStake,
        uint256 _reviewerStake,
        uint256 _reviewerReward
    ) internal pure returns (BioVerifyConfig memory) {
        address coord;
        bytes32 hash;

        if (_chainId == 84532) {
            // Base Sepolia
            coord = VRF_BASE_SEPOLIA_COORDINATOR;
            hash = VRF_BASE_SEPOLIA_KEY_HASH;
        } else if (_chainId == 11155111) {
            // Eth Sepolia
            coord = VRF_SEPOLIA_COORDINATOR;
            hash = VRF_SEPOLIA_KEY_HASH;
        } else {
            revert("Unsupported Network: Use Base Sepolia (84532) or Eth Sepolia (11155111)");
        }

        return BioVerifyConfig({
            reputationBoost: _reputationBoost,
            aiAgent: _ai,
            treasury: _treasury,
            pubMinFee: _publisherMinFee,
            pubMinStake: _publisherStake,
            revMinStake: _reviewerStake,
            revReward: _reviewerReward,
            vrfSubId: _vrfSubId,
            vrfCoordinator: coord,
            vrfKeyHash: hash,
            vrfGasLimit: VRF_CALLBACK_GAS_LIMIT,
            vrfConfirmations: VRF_REQUEST_CONFIRMATIONS,
            vrfNumWords: _vrfNumWords
        });
    }
}
