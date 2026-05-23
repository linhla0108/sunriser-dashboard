export function matchResponse(input: string) {
  const text = input.toLowerCase()
  if (text.includes("top") || text.includes("best"))
    return "Top candidates are strongest when GPA, portfolio evidence, and Round 1 notes agree. Pin a shortlist and compare them side by side."
  if (text.includes("pass"))
    return "The current mock pool has a strong pass cluster in AI Engineering and Data Analysis. Review waiting-list candidates with GPA above 8.0 next."
  if (text.includes("report")) return "Create Report will use pinned candidates first, then summarize funnel signals and hiring recommendations."
  return "I can help inspect candidates, suggest shortlist criteria, and prepare a mock recruiting summary for the V2 workspace."
}
