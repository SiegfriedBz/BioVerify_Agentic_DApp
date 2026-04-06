import type { FC } from "react"

export const VideoSkeleton: FC = () => {
	return (
		<div className="relative flex aspect-video max-h-138 w-full items-center justify-center overflow-hidden rounded-lg bg-muted/40 shadow-[0_20px_40px_rgba(14,20,27,0.4)] animate-pulse">
			<p className="text-sm font-medium text-muted-foreground">
				Initializing Video...
			</p>
		</div>
	)
}
