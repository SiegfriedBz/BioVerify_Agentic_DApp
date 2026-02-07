// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Constants {
    // Publisher
    uint256 constant PUBLISHER_MIN_FEE = 0.005 ether; // Opex - Covers VRF + AI Agent costs
    uint256 constant PUBLISHER_MIN_STAKE = 0.0005 ether; // Security/slashing - submitPublication call
    // Reviewer
    uint256 constant REVIEWER_MIN_STAKE = 0.0005 ether; // Security/slashing - joinReviewerPool call
    // VRF
    address constant VRF_SEPOLIA_COORDINATOR = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    bytes32 constant VRF_KEY_HASH = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    uint32 constant VRF_CALLBACK_GAS_LIMIT = 500_000;
    uint16 constant VRF_REQUEST_CONFIRMATIONS = 3;
    uint32 constant VRF_NUM_WORDS = 3;
}

