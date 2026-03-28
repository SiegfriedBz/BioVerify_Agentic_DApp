"use client"

import { Button } from "@/components/ui/button"
import { UserPlusIcon } from "lucide-react"
import type { FC } from "react"

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
