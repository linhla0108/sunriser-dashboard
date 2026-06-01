import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAnnouncementPublisher } from "@/lib/announcements/serverAccess"

export async function GET() {
  const access = await requireAnnouncementPublisher()
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: access.status ?? 403 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: "service_role_not_configured" }, { status: 503 })

  let announcementsQuery = admin.from("announcements").select("id").is("deleted_at", null)
  if (access.role !== "admin") announcementsQuery = announcementsQuery.eq("author_user_id", access.userId)

  const { data: announcements, error: announcementsError } = await announcementsQuery
  if (announcementsError) return NextResponse.json({ error: announcementsError.message }, { status: 500 })

  const announcementIds = (announcements ?? []).map(row => row.id as string)
  if (announcementIds.length === 0) return NextResponse.json({ stats: [] })

  const { data: reads, error: readsError } = await admin.from("announcement_reads").select("announcement_id").in("announcement_id", announcementIds)

  if (readsError) return NextResponse.json({ error: readsError.message }, { status: 500 })

  const counts = new Map<string, number>()
  for (const row of reads ?? []) {
    const key = row.announcement_id as string
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return NextResponse.json({
    stats: announcementIds.map(announcementId => ({
      announcementId,
      readCount: counts.get(announcementId) ?? 0,
    })),
  })
}
