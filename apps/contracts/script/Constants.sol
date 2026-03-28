// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Constants {
    // VRF Base Sepolia (v2.5)
    address constant VRF_BASE_SEPOLIA_COORDINATOR = 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE;
    bytes32 constant VRF_BASE_SEPOLIA_KEY_HASH = 0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71;

    // VRF Eth Sepolia (v2.5)
    address constant VRF_SEPOLIA_COORDINATOR = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    bytes32 constant VRF_SEPOLIA_KEY_HASH = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;

    // VRF shared
    uint32 constant VRF_CALLBACK_GAS_LIMIT = 1000000;
    uint16 constant VRF_REQUEST_CONFIRMATIONS = 3;
}

