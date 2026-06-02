const ANNOUNCEMENT_ATTACHMENT_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".png", ".jpg", ".jpeg"] as const
const ANNOUNCEMENT_ATTACHMENT_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
] as const

function getFileExtension(file: File) {
  const extension = file.name.includes(".") ? `.${file.name.split(".").pop()?.toLowerCase() ?? ""}` : ""
  return extension
}

export function isAcceptedAnnouncementAttachment(file: File) {
  const extension = getFileExtension(file)
  return (
    ANNOUNCEMENT_ATTACHMENT_EXTENSIONS.includes(extension as (typeof ANNOUNCEMENT_ATTACHMENT_EXTENSIONS)[number]) ||
    ANNOUNCEMENT_ATTACHMENT_MIME_TYPES.includes(file.type as (typeof ANNOUNCEMENT_ATTACHMENT_MIME_TYPES)[number])
  )
}

export function splitAnnouncementAttachments(files: File[]) {
  const accepted: File[] = []
  const rejected: File[] = []

  for (const file of files) {
    if (isAcceptedAnnouncementAttachment(file)) accepted.push(file)
    else rejected.push(file)
  }

  return { accepted, rejected }
}

export function mergeAnnouncementAttachments(current: File[], incoming: File[]) {
  const seen = new Set(current.map(file => `${file.name}:${file.size}:${file.lastModified}`))
  const merged = [...current]

  for (const file of incoming) {
    const key = `${file.name}:${file.size}:${file.lastModified}`
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(file)
  }

  return merged
}

export function formatAttachmentAcceptValue() {
  return [...ANNOUNCEMENT_ATTACHMENT_EXTENSIONS, ...ANNOUNCEMENT_ATTACHMENT_MIME_TYPES].join(",")
}
