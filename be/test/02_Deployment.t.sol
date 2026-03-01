// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./01_Helpers.t.sol";

contract DeploymentTest is TestHelpers {
    // ================================================================
    // DEPLOYMENT
    // ================================================================

    function test_Deployment() public view {
        assertEq(address(bioVerify).balance, DEPLOYMENT_VALUE);
        assertEq(bioVerify.rewardPool(), DEPLOYMENT_VALUE);
        assertEq(bioVerify.I_REPUTATION_BOOST(), REPUTATION_BOOST);
        assertEq(bioVerify.I_AI_AGENT_ADDRESS(), aiAgentAddress);
        assertEq(bioVerify.I_TREASURY_ADDRESS(), treasuryAddress);
        assertEq(bioVerify.I_PUBLISHER_MIN_FEE(), PUBLISHER_MIN_FEE);
        assertEq(bioVerify.I_PUBLISHER_STAKE(), PUBLISHER_STAKE);
        assertEq(bioVerify.I_REVIEWER_STAKE(), REVIEWER_STAKE);
        assertEq(bioVerify.I_REVIEWER_REWARD(), REVIEWER_REWARD);
    }
}
