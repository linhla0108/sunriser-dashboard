import { randomUUID } from "crypto"
import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ATTACHMENTS_BUCKET } from "@/lib/announcements/client"
import { requireAnnouncementPublisher } from "@/lib/announcements/serverAccess"
import { announcementAttachmentSchema, announcementUploadRequestSchema } from "@/lib/announcements/validation"

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-")
}

export async function POST(request: NextRequest) {
  const access = await requireAnnouncementPublisher()
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: access.status ?? 403 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "service_role_not_configured" }, { status: 503 })

  const formData = await request.formData()
  const announcementId = formData.get("announcementId")
  const file = formData.get("file")

  if (typeof announcementId !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "invalid_form_data" }, { status: 400 })
  }

  const parsed = announcementUploadRequestSchema.safeParse({
    announcementId,
    originalFilename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "invalid_attachment" }, { status: 422 })
  }

  const { data: announcement, error: announcementError } = await admin
    .from("announcements")
    .select("id, author_user_id, deleted_at")
    .eq("id", announcementId)
    .maybeSingle()

  if (announcementError) return NextResponse.json({ error: announcementError.message }, { status: 500 })
  if (!announcement || announcement.deleted_at) return NextResponse.json({ error: "announcement_not_found" }, { status: 404 })
  if (access.role !== "admin" && announcement.author_user_id !== access.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const storagePath = `${announcementId}/${randomUUID()}-${sanitizeFilename(file.name)}`
  const upload = await admin.storage.from(ATTACHMENTS_BUCKET).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  })

  if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 })

  const { data: attachment, error: attachmentError } = await admin
    .from("announcement_attachments")
    .insert({
      announcement_id: announcementId,
      storage_path: storagePath,
      original_filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      uploader_user_id: access.userId,
    })
    .select("id, announcement_id, storage_path, original_filename, mime_type, size_bytes, uploader_user_id, created_at")
    .single()

  if (attachmentError) {
    await admin.storage.from(ATTACHMENTS_BUCKET).remove([storagePath])
    return NextResponse.json({ error: attachmentError.message }, { status: 500 })
  }

  return NextResponse.json({
    attachment: announcementAttachmentSchema.parse({
      id: attachment.id,
      announcementId: attachment.announcement_id,
      storagePath: attachment.storage_path,
      originalFilename: attachment.original_filename,
      mimeType: attachment.mime_type,
      sizeBytes: attachment.size_bytes,
      uploadedByUserId: attachment.uploader_user_id,
      createdAt: attachment.created_at,
    }),
  })
}
