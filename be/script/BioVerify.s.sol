// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {BioVerify} from "../src/BioVerify.sol";
import {Constants} from ".//Constants.sol";

contract BioVerifyScript is Script, Constants {
    BioVerify public bioVerify;
    address aiAgentAddress = vm.envAddress("AI_AGENT_ADDRESS");
    address treasuryAddress = vm.envAddress("TREASURY_ADDRESS");

    function setUp() public {}

    function run() public returns (BioVerify) {
        vm.startBroadcast();

        // constructor(address _aiAgentAddress, address _slashedToAddress, uint256 _submissionFee, uint256 _publisherMinStake, uint256 _reviewerMinStake) {
        bioVerify =
            new BioVerify(aiAgentAddress, treasuryAddress, SUBMISSION_FEE, PUBLISHER_MIN_STAKE, REVIEWER_MIN_STAKE);

        vm.stopBroadcast();

        return bioVerify;
    }
}
