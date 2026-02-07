import type { Abi } from "viem"
import { NetworkSchema, NetworkT } from "../_schemas/wallet"


export type ContractConfig = {
	address: `0x${string}`
	abi: Abi
}

const bioVerifyConfigSeoplia: ContractConfig = {
	address: "0xa7B7f601842b5a1388C5548d2656E0E279A6d607",
	abi: [{ "inputs": [{ "internalType": "address", "name": "_aiAgentAddress", "type": "address" }, { "internalType": "address", "name": "_treasuryAddress", "type": "address" }, { "internalType": "uint256", "name": "_publisherMinFee", "type": "uint256" }, { "internalType": "uint256", "name": "_publisherMinStake", "type": "uint256" }, { "internalType": "uint256", "name": "_reviewerMinStake", "type": "uint256" }, { "internalType": "uint256", "name": "_vrfSubscriptionId", "type": "uint256" }, { "internalType": "bytes32", "name": "_vrfKeyHash", "type": "bytes32" }, { "internalType": "uint32", "name": "_vrfCallbackGasLimit", "type": "uint32" }, { "internalType": "uint16", "name": "_vrfRequestConfirmations", "type": "uint16" }, { "internalType": "uint32", "name": "_vrfNumWords", "type": "uint32" }, { "internalType": "address", "name": "_vrfCoordinator", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "internalType": "uint256", "name": "publicationId", "type": "uint256" }], "name": "BioVerify_AlreadyInReview", "type": "error" }, { "inputs": [], "name": "BioVerify_AlreadyReviewer", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "publicationId", "type": "uint256" }], "name": "BioVerify_AlreadySlashed", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "BioVerify_FailedToTransferTo", "type": "error" }, { "inputs": [], "name": "BioVerify_InsufficientPublisherFee", "type": "error" }, { "inputs": [], "name": "BioVerify_InsufficientPublisherStake", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "poolSize", "type": "uint256" }], "name": "BioVerify_InsufficientReviewerPool", "type": "error" }, { "inputs": [], "name": "BioVerify_InsufficientReviewerStake", "type": "error" }, { "inputs": [{ "internalType": "uint256", "name": "publicationId", "type": "uint256" }], "name": "BioVerify_InvalidPublicationId", "type": "error" }, { "inputs": [], "name": "BioVerify_MustPayToPublish", "type": "error" }, { "inputs": [], "name": "BioVerify_OnlyAgent", "type": "error" }, { "inputs": [], "name": "BioVerify_ZeroValueToTransfer", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "have", "type": "address" }, { "internalType": "address", "name": "want", "type": "address" }], "name": "OnlyCoordinatorCanFulfill", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "have", "type": "address" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "coordinator", "type": "address" }], "name": "OnlyOwnerOrCoordinator", "type": "error" }, { "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" }, { "inputs": [], "name": "ZeroAddress", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "publicationId", "type": "uint256" }, { "indexed": false, "internalType": "address[]", "name": "reviewers", "type": "address[]" }, { "indexed": false, "internalType": "uint256", "name": "requestId", "type": "uint256" }], "name": "BioVerify_Agent_PickedReviewers", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "publicationId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "requestId", "type": "uint256" }], "name": "BioVerify_Agent_RequestedVRF", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "member", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "score", "type": "uint256" }], "name": "BioVerify_Agent_SetMemberReputationScore", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "BioVerify_Agent_TransferTotalSlashed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "reviewer", "type": "address" }], "name": "BioVerify_JoinReviewerPool", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "publicationId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "publisher", "type": "address" }], "name": "BioVerify_SlashedPublisher", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "publisher", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "cid", "type": "string" }], "name": "BioVerify_SubmittedPublication", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "vrfCoordinator", "type": "address" }], "name": "CoordinatorSet", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "OwnershipTransferRequested", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [], "name": "I_AI_AGENT_ADDRESS", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "I_PUBLISHER_MIN_FEE", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "I_PUBLISHER_MIN_STAKE", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "I_REVIEWER_MIN_STAKE", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "I_TREASURY_ADDRESS", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "I_VRF_CALLBACK_GAS_LIMIT", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "I_VRF_KEY_HASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "I_VRF_NUM_WORDS", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "I_VRF_REQUEST_CONFIRMATIONS", "outputs": [{ "internalType": "uint16", "name": "", "type": "uint16" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "I_VRF_SUBSCRIPTION_ID", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "acceptOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "getFullPublication", "outputs": [{ "components": [{ "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "address", "name": "publisher", "type": "address" }, { "internalType": "address[]", "name": "reviewers", "type": "address[]" }, { "internalType": "string[]", "name": "cids", "type": "string[]" }, { "internalType": "enum BioVerify.PublicationStatus", "name": "status", "type": "uint8" }, { "internalType": "uint256", "name": "paidSubmissionFee", "type": "uint256" }], "internalType": "struct BioVerify.Publication", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_member", "type": "address" }], "name": "getMemberReputationScore", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isReviewer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "joinReviewerPool", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "nextPublicationId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_publicationId", "type": "uint256" }], "name": "pickReviewers", "outputs": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "publicationCurrentCid", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }], "name": "publicationStakes", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "publicationTotalStake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "publications", "outputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "address", "name": "publisher", "type": "address" }, { "internalType": "enum BioVerify.PublicationStatus", "name": "status", "type": "uint8" }, { "internalType": "uint256", "name": "paidSubmissionFee", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "publisherToPublicationIds", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "internalType": "uint256[]", "name": "randomWords", "type": "uint256[]" }], "name": "rawFulfillRandomWords", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "reviewerPool", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "reviewerTotalStake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "s_vrfCoordinator", "outputs": [{ "internalType": "contract IVRFCoordinatorV2Plus", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_vrfCoordinator", "type": "address" }], "name": "setCoordinator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_member", "type": "address" }, { "internalType": "uint256", "name": "_score", "type": "uint256" }], "name": "setMemberReputationScore", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_publicationId", "type": "uint256" }], "name": "slashPublisher", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_cid", "type": "string" }, { "internalType": "uint256", "name": "_paidSubmissionFee", "type": "uint256" }], "name": "submitPublication", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "totalSlashed", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSubmissionFees", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "transferTotalSlashed", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
}

