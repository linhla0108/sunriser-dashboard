"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountTab } from "@/components/settings/AccountTab"
import { AppearanceTab } from "@/components/settings/AppearanceTab"
import { WorkspaceTab } from "@/components/settings/WorkspaceTab"

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 lg:px-6">
      <header className="mb-4">
        <h1 className="font-heading text-foreground text-xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Personalize your workspace.</p>
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
