// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {BioVerify} from "../src/BioVerify.sol";
import {Constants} from ".//Constants.sol";

contract BioVerifyScript is Script, Constants {
    BioVerify public bioVerify;

    function setUp() public {}

    function run() public returns (BioVerify) {
        vm.startBroadcast();

        // constructor(uint256 _submissionFee, uint256 _minStake) {

        bioVerify = new BioVerify(SUBMISSION_FEE, MIN_STAKE);

        vm.stopBroadcast();

        return bioVerify;
    }
}
