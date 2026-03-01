// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./01_Helpers.t.sol";
import {

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

        uint256 amount = PUBLISHER_STAKE;
        uint256 initialTreasuryBalance = treasuryAddress.balance;
        uint256 initialSlashPool = bioVerify.slashPool();

        _expectEmit_Agent_TransferSlashPoolToTreasury(treasuryAddress, amount);
        _expectEmit_SlashPool(initialSlashPool - amount);

        vm.prank(aiAgentAddress);
        bioVerify.transferSlashPoolToTreasury(amount);

        assertEq(treasuryAddress.balance, initialTreasuryBalance + amount);
        assertEq(bioVerify.slashPool(), initialSlashPool - amount);
    }

    function test_MoveSlashPoolToRewardPool_Success() public {
        _setupFunds();

        uint256 amount = PUBLISHER_STAKE; // 0.001 ETH
        uint256 initialRewardPool = bioVerify.rewardPool();
        uint256 initialSlashPool = bioVerify.slashPool();

        _expectEmit_Agent_MoveSlashPoolToRewardPool(amount);

        // FIX: Expect the TOTAL new balance (Initial + Amount)
        _expectEmit_RewardPool(initialRewardPool + amount);

        vm.prank(aiAgentAddress);
        bioVerify.moveSlashPoolToRewardPool(amount);

        assertEq(bioVerify.rewardPool(), initialRewardPool + amount);
        assertEq(bioVerify.slashPool(), initialSlashPool - amount);
    }

    // ===== unhappy path

    function test_TransferSlashPoolToTreasury_RevertIf_TransferFails() public {
        // Get BioVerify instance where I_TREASURY_ADDRESS is RejectingTreasury
        ETHRejector rejector = new ETHRejector();
        BioVerifyConfig memory mockConfig = _getMockConfigWithRejectorTreasury(address(rejector));
        BioVerifyV3 bioVerifyWithRejectorTreasury = new BioVerifyV3{value: DEPLOYMENT_VALUE}(mockConfig);

        // Setup submit publication
        vm.deal(publisher, 1 ether);
        vm.prank(publisher);
        bioVerifyWithRejectorTreasury.submitPublication{value: VALID_PAID_PUBLISHER_AMOUNT}(
            FAKE_CID, VALID_PAID_PUBLISHER_FEE
        );

        // Early slash publication to get PUBLISHER_STAKE into slashPool
        vm.prank(aiAgentAddress);
        bioVerifyWithRejectorTreasury.earlySlashPublication(0, FAKE_VERDICT_CID);

        // Execute
        vm.prank(aiAgentAddress);
        vm.expectRevert(abi.encodeWithSelector(BioVerify_FailedToTransferTo.selector, address(rejector)));
        bioVerifyWithRejectorTreasury.transferSlashPoolToTreasury(PUBLISHER_STAKE);
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
            reputationBoost: REPUTATION_BOOST,
            aiAgent: aiAgentAddress,
            treasury: _rejectorAsTreasury,
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
