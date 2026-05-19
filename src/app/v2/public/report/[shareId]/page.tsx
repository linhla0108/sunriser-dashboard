import { redirect } from "next/navigation"

export default async function V2PublicReportRedirect({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params
  redirect(`/public/report/${shareId}`)
}
