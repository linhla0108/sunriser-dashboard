import type { UploadSession } from "./UploadSessionContext"

export async function persistUploadSessionDraft(session: UploadSession) {
  void session
  return {
    status: "skipped" as const,
    reason: "No upload persistence API or database table is configured yet.",
  }
}
