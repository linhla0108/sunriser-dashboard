import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ATTACHMENTS_BUCKET } from "@/lib/announcements/client"
import { requireActiveAnnouncementUser } from "@/lib/announcements/serverAccess"
import { createClient } from "@/lib/supabase/server"

export async function GET(_request: Request, context: { params: Promise<{ attachmentId: string }> }) {
  const access = await requireActiveAnnouncementUser()
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: access.status ?? 403 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "service_role_not_configured" }, { status: 503 })

  const supabase = await createClient()
  const { attachmentId } = await context.params

  const { data: attachment, error } = await supabase
    .from("announcement_attachments")
    .select("id, storage_path, original_filename")
    .eq("id", attachmentId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!attachment) return NextResponse.json({ error: "attachment_not_found" }, { status: 404 })

  const signed = await admin.storage.from(ATTACHMENTS_BUCKET).createSignedUrl(attachment.storage_path as string, 60)
  if (signed.error) return NextResponse.json({ error: signed.error.message }, { status: 500 })

  return NextResponse.json({
    url: signed.data.signedUrl,
    originalFilename: attachment.original_filename,
  })
}
