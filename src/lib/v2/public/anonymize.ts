import { mockApplicants } from "@/lib/mockData"
import type { ReportSnapshot } from "@/lib/v2/report/types"

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function anonymize(snapshot: ReportSnapshot): ReportSnapshot {
  const aliases: string[] = []
  const nameToAlias = new Map<string, string>()

  snapshot.sourceApplicants.forEach((id, index) => {
    const alias = `Candidate ${String.fromCharCode(65 + index)}`
    aliases.push(alias)
    const source = mockApplicants.find(applicant => applicant.id === id)
    if (source?.name) nameToAlias.set(source.name, alias)
  })

  // Longer names first — prevents "An" from matching inside "Lan" before "Lan" is replaced.
  const sortedEntries = Array.from(nameToAlias.entries()).sort((a, b) => b[0].length - a[0].length)

  return {
    ...snapshot,
    aliases,
    sections: snapshot.sections.map(section => {
      let content = section.content
      for (const [name, alias] of sortedEntries) {
        content = content.replace(new RegExp(escapeRegex(name), "g"), alias)
      }
      return { ...section, content }
    }),
  }
}
