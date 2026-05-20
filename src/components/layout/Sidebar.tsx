"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Settings, Users, UsersRound } from "lucide-react"
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { SidebarRailWithBubble } from "./SidebarRailWithBubble"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/hr", label: "HR Team", icon: UsersRound },
]

function LogoMark() {
  return <img src="/logo.svg" alt="SUN Studio" className="h-9 w-auto shrink-0 group-data-[collapsible=icon]:h-8" />
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <SidebarRoot collapsible="icon" data-testid="v2-sidebar" data-v2-glass-panel="">
      <SidebarHeader className={cn("flex flex-row items-center gap-3 p-4", "group-data-[collapsible=icon]:px-2")}>
        <LogoMark />
        <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
          <span className="text-sidebar-foreground block truncate text-base font-bold tracking-tight">SUN Studio</span>
          <span className="text-sidebar-foreground/70 block truncate text-sm font-medium">HR Workspace</span>
        </span>
        <SidebarTrigger className="-mr-1 shrink-0 group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:px-1">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
              {NAV_ITEMS.map(item => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                      className="gap-3 [&_svg]:size-[18px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                    >
                      <Icon />
                      <span className="text-sm group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-3">
        <div className="flex items-center justify-between px-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:px-0">
          <Link
            href="/profile"
            className="hover:bg-sidebar-accent flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            title="Profile"
          >
            <span className="bg-primary flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white">
              D
            </span>
          </Link>
          <Link
            href="/settings"
            className={cn(
              "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              pathname === "/settings" && "text-sidebar-foreground bg-sidebar-accent"
            )}
            title="Settings"
          >
            <Settings className="size-[18px]" />
          </Link>
        </div>
      </SidebarFooter>
      <SidebarRailWithBubble />
    </SidebarRoot>
  )
}
