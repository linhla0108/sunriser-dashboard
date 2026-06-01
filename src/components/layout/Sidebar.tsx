"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, CalendarClock, LayoutDashboard, Settings, Users, UsersRound } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { useAnnouncements } from "@/lib/announcements/AnnouncementProvider"
import { useAuth } from "@/lib/auth/useAuth"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/announcements", label: "Announcements", icon: Bell },
  { href: "/schedule", label: "Schedule", icon: CalendarClock },
  { href: "/hr", label: "HR Team", icon: UsersRound },
]

function LogoMark() {
  return <img src="/logo.svg" alt="SUN Studio" className="h-9 w-auto shrink-0 group-data-[collapsible=icon]:h-8" />
}

function getInitials(name?: string) {
  if (!name) return "SR"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("")
}

export function Sidebar() {
  const pathname = usePathname()
  const { role, signOut, user } = useAuth()
  const { unreadCount } = useAnnouncements()

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
                      className="gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 [&_svg]:size-[18px]"
                    >
                      <Icon />
                      <span className="text-sm group-data-[collapsible=icon]:hidden">{item.label}</span>
                      {item.href === "/announcements" && unreadCount > 0 ? (
                        <Badge variant="destructive" className="ml-auto group-data-[collapsible=icon]:hidden">
                          {unreadCount}
                        </Badge>
                      ) : null}
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
          <DropdownMenu>
            <DropdownMenuTrigger
              className="hover:bg-sidebar-accent focus-visible:ring-primary/25 flex h-8 w-8 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-3"
              aria-label="Open account menu"
              title="Profile"
            >
              <Avatar className="size-7">
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" className="w-64">
              <div className="px-1.5 py-1">
                <span className="text-foreground block text-sm font-medium">{user?.name ?? "Guest"}</span>
                <span className="text-muted-foreground mt-1 block truncate text-xs">{user?.email ?? "No active session"}</span>
                <Badge className="mt-2 capitalize" variant="secondary">
                  {role}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
