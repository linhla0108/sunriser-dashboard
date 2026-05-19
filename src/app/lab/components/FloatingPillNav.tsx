"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import * as NavigationMenu from "@radix-ui/react-navigation-menu"
import { BarChart3, Briefcase, CheckSquare, Code, FileText, Layers, Mail, Menu, Search, Sparkles, Sun, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MenuItem {
  href: string
  title: string
  desc: string
  icon: ReactNode
}

const FEATURES: MenuItem[] = [
  {
    href: "/email",
    title: "Email",
    desc: "Labeled, drafted, and ready to go.",
    icon: <Mail className="size-4.5" />,
  },
  {
    href: "/todo",
    title: "Todo",
    desc: "A to-do list that completes itself.",
    icon: <CheckSquare className="size-4.5" />,
  },
  {
    href: "/morning-briefing",
    title: "Morning Briefing",
    desc: "Start every day fully briefed.",
    icon: <Sun className="size-4.5" />,
  },
  {
    href: "/documents",
    title: "Documents",
    desc: "Docs, decks, and PDFs in seconds.",
    icon: <FileText className="size-4.5" />,
  },
  {
    href: "/search",
    title: "Search",
    desc: "Find anything across your workspace.",
    icon: <Search className="size-4.5" />,
  },
  {
    href: "/agent",
    title: "Agent",
    desc: "An agent that actually works.",
    icon: <Sparkles className="size-4.5" />,
  },
]

const USE_CASES: MenuItem[] = [
  {
    href: "/founder",
    title: "Founder",
    desc: "An extra pair of hands, 24/7.",
    icon: <Briefcase className="size-4.5" />,
  },
  {
    href: "/vc",
    title: "Venture Capitalist",
    desc: "Stay on top of every deal.",
    icon: <TrendingUp className="size-4.5" />,
  },
  {
    href: "/engineers",
    title: "Engineers",
    desc: "Get back to building.",
    icon: <Code className="size-4.5" />,
  },
  {
    href: "/sales",
    title: "Sales",
    desc: "More calls, less busywork.",
    icon: <BarChart3 className="size-4.5" />,
  },
  {
    href: "/pm",
    title: "Product Manager",
    desc: "Your overhead, on autopilot.",
    icon: <Layers className="size-4.5" />,
  },
  {
    href: "/agency",
    title: "Agency",
    desc: "Deliver more, manage less.",
    icon: <Users className="size-4.5" />,
  },
]

function MenuPanel({ label, items }: { label: string; items: MenuItem[] }) {
  return (
    <div className="p-3">
      <p className="p-2 text-sm leading-[14px] font-bold text-white/50 uppercase">{label}</p>
      <ul className="w-80">
        {items.map(it => (
          <li key={it.href}>
            <NavigationMenu.Link asChild>
              <Link
                href={it.href}
                className="group/navigation-menu-link flex flex-row items-center gap-3 rounded-[17px] p-2 text-sm transition-all outline-none hover:bg-black/10 focus-visible:outline-1"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-black/5 text-white transition-colors group-hover/navigation-menu-link:bg-white group-hover/navigation-menu-link:text-black">
                  {it.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm leading-[14px] font-medium text-white">{it.title}</p>
                  <p className="text-sm leading-[14px] text-white/50">{it.desc}</p>
                </div>
              </Link>
            </NavigationMenu.Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const triggerClass =
  "group inline-flex w-max items-center justify-center rounded-full px-3.5 py-2.5 text-sm font-medium leading-[100%] text-white outline-none ring-inset transition-[color,background-color,box-shadow] duration-200 hover:bg-black/10 data-[state=open]:bg-black/10 focus-visible:bg-black/10 focus-visible:ring-1 focus-visible:ring-white/30"

export default function FloatingPillNav() {
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y < 80) setVisible(true)
      else if (y > lastY.current + 4) setVisible(false)
      else if (y < lastY.current - 4) setVisible(true)
      lastY.current = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      data-cid="floating-pill-nav"
      className={`dimension-floating-nav fixed inset-x-0 bottom-4 isolate z-50 mx-auto flex h-fit w-full max-w-[90vw] items-center justify-between gap-4 rounded-full p-3 transition-opacity duration-300 sm:bottom-8 sm:w-fit sm:max-w-none sm:hover:!opacity-100 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <Link
        href="/"
        aria-label="Sunriser home"
        className="ml-1 flex items-center gap-2 rounded-full transition-opacity ring-inset hover:opacity-90 focus-visible:ring-1 focus-visible:ring-white/30"
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-white text-black">
          <Sun className="size-3.5 fill-black" />
        </span>
        <span className="text-sm leading-none font-bold text-white">Sunriser</span>
      </Link>

      <Button
        variant="plain"
        size="plain"
        type="button"
        aria-label="Open menu"
        className="flex size-9 items-center justify-center rounded-full bg-black/[0.03] text-white transition hover:bg-white/10 active:bg-black/10 sm:hidden"
      >
        <Menu className="size-5" />
      </Button>

      <div className="hidden h-6 w-px bg-white/10 sm:block" />

      <NavigationMenu.Root className="relative hidden max-w-max flex-1 items-center justify-center sm:flex" delayDuration={0} skipDelayDuration={200}>
        <NavigationMenu.List className="flex flex-1 list-none items-center justify-center gap-0 font-normal text-white">
          <NavigationMenu.Item>
            <NavigationMenu.Trigger className={triggerClass}>Features</NavigationMenu.Trigger>
            <NavigationMenu.Content className="data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 absolute top-0 left-0 w-auto duration-300">
              <MenuPanel label="Features" items={FEATURES} />
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          <NavigationMenu.Item>
            <NavigationMenu.Trigger className={triggerClass}>Use Cases</NavigationMenu.Trigger>
            <NavigationMenu.Content className="data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 absolute top-0 left-0 w-auto duration-300">
              <MenuPanel label="Use Cases" items={USE_CASES} />
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <a href="/pricing" className={triggerClass}>
                Pricing
              </a>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>

        <div className="absolute top-auto bottom-[calc(100%+1.5rem)] left-1/2 isolate z-[100] flex -translate-x-1/2 justify-center">
          <NavigationMenu.Viewport className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-[var(--radix-navigation-menu-viewport-width)] origin-top overflow-hidden rounded-3xl bg-black/40 text-white backdrop-blur-2xl duration-200" />
        </div>
      </NavigationMenu.Root>

      <Link
        href="/lab"
        className="dimension-frost-border ml-0 hidden shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#f3f3f3] to-[#eeeeee] px-3 py-2 text-sm leading-none font-medium text-gray-950 shadow-none transition duration-200 ring-inset hover:to-[#eeeeee]/70 hover:shadow-[0_0_8px_1px_rgba(255,255,255,0.15)_inset] focus-visible:ring-1 focus-visible:ring-white/60 sm:flex"
      >
        Get Started
      </Link>
    </nav>
  )
}
