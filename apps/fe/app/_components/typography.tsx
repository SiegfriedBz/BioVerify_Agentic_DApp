import type { FC, HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type Props = HTMLAttributes<HTMLElement> & {
	className?: string
}

export const TypographyH1: FC<Props> = ({ className, children, ...props }) => (
	<h1
		{...props}
		className={cn(
			"scroll-m-20 text-3xl font-extrabold tracking-tight @md:text-4xl text-balance",
			className,
		)}
	>
		{children}
	</h1>
)

export const TypographyH2: FC<Props> = ({ className, children, ...props }) => (
	<h2
		{...props}
		className={cn(
			"scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 @md:text-3xl",
			className,
		)}
	>
		{children}
	</h2>
)

export const TypographyH3: FC<Props> = ({ className, children, ...props }) => (
	<h3
		{...props}
		className={cn(
			"scroll-m-20 text-xl font-semibold tracking-tight @md:text-2xl",
			className,
		)}
	>
		{children}
	</h3>
)

export const TypographyH4: FC<Props> = ({ className, children, ...props }) => (
	<h4
		{...props}
		className={cn(
			"scroll-m-20 text-lg font-semibold tracking-tight @md:text-xl",
			className,
		)}
	>
		{children}
	</h4>
)

export const TypographyP: FC<Props> = ({ className, children, ...props }) => (
	<p {...props} className={cn("leading-7 not-first:mt-4", className)}>
		{children}
	</p>
)

export const TypographySmall: FC<Props> = ({
	className,
	children,
	...props
}) => (
	<small
		{...props}
		className={cn("text-xs font-medium leading-none", className)}
	>
		{children}
	</small>
)
