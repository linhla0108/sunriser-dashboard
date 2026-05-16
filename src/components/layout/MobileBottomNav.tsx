'use client'

import { LayoutDashboard, Table2 } from 'lucide-react'
import type { View } from './Sidebar'

interface MobileBottomNavProps {
  activeView: View
  onViewChange: (view: View) => void
}

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'table', label: 'Table', icon: Table2 },
]

export default function MobileBottomNav({ activeView, onViewChange }: MobileBottomNavProps) {
  return (
    <nav
      data-cid="mobile-bottom-nav"
      className="fixed right-0 bottom-0 left-0 z-20 flex h-16 items-center justify-around border-t border-[#f9f9f9] bg-white sm:hidden"
    >
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = activeView === id
        return (
          <button
            key={id}
            data-cid={`nav-item-${id}`}
            onClick={() => onViewChange(id)}
            className="flex min-w-[64px] flex-col items-center gap-1 py-2"
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2.2 : 1.8}
              className={isActive ? 'text-[#FF5533]' : 'text-[#767676]'}
            />
            <span
              className={`text-[11px] font-medium ${
                isActive ? 'text-[#FF5533]' : 'text-[#767676]'
              }`}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
