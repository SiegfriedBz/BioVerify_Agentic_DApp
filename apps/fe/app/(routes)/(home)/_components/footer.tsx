import { contractLinks, socialLinks } from "@/app/_components/external-links"
import { ExternalLinkIcon } from "lucide-react"
import { FC } from "react"

export const Footer: FC = () => {
	return (
		<footer className="w-full self-stretch border-t border-border/40 px-4 py-8 sm:px-6 md:py-10">
			<div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
				<div className="min-w-0">
					<p className="text-sm font-semibold tracking-tight text-foreground">
						BioVerify
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						&copy; {new Date().getFullYear()} BioVerify Protocol. All rights
						reserved.
					</p>
				</div>

				<div className="flex flex-wrap justify-center gap-x-10 gap-y-6 md:justify-end">
					{socialLinks.length > 0 && (
						<div className="flex flex-col items-center gap-2 md:items-start">
							<p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
								Social
							</p>
							<ul className="flex list-none gap-3 p-0">
								{socialLinks.map(({ href, label, icon: Icon, tooltip }) => (
									<li key={label}>
										<a
											href={href}
											target="_blank"
											rel="noopener noreferrer"
											title={tooltip}
											className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
										>
											<Icon className="size-4" aria-hidden />
											<span>{label}</span>
										</a>
									</li>
								))}
							</ul>
						</div>
					)}

					<div className="flex flex-col items-center gap-2 md:items-start">
						<p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
							Contracts
						</p>
						<ul className="flex list-none flex-col gap-1.5 p-0">
							{contractLinks.map(({ href, label, tooltip }) => (
								<li key={label}>
									<a
										href={href}
										target="_blank"
										rel="noopener noreferrer"
										title={tooltip}
										className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
									>
										<ExternalLinkIcon className="size-3.5" aria-hidden />
										<span>{label}</span>
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</footer>
	)
}
