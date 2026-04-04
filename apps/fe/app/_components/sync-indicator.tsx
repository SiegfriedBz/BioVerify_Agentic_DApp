import type { FC } from "react"

export const SyncIndicator: FC = () => {
	return (
		<div className="absolute -top-6 right-2 flex items-center gap-2 animate-pulse">
			<div className="w-2 h-2 bg-blue-500 rounded-full" />
			<span className="text-[10px] font-bold text-blue-500 uppercase">
				Syncing...
			</span>
		</div>
	)
}
