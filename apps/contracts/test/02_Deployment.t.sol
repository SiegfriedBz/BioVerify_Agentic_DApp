// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {TestHelpers} from "./01_Helpers.t.sol";

contract DeploymentTest is TestHelpers {
    // ================================================================
    // DEPLOYMENT
    // ================================================================

    function test_Deployment() public view {
        assertEq(address(bioVerify).balance, DEPLOY_VALUE);
        assertEq(bioVerify.rewardPool(), DEPLOY_VALUE);
        assertEq(bioVerify.slashPool(), 0);
        assertEq(bioVerify.I_REPUTATION_BOOST(), reputationBoost);
        assertEq(bioVerify.I_AI_AGENT_ADDRESS(), aiAgentAddress);
        assertEq(bioVerify.I_TREASURY_ADDRESS(), treasuryAddress);
        assertEq(bioVerify.I_PUBLISHER_MIN_FEE(), publisherMinFee);
        assertEq(bioVerify.I_PUBLISHER_STAKE(), publisherStake);
        assertEq(bioVerify.I_REVIEWER_STAKE(), reviewerStake);
        assertEq(bioVerify.I_REVIEWER_REWARD(), reviewerReward);
    }
}
