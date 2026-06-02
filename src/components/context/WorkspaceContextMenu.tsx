"use client"

import { useState } from "react"
import { Copy, Keyboard, Link2 } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface WorkspaceContextMenuProps {
  children: React.ReactNode
}

const SHORTCUTS = [{ label: "Focus view switcher first, then press 1-3" }, { label: "Focus table pager first, then press arrow keys" }]

export function WorkspaceContextMenu({ children }: WorkspaceContextMenuProps) {
  const [copied, setCopied] = useState(false)

  const [selectionText, setSelectionText] = useState("")

  function handleContextOpen() {
    // Capture selection before the menu opens (right-click can clear it)
    setSelectionText(window.getSelection()?.toString() ?? "")
  }

  function handleCopy() {
    if (selectionText) navigator.clipboard.writeText(selectionText)
  }

  function handleCopyURL() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ContextMenu
      onOpenChange={open => {
        if (open) handleContextOpen()
      }}
    >
      <ContextMenuTrigger className="contents select-text">{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onClick={handleCopy} disabled={!selectionText}>
          <Copy />
          {selectionText ? `Copy "${selectionText.slice(0, 20)}${selectionText.length > 20 ? "…" : ""}"` : "Copy selected text"}
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={handleCopyURL}>
          <Link2 />
          {copied ? "Copied!" : "Copy page link"}
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Keyboard />
            Keyboard shortcuts
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-52">
            <ContextMenuGroup>
              <ContextMenuLabel>Shortcuts</ContextMenuLabel>
              {SHORTCUTS.map(shortcut => (
                <ContextMenuItem key={shortcut.label} disabled>
                  {shortcut.label}
                </ContextMenuItem>
              ))}
            </ContextMenuGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}
