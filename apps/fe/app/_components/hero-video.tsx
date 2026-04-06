export function HeroVideo() {
	return (
		<div className="relative aspect-video max-h-138 w-full overflow-hidden rounded-lg bg-muted/40 shadow-[0_20px_40px_rgba(14,20,27,0.4)]">
			<video
				className="absolute inset-0 h-full w-full object-cover"
				autoPlay
				loop
				muted
				playsInline
				preload="metadata"
				poster="/images/hero-agentic-protocol.png"
			>
				<source src="/videos/hero-agentic-protocol.mp4" type="video/mp4" />
				Your browser does not support video.
			</video>
		</div>
	)
}
