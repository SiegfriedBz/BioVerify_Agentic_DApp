import { FC, PropsWithChildren } from "react"

const Layout: FC<PropsWithChildren> = (props) => {
  const { children } = props

  return (
    <div className="space-y-8 max-w-7xl flex flex-col gap-8 py-4 @md:py-8">
      {children}
    </div>
  )
}

export default Layout