// TODO - deploy and fill
const bioVerifyConfigSeiTestNet: ContractConfig = {
	address: "0x732DBB8Ca8ab0ca2167866F151057FcE092978Ca",
	abi: [
		{
			inputs: [
				{ internalType: "uint256", name: "_submissionFee", type: "uint256" },
				{ internalType: "uint256", name: "_minStake", type: "uint256" },
			],
			stateMutability: "nonpayable",
			type: "constructor",
		},
		{ inputs: [], name: "BioVerify_MustPayToPublish", type: "error" },
		{
			anonymous: false,
			inputs: [
				{
					indexed: false,
					internalType: "address",
					name: "publisher",
					type: "address",
				},
				{
					indexed: false,
					internalType: "uint256",
					name: "id",
					type: "uint256",
				},
				{ indexed: false, internalType: "string", name: "cid", type: "string" },
			],
			name: "BioVerify_SubmittedPublication",
			type: "event",
		},
		{
			inputs: [],
			name: "I_PUBLISHER_MIN_STAKE",
			outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [],
			name: "I_PUBLISHER_MIN_FEE",
			outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
			name: "Publications",
			outputs: [
				{ internalType: "uint256", name: "id", type: "uint256" },
				{ internalType: "address", name: "publisher", type: "address" },
				{
					internalType: "enum BioVerify.PublicationStatus",
					name: "status",
					type: "uint8",
				},
			],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [
				{ internalType: "uint256", name: "publicationId", type: "uint256" },
			],
			name: "publicationCurrentCid",
			outputs: [{ internalType: "string", name: "cid", type: "string" }],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [
				{ internalType: "uint256", name: "publicationId", type: "uint256" },
				{ internalType: "address", name: "staker", type: "address" },
			],
			name: "publicationStakes",
			outputs: [{ internalType: "uint256", name: "stake", type: "uint256" }],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [
				{ internalType: "uint256", name: "publicationId", type: "uint256" },
			],
			name: "publicationTotalStake",
			outputs: [
				{ internalType: "uint256", name: "totalStake", type: "uint256" },
			],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [
				{ internalType: "address", name: "publisher", type: "address" },
				{ internalType: "uint256", name: "", type: "uint256" },
			],
			name: "publisherToPublicationIds",
			outputs: [
				{ internalType: "uint256", name: "publicationIds", type: "uint256" },
			],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [{ internalType: "string", name: "_cid", type: "string" }],
			name: "submitPublication",
			outputs: [],
			stateMutability: "payable",
			type: "function",
		},
	],
}

export const bioVerifyContractConfig: Record<NetworkT, ContractConfig> = {
	[NetworkSchema.enum.sepolia]: bioVerifyConfigSeoplia,
	[NetworkSchema.enum.sei_testnet]: bioVerifyConfigSeiTestNet,
}
