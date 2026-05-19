"use client"

import { z } from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"

const VIEWS = ["table", "pipeline", "chart"] as const
const SORTS = ["name", "gpa", "submittedAt"] as const
const LANGS = ["en", "vi"] as const

type ViewKey = (typeof VIEWS)[number]
type SortKey = (typeof SORTS)[number]
type Lang = (typeof LANGS)[number]

const SHORTCUTS: Array<{ keys: string; action: string }> = [
  { keys: "Ctrl+\\", action: "Toggle sidebar" },
  { keys: "Ctrl+J", action: "Open AI drawer" },
  { keys: "Ctrl+N", action: "Open notes drawer" },
  { keys: "Ctrl+R", action: "Create report" },
  { keys: "1 – 3", action: "Switch view (Table / Pipeline / Charts)" },
  { keys: "P", action: "Pin focused candidate" },
]

export function WorkspaceTab() {
  const [defaultView, setDefaultView] = usePersistedState<ViewKey>("v2.workspace.defaultView", "table", z.enum(VIEWS))
  const [defaultSort, setDefaultSort] = usePersistedState<SortKey>("v2.workspace.defaultSort", "submittedAt", z.enum(SORTS))
  const [lang, setLang] = usePersistedState<Lang>("v2.workspace.lang", "en", z.enum(LANGS))

  return (
    <div className="mt-6 space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="default-view" className="text-xs font-semibold text-muted-foreground uppercase">
            Default view
          </Label>
          <Select value={defaultView} onValueChange={value => setDefaultView((value as ViewKey) ?? "table")}>
            <SelectTrigger id="default-view">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIEWS.map(view => (
                <SelectItem key={view} value={view} className="capitalize">
                  {view}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="default-sort" className="text-xs font-semibold text-muted-foreground uppercase">
            Default sort
          </Label>
          <Select value={defaultSort} onValueChange={value => setDefaultSort((value as SortKey) ?? "submittedAt")}>
            <SelectTrigger id="default-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="gpa">GPA</SelectItem>
              <SelectItem value="submittedAt">Submitted at</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lang" className="text-xs font-semibold text-muted-foreground uppercase">
            Language
          </Label>
          <Select value={lang} onValueChange={value => setLang((value as Lang) ?? "en")}>
            <SelectTrigger id="lang">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="rounded-2xl border border-foreground/10 p-4">
        <h2 className="font-heading text-sm font-semibold text-foreground">Keyboard shortcuts</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            {SHORTCUTS.map(shortcut => (
              <tr key={shortcut.action} className="border-t border-foreground/5 first:border-0">
                <td className="py-2 text-foreground/85">{shortcut.action}</td>
                <td className="py-2 text-right">
                  <kbd className="rounded-md border border-foreground/15 bg-background px-2 py-0.5 font-mono text-xs text-foreground">
                    {shortcut.keys}
                  </kbd>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
