"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountTab } from "@/components/v2/settings/AccountTab"
import { AppearanceTab } from "@/components/v2/settings/AppearanceTab"
import { WorkspaceTab } from "@/components/v2/settings/WorkspaceTab"

export default function V2SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 lg:px-6">
      <header className="mb-4">
        <h1 className="font-heading text-xl font-semibold text-[var(--v2-ink)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--v2-muted)]">Personalize your V2 workspace.</p>
      </header>

      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>
        <TabsContent value="workspace">
          <WorkspaceTab />
        </TabsContent>
        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
