export function HeroVideo() {
	return (
		<div className="relative w-full aspect-video max-h-138 overflow-hidden rounded-xl border border-border shadow-2xl">
			<video
				className="w-full h-auto object-cover"
				autoPlay
				loop
				muted
				preload="auto"
			>
				<source src="/videos/hero-agentic-protocol.mp4" type="video/mp4" />
				Your browser does not support video.
			</video>
		</div>
	)
}
