import type { z } from "zod";
import { EthAmountSchema } from "../../../_schemas/eth-amount";
import { PublicationSchema } from "../../../_schemas/publication";

// Publication Form Schema
export const PublicationFormSchema = PublicationSchema.extend({
	ethAmount: EthAmountSchema,
});

export type PublicationFormT = z.infer<typeof PublicationFormSchema>;

// createAndPinManifestRootCid params schema
export const CreateAndPinManifestRootCidchema = PublicationSchema;

export type CreateAndPinManifestRootCid = z.infer<
	typeof CreateAndPinManifestRootCidchema
>;
