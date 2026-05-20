"use client"

import { LayoutDashboard, Table2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export type View = "dashboard" | "table"

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "table", label: "Table", icon: Table2 },
]

interface SidebarProps {
  activeView: View
  onViewChange: (view: View) => void
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside
      data-cid="sidebar"
      className="fixed top-0 left-0 z-10 hidden h-full w-16 flex-col bg-white sm:flex lg:w-[240px]"
      style={{ borderRight: "1px solid rgba(4, 23, 43, 0.06)" }}
    >
      {/* Logo */}
      <div className="px-3 pt-5 pb-4 lg:px-4">
        <div className="mb-1 flex items-center justify-center lg:justify-start">
          <span className="hidden text-[22px] font-bold tracking-tight text-[#1b1b1b] lg:block">SUN.RISER</span>
          <span className="text-[20px] font-bold tracking-tight text-[#FF5533] lg:hidden">S</span>
        </div>
        <p className="hidden text-xs font-medium tracking-wide text-[#6B5549] uppercase lg:block">2026 Dashboard</p>
      </div>

      <div className="mx-3 mb-4 h-px bg-[#f9f9f9] lg:mx-4" />

      <nav className="flex-1 space-y-0.5 px-2 lg:px-3">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id
          return (
            <Button
              variant="plain"
              size="plain"
              key={id}
              data-cid={`nav-item-${id}`}
              onClick={() => onViewChange(id)}
              title={label}
              className={`flex w-full items-center justify-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm font-medium transition-all duration-150 lg:justify-start lg:px-3 ${
                isActive ? "bg-[#FF5533] text-white" : "text-[#555555] hover:bg-[#f9f9f9] hover:text-[#1b1b1b]"
              } `}
            >
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} className="flex-shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </Button>
          )
        })}
      </nav>

      <div className="px-3 pb-4 lg:px-4">
        <div className="flex items-center justify-center gap-2 lg:justify-start">
          <div className="h-2 w-2 rounded-full bg-[#ffdad3]" />
          <span className="hidden font-mono text-xs text-[#767676] lg:block">v2026</span>
        </div>
      </div>
    </aside>
  )
}
