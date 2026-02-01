import type { Abi } from "viem";

export enum ContractChain {
	SEPOLIA = "SEPOLIA",
	SEI_TESNET = "SEI_TESNET",
}

export type ContractConfig = {
	address: `0x${string}`;
	abi: Abi;
};

const bioVerifyConfigSeoplia: ContractConfig = {
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
		{ inputs: [], name: "BioVerify_MustPayToSubmit", type: "error" },
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
			name: "I_MIN_STAKE",
			outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [],
			name: "I_SUBMISSION_FEE",
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
};

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
		{ inputs: [], name: "BioVerify_MustPayToSubmit", type: "error" },
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
			name: "I_MIN_STAKE",
			outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [],
			name: "I_SUBMISSION_FEE",
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
};

export const bioVerifyContractConfig: Record<ContractChain, ContractConfig> = {
	[ContractChain.SEPOLIA]: bioVerifyConfigSeoplia,
	[ContractChain.SEI_TESNET]: bioVerifyConfigSeiTestNet,
};
