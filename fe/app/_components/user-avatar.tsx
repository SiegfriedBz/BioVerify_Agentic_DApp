"use client";

import type { FC } from "react";
import { useConnection, useEnsAvatar, useEnsName } from "wagmi";
import {
	Avatar,
	AvatarBadge,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";

export const UserAvatar: FC = () => {
	const { address } = useConnection();
	const { data: ensName, error, status } = useEnsName({ address });
	const { data: ensAvatar } = useEnsAvatar({ name: ensName || "" });

	if (status === "error") {
		console.log(`Error fetching ENS name ${error.message}`);
		return <div>Error fetching ENS name</div>;
	}

	const shortAddress = `${address?.slice(0, 8)}...${address?.slice(address?.length - 9, address?.length - 1)}`;

	return (
		<div className="flex justify-center items-center gap-x-2">
			<Avatar>
				<AvatarImage
					src={ensAvatar || "https://github.com/shadcn.png"}
					alt="ENS Avatar"
				/>
				<AvatarFallback>CN</AvatarFallback>
				<AvatarBadge className="bg-green-600 dark:bg-green-800" />
			</Avatar>

			{address && (
				<div>{ensName ? `${ensName} (${shortAddress})` : shortAddress}</div>
			)}
		</div>
	);
};
