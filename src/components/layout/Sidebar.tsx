'use client'

import { LayoutDashboard, Table2, Upload, MessageSquare } from 'lucide-react'

export type View = 'dashboard' | 'table' | 'upload' | 'chat'

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'table', label: 'Table', icon: Table2 },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
]

interface SidebarProps {
  activeView: View
  onViewChange: (view: View) => void
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside
      className="fixed left-0 top-0 h-full w-[240px] bg-white flex flex-col z-10"
      style={{
        borderRight: '1px solid rgba(4, 23, 43, 0.06)',
      }}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <div className="mb-1">
          <span
            className="text-[22px] font-bold tracking-tight text-[#17191c]"
            style={{ fontFamily: "'Signifier', Georgia, 'Times New Roman', serif" }}
          >
            SUN.RISER
          </span>
        </div>
        <p className="text-xs text-[#777b86] font-medium tracking-wide uppercase">
          2026 Dashboard
        </p>
      </div>

      <div className="mx-4 mb-4 h-px bg-[#f7f7f8]" />

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-[#17191c] text-white'
                  : 'text-[#4c4c4c] hover:bg-[#f7f7f8] hover:text-[#17191c]'
              }`}
            >
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="px-6 pb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#fbe1d1]" />
          <span className="text-xs text-[#a3a6af] font-mono">v2026</span>
        </div>
      </div>
    </aside>
  )
}
