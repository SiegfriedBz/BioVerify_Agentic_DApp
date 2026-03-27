import { FC } from "react"

export const VideoSkeleton: FC = () => {
  return (
    <div className="animate-pulse w-full aspect-video rounded-xl bg-neutral-900 flex items-center justify-center border border-neutral-800 shadow-2xl">
      <p className="text-neutral-700 text-sm font-medium">Initializing Video...</p>
    </div>
  )
}
