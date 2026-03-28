import { FC, PropsWithChildren } from "react"

const Layout: FC<PropsWithChildren> = (props) => {
  const { children } = props

  return (
    <div className="flex flex-col w-full gap-8 py-6">
      {children}
    </div>
  )
}

export default Layout