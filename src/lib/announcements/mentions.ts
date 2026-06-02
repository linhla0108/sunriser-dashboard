export interface MentionCandidate {
  id: string
  name: string
  email: string
  positions: string[]
}

export interface MentionMatch {
  query: string
  start: number
  end: number
}

export function getMentionMatch(value: string, caret: number): MentionMatch | null {
  const prefix = value.slice(0, caret)
  const match = prefix.match(/(^|\s)@([^\s@]*)$/)
  if (!match) return null

  const query = match[2] ?? ""
  const start = prefix.length - query.length - 1

  return {
    query,
    start,
    end: caret,
  }
}

export function insertMention(value: string, match: MentionMatch, name: string) {
  const mention = `@${name} `
  const nextValue = `${value.slice(0, match.start)}${mention}${value.slice(match.end)}`

  return {
    nextValue,
    nextCaret: match.start + mention.length,
  }
}

export function filterMentionCandidates(candidates: MentionCandidate[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return candidates

  return candidates.filter(candidate => {
    const haystacks = [candidate.name, candidate.email, candidate.positions.join(" ")]
    return haystacks.some(value => value.toLowerCase().includes(normalizedQuery))
  })
}
