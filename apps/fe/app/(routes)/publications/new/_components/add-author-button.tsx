"use client"

import { UserPlusIcon } from "lucide-react"
import type { FC } from "react"
import { Button } from "@/components/ui/button"

type AddAuthorButtonProps = {
	onAddAuthor: () => void
}

export const AddAuthorButton: FC<AddAuthorButtonProps> = (props) => {
	const { onAddAuthor } = props

	return (
		<Button type="button" variant="outline" size="sm" onClick={onAddAuthor}>
			<UserPlusIcon className="mr-2 h-4 w-4" /> Add Author
		</Button>
	)
}
