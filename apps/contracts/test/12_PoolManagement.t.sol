// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {TestHelpers, ETHRejector} from "./01_Helpers.t.sol";
import {
    BioVerifyV3,
    BioVerifyConfig,

    // errors
    BioVerify_OnlyAgent,
    BioVerify_InsufficientSlashPoolToTransfer,
    BioVerify_InsufficientSlashPoolToMove,
    BioVerify_FailedToTransferTo
} from "../src/BioVerifyV3.sol";

contract PoolManagementTest is TestHelpers {
    function test_Receive_Success() public {
        uint256 initialPool = bioVerify.rewardPool();
        uint256 topUp = 1 ether;

        _expectEmit_RewardPool(initialPool + topUp);

        (bool success,) = address(bioVerify).call{value: topUp}("");
        assertTrue(success);
        assertEq(bioVerify.rewardPool(), initialPool + topUp);
    }

    function test_TransferSlashPoolToTreasury_Success() public {
        _setupFunds();

        uint256 amount = publisherStake;
        uint256 initialTreasuryBalance = treasuryAddress.balance;
        uint256 initialSlashPool = bioVerify.slashPool();

        uint256 expectedSlashPool = initialSlashPool > amount ? initialSlashPool - amount : 0;

        _expectEmit_Agent_TransferSlashPoolToTreasury(treasuryAddress, amount, expectedSlashPool);
        _expectEmit_SlashPool(expectedSlashPool);

        vm.prank(aiAgentAddress);
        bioVerify.transferSlashPoolToTreasury(amount);

        assertEq(treasuryAddress.balance, initialTreasuryBalance + amount);
        assertEq(bioVerify.slashPool(), expectedSlashPool);
    }

    function test_MoveSlashPoolToRewardPool_Success() public {
        _setupFunds();

        uint256 amount = publisherStake; // 0.001 ETH
        uint256 initialRewardPool = bioVerify.rewardPool();
        uint256 initialSlashPool = bioVerify.slashPool();

        uint256 expectedRewardPool = initialRewardPool + amount;
        uint256 expectedSlashPool = initialSlashPool > amount ? initialSlashPool - amount : 0;

        _expectEmit_Agent_MoveSlashPoolToRewardPool(amount, expectedSlashPool, expectedRewardPool);

        // FIX: Expect the TOTAL new balance (Initial + Amount)
        _expectEmit_RewardPool(expectedRewardPool);

        vm.prank(aiAgentAddress);
        bioVerify.moveSlashPoolToRewardPool(amount);

        assertEq(bioVerify.rewardPool(), expectedRewardPool);
        assertEq(bioVerify.slashPool(), expectedSlashPool);
    }

    // ===== unhappy path

    function test_TransferSlashPoolToTreasury_RevertIf_TransferFails() public {
        // Get BioVerify instance where I_treasuryAddress is RejectingTreasury
        ETHRejector rejector = new ETHRejector();
        BioVerifyConfig memory mockConfig = _getMockConfigWithRejectorTreasury(address(rejector));
        BioVerifyV3 bioVerifyWithRejectorTreasury = new BioVerifyV3{value: DEPLOY_VALUE}(mockConfig);

        // Setup submit publication
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerifyWithRejectorTreasury.submitPublication{value: validPaidPublisherAmount}(FAKE_CID, publisherMinFee);

        // Early slash publication to get publisherStake into slashPool
        vm.prank(aiAgentAddress);
        bioVerifyWithRejectorTreasury.earlySlashPublication(0, FAKE_VERDICT_CID);

        // Execute
        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_FailedToTransferTo.selector, address(rejector)));
        bioVerifyWithRejectorTreasury.transferSlashPoolToTreasury(publisherStake);
    }

    function test_TransferSlashPoolToTreasury_RevertIf_NotAgent() public {
        _setupFunds();
        address attacker = makeAddr("attacker");

        vm.prank(attacker);
        vm.expectRevert(BioVerify_OnlyAgent.selector);
        bioVerify.transferSlashPoolToTreasury(100);
    }

    function test_MoveSlashPoolToRewardPool_RevertIf_NotAgent() public {
        _setupFunds();
        address attacker = makeAddr("attacker");

        vm.prank(attacker);
        vm.expectRevert(BioVerify_OnlyAgent.selector);
        bioVerify.moveSlashPoolToRewardPool(100);
    }

    function test_TransferSlashPoolToTreasury_RevertIf_InsufficientBalance() public {
        // Current slashPool is 0
        vm.startPrank(aiAgentAddress);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientSlashPoolToTransfer.selector, 0));
        bioVerify.transferSlashPoolToTreasury(1 ether);

        vm.stopPrank();
    }

    function test_MoveSlashPoolToRewardPool_RevertIf_InsufficientBalance() public {
        // Current slashPool is 0
        vm.startPrank(aiAgentAddress);

        vm.expectRevert(abi.encodeWithSelector(BioVerify_InsufficientSlashPoolToMove.selector, 0));
        bioVerify.moveSlashPoolToRewardPool(1 ether);

        vm.stopPrank();
    }

    // Helper
    function _setupFunds() internal {
        // Setup some funds in the slash pool via a slash
        _submitDefaultPub();
        _fillValidReviewerPool();

        vm.prank(aiAgentAddress);
        bioVerify.earlySlashPublication(0, "ipfs://fraud");
    }

    function _getMockConfigWithRejectorTreasury(address _rejectorAsTreasury)
        internal
        view
        returns (BioVerifyConfig memory)
    {
        return BioVerifyConfig({
            reputationBoost: reputationBoost,
            aiAgent: aiAgentAddress,
            treasury: _rejectorAsTreasury,
            pubMinFee: publisherMinFee,
            pubMinStake: publisherStake,
            revMinStake: reviewerStake,
            revReward: reviewerReward,
            vrfSubId: vrfMockSubscriptionId,
            vrfKeyHash: VRF_BASE_SEPOLIA_KEY_HASH,
            vrfGasLimit: VRF_CALLBACK_GAS_LIMIT,
            vrfConfirmations: VRF_REQUEST_CONFIRMATIONS,
            vrfNumWords: vrfNumWords,
            vrfCoordinator: address(vrfCoordinatorMock)
        });
    }
}
