"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import type { FC } from "react"

type AddFileButtonProps = {
	onAddFile: () => void
}
export const AddFileButton: FC<AddFileButtonProps> = (props) => {
	const { onAddFile } = props

	return (
		<Button type="button" variant="outline" size="sm" onClick={onAddFile}>
			<PlusIcon className="mr-2 h-4 w-4" /> Add Component
		</Button>
	)
}
