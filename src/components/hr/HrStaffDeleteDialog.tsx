"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { HrStaff } from "@/lib/hr/types"

interface Props {
  staff: HrStaff | null
  onConfirm: () => void
  onClose: () => void
}

export function HrStaffDeleteDialog({ staff, onConfirm, onClose }: Props) {
  return (
    <Dialog
      open={!!staff}
      onOpenChange={v => {
        if (!v) onClose()
      }}
    >
      <DialogContent className="rounded-3xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Remove staff member?</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">{staff?.name}</span> will be permanently removed from the HR team. This cannot be undone.
        </p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-full">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full">
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
