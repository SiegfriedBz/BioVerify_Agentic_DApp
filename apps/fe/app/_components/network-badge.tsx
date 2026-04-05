import { NetworkSchema, type NetworkT } from "@packages/schema"
import {
	type IconComponentProps,
	NetworkBaseSepolia,
	NetworkSepolia,
} from "@web3icons/react"
import type {
	ComponentProps,
	FC,
	ForwardRefExoticComponent,
	RefAttributes,
} from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const NetworkToMessage: Record<NetworkT, string> = {
	[NetworkSchema.enum.base_sepolia]: "Base Sepolia",
	[NetworkSchema.enum.eth_sepolia]: "Sepolia Eth",
}

export const NetworkToIcon: Record<
	NetworkT,
	ForwardRefExoticComponent<
		Omit<IconComponentProps, "ref"> & RefAttributes<SVGSVGElement>
	>
> = {
	[NetworkSchema.enum.base_sepolia]: NetworkBaseSepolia,
	[NetworkSchema.enum.eth_sepolia]: NetworkSepolia,
}

export const networkOptions = NetworkSchema.options.map((option) => {
	return {
		value: option,
		label: NetworkToMessage[option],
	}
})

type BaseProps = {
	network: NetworkT
}

type NetworkBadgeProps = ComponentProps<typeof Badge> &
	BaseProps & {
		pulseIcon?: boolean
	}

export const NetworkBadge: FC<NetworkBadgeProps> = (props) => {
	const { network, pulseIcon = false, className, ...rest } = props

	const Icon = NetworkToIcon[network]

	return (
		<Badge
			{...rest}
			variant="ghost"
			className={cn("gap-x-2 border-primary/10 bg-muted/30", className)}
		>
			<Icon
				variant="branded"
				size={64}
				className={cn(pulseIcon && "animate-pulse")}
			/>
			<span className="font-mono text-[10px] uppercase font-bold">
				{NetworkToMessage[network]}
			</span>
		</Badge>
	)
}

export const NetworkSimpleBadge: FC<BaseProps> = (props) => {
	const { network } = props

	const Icon = NetworkToIcon[network]

	return (
		<div className="inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden gap-x-2 border-primary/10 bg-muted/30">
			<Icon variant="branded" size={64} className="animate-pulse" />
			<span className="font-mono text-[10px] uppercase font-bold">
				{NetworkToMessage[network]}
			</span>
		</div>
	)
}
