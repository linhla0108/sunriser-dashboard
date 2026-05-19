"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Settings, Users, UsersRound } from "lucide-react"
import {
  Sidebar,
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
  { href: "/settings", label: "Settings", icon: Settings },
]

function LogoMark() {
  return <img src="/logo.svg" alt="SUN Studio" className="h-9 w-auto shrink-0 group-data-[collapsible=icon]:h-8" />
}

export function V2Sidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" data-testid="v2-sidebar" data-v2-glass-panel="">
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
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {NAV_ITEMS.map(item => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      size="lg"
                      isActive={active}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                      className="gap-3 [&_svg]:size-5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="bg-sidebar-accent flex items-center gap-3 rounded-xl px-2 py-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <span className="bg-primary size-2.5 shrink-0 rounded-full" />
              <span className="text-sidebar-foreground/70 text-sm font-medium group-data-[collapsible=icon]:hidden">Mock workspace</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRailWithBubble />
    </Sidebar>
  )
}
