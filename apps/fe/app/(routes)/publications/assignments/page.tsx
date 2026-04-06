import { TypographyH1, TypographyP } from "@/app/_components/typography"
import { ReviewWrapper } from "./_components/review-wrapper"

export default async function Page() {
	return (
		<>
			<header className="flex flex-col gap-1 border-b border-border pb-6">
				<TypographyH1>Reviewer Portal</TypographyH1>
				<TypographyP className="text-muted-foreground text-sm">
					Stake your reputation to validate the next generation of scientific
					breakthroughs.
				</TypographyP>
			</header>

			<ReviewWrapper />
		</>
	)
}
