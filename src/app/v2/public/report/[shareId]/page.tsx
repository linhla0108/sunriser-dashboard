import { PublicReport } from "@/components/v2/public/PublicReport"

export default async function V2PublicReportPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params
  return <PublicReport shareId={shareId} />
}
