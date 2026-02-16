import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar"
import { BookCheckIcon, BookPlusIcon, LayoutDashboardIcon, LinkIcon } from "lucide-react"
import Link from "next/link"
import { FC } from "react"
import { UserAvatar } from "../user-avatar"


export const AppSidebar: FC = () => {
  return (
    <Sidebar>
      <SidebarHeader className="mt-4">
        <>
          <span className="font-extrabold text-2xl">BioVerify</span>
          <SidebarMenu>
            {/* ConnectButton */}
            {/* <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <ConnectButton /><span className="sr-only">Connect Wallet</span>
              </SidebarMenuButton>
            </SidebarMenuItem> */}

            {/* ChangeChainButtons */}
            <SidebarMenuItem>
              {/* <SidebarMenuButton asChild>
                <ChangeChainButtons />
              </SidebarMenuButton> */}
              <SidebarMenuAction>
                <>
                  <LinkIcon /> <span className="sr-only">Change network</span>
                </>
              </SidebarMenuAction>
            </SidebarMenuItem>
          </SidebarMenu>
        </>
      </SidebarHeader>

      {/* SidebarContent - links */}
      <SidebarContent className="mt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive>
              <Link href={"/"}>
                <LayoutDashboardIcon />Dashboard
              </Link>
            </SidebarMenuButton>
            <SidebarMenuBadge>24</SidebarMenuBadge>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive>
              <Link href={"/submit-publication"}>
                <BookPlusIcon />Submit Publication
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive>
              <Link href={"/peer-review"}>
                <BookCheckIcon />Peer Review
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* SidebarFooter */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <UserAvatar />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}