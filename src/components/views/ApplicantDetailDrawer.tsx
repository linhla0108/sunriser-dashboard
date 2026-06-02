"use client"

import { ExternalLink, FileText, Link2, Mail, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CandidatePreviewDialog } from "@/components/candidates/CandidatePreviewDialog"
import { PortfolioLinkPopover } from "@/components/candidates/PortfolioLinkPopover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { candidateLinksFromApplicant } from "@/lib/candidates/candidateLinks"
import type { Applicant } from "@/lib/types"

interface ApplicantDetailDrawerProps {
  applicant: Applicant | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateApplicant?: (id: string, patch: Partial<Applicant>) => void
}

function ResultBadge({ result }: { result: string }) {
  if (result === "Passed") {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Passed</Badge>
  }
  if (result === "Failed") {
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Failed</Badge>
  }
  if (result === "Waiting list") {
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Waiting list</Badge>
  }
  return <Badge variant="secondary">{result}</Badge>
}

function CompactField({ label, value, emphasis = false }: { label: string; value: React.ReactNode; emphasis?: boolean }) {
  return (
    <div className="border-border/80 bg-background/70 rounded-2xl border px-3 py-2.5">
      <div className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">{label}</div>
      <div className={emphasis ? "text-foreground mt-1 text-sm leading-snug font-semibold" : "text-foreground mt-1 text-sm leading-snug"}>
        {value}
      </div>
    </div>
  )
}

function DetailSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section data-v2-card="" className="border-border bg-card/80 rounded-2xl border p-4">
      <div className="mb-3">
        <h3 className="text-foreground text-sm font-semibold">{title}</h3>
        {description ? <p className="text-muted-foreground mt-1 text-xs">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function LongText({ children }: { children?: string }) {
  if (!children) return <span className="text-muted-foreground">-</span>
  return <span className="block whitespace-pre-wrap">{children}</span>
}

export function ApplicantDetailDrawer({ applicant, open, onOpenChange, onUpdateApplicant }: ApplicantDetailDrawerProps) {
  const displayed = applicant
  const portfolioLinks = displayed ? candidateLinksFromApplicant(displayed) : []
  const submittedLabel = displayed?.typeformSubmittedAt ?? displayed?.submittedAt
  const resultBadges = [displayed?.round1Result, displayed?.round2Result].filter(Boolean) as string[]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-v2-glass-panel="strong"
        className="bg-card/95 max-h-[90dvh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] grid-rows-[auto_auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-3xl p-0 backdrop-blur-xl sm:max-w-5xl"
      >
        {displayed ? (
          <>
            <DialogHeader className="border-border border-b px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle className="text-lg sm:text-xl">{displayed.name}</DialogTitle>
                    <Badge variant="secondary">Batch {displayed.batch}</Badge>
                    {displayed.pic ? <Badge variant="outline">PIC {displayed.pic}</Badge> : null}
                  </div>
                  <DialogDescription className="mt-1 text-sm">{displayed.position1}</DialogDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resultBadges.length > 0 ? (
                    resultBadges.map(result => <ResultBadge key={result} result={result} />)
                  ) : (
                    <Badge variant="secondary">No result yet</Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="border-border border-b px-4 py-3 sm:px-5">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
                <CompactField label="University" value={displayed.university} emphasis={true} />
                <CompactField label="Major" value={displayed.major} />
                <CompactField label="Year" value={displayed.yearOfStudy} />
                <CompactField label="GPA" value={displayed.gpa.toFixed(1)} emphasis={true} />
                <CompactField label="Experience" value={displayed.hasExperience ? "Yes" : "No"} />
                <CompactField label="Submitted" value={submittedLabel ?? "-"} />
              </div>
            </div>

            <Tabs defaultValue="overview" className="min-h-0 gap-0">
              <div className="border-border border-b px-4 py-2.5 sm:px-5">
                <TabsList className="bg-muted/80 w-full rounded-2xl p-1 sm:w-auto">
                  <TabsTrigger className="rounded-xl px-3" value="overview">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger className="rounded-xl px-3" value="materials">
                    Materials
                  </TabsTrigger>
                  <TabsTrigger className="rounded-xl px-3" value="notes">
                    Notes
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                  <DetailSection title="Profile">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <CompactField label="Position" value={displayed.position1} />
                      <CompactField label="Full time" value={displayed.fullTime ? "Available" : "Not committed"} />
                      <CompactField label="Batch" value={displayed.batch} />
                      <CompactField label="Typeform roles" value={displayed.sourcePositions ?? "-"} />
                    </div>
                  </DetailSection>

                  <DetailSection title="Contact">
                    <div className="grid gap-2">
                      <CompactField
                        label="Email"
                        value={
                          <span className="inline-flex items-center gap-2 break-all">
                            <Mail className="text-muted-foreground size-3.5 shrink-0" />
                            <span>{displayed.email}</span>
                          </span>
                        }
                      />
                      <CompactField
                        label="Phone"
                        value={
                          <span className="inline-flex items-center gap-2">
                            <Phone className="text-muted-foreground size-3.5 shrink-0" />
                            <span>{displayed.phone}</span>
                          </span>
                        }
                      />
                    </div>
                  </DetailSection>

                  <DetailSection title="Assessment">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <CompactField label="Round 1" value={displayed.round1Result ? <ResultBadge result={displayed.round1Result} /> : "—"} />
                      <CompactField label="Round 2" value={displayed.round2Result ? <ResultBadge result={displayed.round2Result} /> : "—"} />
                    </div>
                    {displayed.screeningNote ? (
                      <div className="mt-3">
                        <CompactField label="Screening note" value={<LongText>{displayed.screeningNote}</LongText>} />
                      </div>
                    ) : null}
                  </DetailSection>

                  <DetailSection title="Source">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <CompactField label="Discovery" value={displayed.discoveryChannel} />
                      <CompactField label="Referrer" value={displayed.internalReferrer ?? "-"} />
                      <CompactField label="PIC" value={displayed.pic ?? "-"} />
                      <CompactField label="Token" value={displayed.typeformToken ?? "-"} />
                    </div>
                  </DetailSection>
                </div>
              </TabsContent>

              <TabsContent value="materials" className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                  <DetailSection title="Files & Links">
                    <div className="grid gap-3">
                      <CompactField
                        label="Academic file"
                        value={
                          <CandidatePreviewDialog
                            title={`${displayed.name} academic file`}
                            targets={displayed.academicFile ? [{ label: "Academic file", url: displayed.academicFile }] : []}
                            triggerLabel={`Preview academic file for ${displayed.name}`}
                            icon={FileText}
                          />
                        }
                      />
                      <CompactField
                        label="Portfolio"
                        value={
                          <div className="flex min-w-0 flex-col gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              {portfolioLinks.length > 0 ? (
                                <div className="flex min-w-0 flex-wrap items-center gap-1">
                                  {portfolioLinks.map((url, linkIndex) => (
                                    <PortfolioLinkPopover
                                      key={`${url}-${linkIndex}`}
                                      url={url}
                                      label={`Open portfolio ${linkIndex + 1} for ${displayed.name}`}
                                      className="text-muted-foreground hover:text-primary rounded-full"
                                    />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground inline-flex size-7 items-center justify-center rounded-full">
                                  <Link2 className="size-4" />
                                </span>
                              )}
                              <span className="text-muted-foreground truncate text-xs">{displayed.portfolio || "No detected URL"}</span>
                            </div>
                            {portfolioLinks.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {portfolioLinks.map((url, index) => (
                                  <a
                                    key={`${url}-${index}`}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary inline-flex items-center gap-1 truncate text-xs hover:underline"
                                  >
                                    <ExternalLink className="size-3.5 shrink-0" />
                                    <span className="truncate">{url}</span>
                                  </a>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        }
                      />
                    </div>
                  </DetailSection>

                  <DetailSection title="Candidate Responses">
                    <div className="grid gap-3">
                      <CompactField label="Experience" value={displayed.hasExperience ? "Yes" : "No"} />
                      <CompactField label="Description" value={<LongText>{displayed.experienceDesc}</LongText>} />
                      <CompactField label="Internship" value={<LongText>{displayed.internshipCommitment}</LongText>} />
                      <CompactField label="Post-internship" value={<LongText>{displayed.postInternshipFullTime}</LongText>} />
                      <CompactField label="Message" value={<LongText>{displayed.sunStudioMessage}</LongText>} />
                    </div>
                  </DetailSection>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                <DetailSection title="Internal Note" description="Working notes for candidate review and follow-up.">
                  <Textarea
                    value={displayed.note ?? ""}
                    onChange={event => onUpdateApplicant?.(displayed.id, { note: event.currentTarget.value })}
                    placeholder="Add candidate note..."
                    className="bg-card/80 min-h-40 resize-y"
                  />
                </DetailSection>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
