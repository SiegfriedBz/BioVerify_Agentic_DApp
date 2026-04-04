import { NetworkSchema, type NetworkT } from "@packages/schema"
import type { Abi } from "viem"

export type ContractConfig = {
	address: `0x${string}`
	abi: Abi
}

export const bioVerifyAbi = [
	{
		inputs: [
			{
				components: [
					{ internalType: "uint256", name: "reputationBoost", type: "uint256" },
					{ internalType: "address", name: "aiAgent", type: "address" },
					{ internalType: "address", name: "treasury", type: "address" },
					{ internalType: "uint256", name: "pubMinFee", type: "uint256" },
					{ internalType: "uint256", name: "pubMinStake", type: "uint256" },
					{ internalType: "uint256", name: "revMinStake", type: "uint256" },
					{ internalType: "uint256", name: "revReward", type: "uint256" },
					{ internalType: "address", name: "vrfCoordinator", type: "address" },
					{ internalType: "uint32", name: "vrfGasLimit", type: "uint32" },
					{ internalType: "uint256", name: "vrfSubId", type: "uint256" },
					{ internalType: "bytes32", name: "vrfKeyHash", type: "bytes32" },
					{ internalType: "uint16", name: "vrfConfirmations", type: "uint16" },
					{ internalType: "uint32", name: "vrfNumWords", type: "uint32" },
				],
				internalType: "struct BioVerifyConfig",
				name: "config",
				type: "tuple",
			},
		],
		stateMutability: "payable",
		type: "constructor",
	},
	{
		inputs: [{ internalType: "uint256", name: "pubId", type: "uint256" }],
		name: "BioVerify_AlreadyInReview",
		type: "error",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "pubId", type: "uint256" },
			{ internalType: "enum PublicationStatus", name: "from", type: "uint8" },
			{ internalType: "enum PublicationStatus", name: "to", type: "uint8" },
		],
		name: "BioVerify_CanNotSettle",
		type: "error",
	},
	{
		inputs: [
			{ internalType: "address", name: "member", type: "address" },
			{ internalType: "uint256", name: "amount", type: "uint256" },
		],
		name: "BioVerify_ClaimFailTransferTo",
		type: "error",
	},
	{ inputs: [], name: "BioVerify_ClaimTooMuch", type: "error" },
	{
		inputs: [{ internalType: "address", name: "to", type: "address" }],
		name: "BioVerify_FailedToTransferTo",
		type: "error",
	},
	{ inputs: [], name: "BioVerify_InsufficientPublisherFee", type: "error" },
	{
		inputs: [{ internalType: "uint256", name: "poolSize", type: "uint256" }],
		name: "BioVerify_InsufficientReviewersPool",
		type: "error",
	},
	{
		inputs: [{ internalType: "uint256", name: "rewardPool", type: "uint256" }],
		name: "BioVerify_InsufficientRewardPool",
		type: "error",
	},
	{
		inputs: [{ internalType: "uint256", name: "slashPool", type: "uint256" }],
		name: "BioVerify_InsufficientSlashPoolToMove",
		type: "error",
	},
	{
		inputs: [{ internalType: "uint256", name: "slashPool", type: "uint256" }],
		name: "BioVerify_InsufficientSlashPoolToTransfer",
		type: "error",
	},
	{
		inputs: [{ internalType: "uint256", name: "pubId", type: "uint256" }],
		name: "BioVerify_InvalidPublicationId",
		type: "error",
	},
	{ inputs: [], name: "BioVerify_InvalidReviewerCount", type: "error" },
	{
		inputs: [
			{ internalType: "address", name: "member", type: "address" },
			{ internalType: "uint256", name: "pubId", type: "uint256" },
		],
		name: "BioVerify_MemberNotReviewerForThisPub",
		type: "error",
	},
	{ inputs: [], name: "BioVerify_MustPayPublisherStake", type: "error" },
	{ inputs: [], name: "BioVerify_MustPayReviewerStake", type: "error" },
	{ inputs: [], name: "BioVerify_NotAMember", type: "error" },
	{ inputs: [], name: "BioVerify_OnlyAgent", type: "error" },
	{
		inputs: [
			{ internalType: "address", name: "have", type: "address" },
			{ internalType: "address", name: "want", type: "address" },
		],
		name: "OnlyCoordinatorCanFulfill",
		type: "error",
	},
	{
		inputs: [
			{ internalType: "address", name: "have", type: "address" },
			{ internalType: "address", name: "owner", type: "address" },
			{ internalType: "address", name: "coordinator", type: "address" },
		],
		name: "OnlyOwnerOrCoordinator",
		type: "error",
	},
	{ inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
	{ inputs: [], name: "ZeroAddress", type: "error" },
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "pubId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "string",
				name: "verdictCid",
				type: "string",
			},
			{
				indexed: false,
				internalType: "enum PublicationStatus",
				name: "status",
				type: "uint8",
			},
		],
		name: "Agent_FinalizePublication",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newSlashPool",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newRewardPool",
				type: "uint256",
			},
		],
		name: "Agent_MoveSlashPoolToRewardPool",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "pubId",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "address",
				name: "publisher",
				type: "address",
			},
			{
				indexed: false,
				internalType: "address[]",
				name: "reviewers",
				type: "address[]",
			},
			{
				indexed: false,
				internalType: "address",
				name: "seniorReviewer",
				type: "address",
			},
			{ indexed: false, internalType: "string", name: "cid", type: "string" },
		],
		name: "Agent_PickReviewers",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "member",
				type: "address",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "pubId",
				type: "uint256",
			},
		],
		name: "Agent_RecordReview",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "pubId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "requestId",
				type: "uint256",
			},
		],
		name: "Agent_RequestVRF",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "address", name: "to", type: "address" },
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newSlashPool",
				type: "uint256",
			},
		],
		name: "Agent_TransferSlashPoolToTreasury",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "member",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newAvailStake",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newContractBal",
				type: "uint256",
			},
		],
		name: "Claim",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "vrfCoordinator",
				type: "address",
			},
		],
		name: "CoordinatorSet",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "reviewer",
				type: "address",
			},
			{
				indexed: false,
				internalType: "bool",
				name: "isAvailable",
				type: "bool",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newActiveReviews",
				type: "uint256",
			},
		],
		name: "IsAvailableReviewer",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "pubId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newLockedStake",
				type: "uint256",
			},
		],
		name: "LockedStakeOnPubId",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "member",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newAvailStake",
				type: "uint256",
			},
		],
		name: "MemberAvailableStake",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "member",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newLockedStake",
				type: "uint256",
			},
		],
		name: "MemberLockedStake",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "member",
				type: "address",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "pubId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newLockedStake",
				type: "uint256",
			},
		],
		name: "MemberLockedStakeOnPubId",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "member",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newRep",
				type: "uint256",
			},
		],
		name: "MemberReputation",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "pubId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "enum PublicationStatus",
				name: "newStatus",
				type: "uint8",
			},
		],
		name: "NewPublicationStatus",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "address", name: "from", type: "address" },
			{ indexed: true, internalType: "address", name: "to", type: "address" },
		],
		name: "OwnershipTransferRequested",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "address", name: "from", type: "address" },
			{ indexed: true, internalType: "address", name: "to", type: "address" },
		],
		name: "OwnershipTransferred",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "member",
				type: "address",
			},
		],
		name: "RewardMember",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "newRewardPool",
				type: "uint256",
			},
		],
		name: "RewardPool",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "member",
				type: "address",
			},
		],
		name: "SlashMember",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "newSlashPool",
				type: "uint256",
			},
		],
		name: "SlashPool",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "publisher",
				type: "address",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "pubId",
				type: "uint256",
			},
			{ indexed: false, internalType: "string", name: "cid", type: "string" },
			{
				indexed: false,
				internalType: "uint256",
				name: "paidFee",
				type: "uint256",
			},
		],
		name: "SubmitPublication",
		type: "event",
	},
	{
		inputs: [],
		name: "I_AI_AGENT_ADDRESS",
		outputs: [{ internalType: "address", name: "", type: "address" }],
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
		inputs: [],
		name: "I_PUBLISHER_STAKE",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "I_REPUTATION_BOOST",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "I_REVIEWER_REWARD",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "I_REVIEWER_STAKE",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "I_TREASURY_ADDRESS",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "acceptOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
		name: "claim",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "_pubId", type: "uint256" },
			{ internalType: "string", name: "_verdictCid", type: "string" },
		],
		name: "earlySlashPublication",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
		name: "moveSlashPoolToRewardPool",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "owner",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "payReviewerStake",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [{ internalType: "uint256", name: "_pubId", type: "uint256" }],
		name: "pickReviewers",
		outputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "_pubId", type: "uint256" },
			{ internalType: "address[]", name: "_honest", type: "address[]" },
			{ internalType: "address[]", name: "_negligent", type: "address[]" },
			{ internalType: "string", name: "_verdictCid", type: "string" },
		],
		name: "publishPublication",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "requestId", type: "uint256" },
			{ internalType: "uint256[]", name: "randomWords", type: "uint256[]" },
		],
		name: "rawFulfillRandomWords",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "_pubId", type: "uint256" },
			{ internalType: "address", name: "_reviewer", type: "address" },
		],
		name: "recordReview",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "rewardPool",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "s_vrfCoordinator",
		outputs: [
			{
				internalType: "contract IVRFCoordinatorV2Plus",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "_vrfCoordinator", type: "address" },
		],
		name: "setCoordinator",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "slashPool",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "_pubId", type: "uint256" },
			{ internalType: "address[]", name: "_honest", type: "address[]" },
			{ internalType: "address[]", name: "_negligent", type: "address[]" },
			{ internalType: "string", name: "_verdictCid", type: "string" },
		],
		name: "slashPublication",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "string", name: "_cid", type: "string" },
			{ internalType: "uint256", name: "_paidSubmissionFee", type: "uint256" },
		],
		name: "submitPublication",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "to", type: "address" }],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
		name: "transferSlashPoolToTreasury",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{ stateMutability: "payable", type: "receive" },
]

const bioVerifyConfigBaseSepolia: ContractConfig = {
	address: "0xa5FD28966BE524490d855FBE6E3c830357197251",
	abi: bioVerifyAbi as Abi,
}

const bioVerifyConfigEthSepolia: ContractConfig = {
	address: "0x1DcB58429F02c627dC726C623A4A9e785ecac3c7",
	abi: bioVerifyAbi as Abi,
}

export const BioVerifyContractConfig: Record<NetworkT, ContractConfig> = {
	[NetworkSchema.enum.base_sepolia]: bioVerifyConfigBaseSepolia,
	[NetworkSchema.enum.eth_sepolia]: bioVerifyConfigEthSepolia,
}
