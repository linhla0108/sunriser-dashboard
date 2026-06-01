"use client"

import { ExternalLink, FileText, Link2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { CandidatePreviewDialog } from "@/components/candidates/CandidatePreviewDialog"
import { PortfolioLinkPopover } from "@/components/candidates/PortfolioLinkPopover"
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

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-3 py-1.5">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-foreground min-w-0 text-sm">{children}</span>
    </div>
  )
}

function LongText({ children }: { children?: string }) {
  if (!children) return <span className="text-muted-foreground">-</span>
  return <span className="block whitespace-pre-wrap">{children}</span>
}

export function ApplicantDetailDrawer({ applicant, open, onOpenChange, onUpdateApplicant }: ApplicantDetailDrawerProps) {
  const displayed = applicant
  const portfolioLinks = displayed ? candidateLinksFromApplicant(displayed) : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent data-v2-glass-panel="strong" className="bg-card/90 w-[calc(100vw-1rem)] overflow-y-auto backdrop-blur-xl sm:max-w-[720px]">
        {displayed && (
          <>
            <SheetHeader>
              <SheetTitle>{displayed.name}</SheetTitle>
              <SheetDescription>{displayed.position1}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4 pb-4">
              <section>
                <h3 className="text-foreground mb-2 text-sm font-medium">Details</h3>
                <div data-v2-card="" className="border-border bg-card/80 rounded-lg border p-3">
                  <DetailRow label="University">{displayed.university}</DetailRow>
                  <DetailRow label="Year of Study">{displayed.yearOfStudy}</DetailRow>
                  <DetailRow label="GPA">{displayed.gpa.toFixed(1)}</DetailRow>
                  <DetailRow label="Batch">{displayed.batch}</DetailRow>
                  {displayed.sourcePositions ? <DetailRow label="Typeform roles">{displayed.sourcePositions}</DetailRow> : null}
                </div>
              </section>

              <section>
                <h3 className="text-foreground mb-2 text-sm font-medium">Application</h3>
                <div data-v2-card="" className="border-border bg-card/80 rounded-lg border p-3">
                  <DetailRow label="Academic file">
                    <CandidatePreviewDialog
                      title={`${displayed.name} academic file`}
                      targets={displayed.academicFile ? [{ label: "Academic file", url: displayed.academicFile }] : []}
                      triggerLabel={`Preview academic file for ${displayed.name}`}
                      icon={FileText}
                    />
                  </DetailRow>
                  <DetailRow label="Has experience">{displayed.hasExperience ? "Yes" : "No"}</DetailRow>
                  <DetailRow label="Description">
                    <LongText>{displayed.experienceDesc}</LongText>
                  </DetailRow>
                  <DetailRow label="Portfolio">
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
                  </DetailRow>
                  <DetailRow label="Internship">
                    <LongText>{displayed.internshipCommitment}</LongText>
                  </DetailRow>
                  <DetailRow label="Post-internship">
                    <LongText>{displayed.postInternshipFullTime}</LongText>
                  </DetailRow>
                  <DetailRow label="Message">
                    <LongText>{displayed.sunStudioMessage}</LongText>
                  </DetailRow>
                </div>
              </section>

              <section>
                <h3 className="text-foreground mb-2 text-sm font-medium">Assessment</h3>
                <div data-v2-card="" className="border-border bg-card/80 rounded-lg border p-3">
                  <DetailRow label="Round 1">
                    {displayed.round1Result ? <ResultBadge result={displayed.round1Result} /> : <span className="text-muted-foreground">—</span>}
                  </DetailRow>
                  {displayed.round2Result && (
                    <DetailRow label="Round 2">
                      <ResultBadge result={displayed.round2Result} />
                    </DetailRow>
                  )}
                  {displayed.screeningNote ? (
                    <DetailRow label="Screening note">
                      <LongText>{displayed.screeningNote}</LongText>
                    </DetailRow>
                  ) : null}
                </div>
              </section>

              <section>
                <h3 className="text-foreground mb-2 text-sm font-medium">Contact</h3>
                <div data-v2-card="" className="border-border bg-card/80 rounded-lg border p-3">
                  <DetailRow label="Email">{displayed.email}</DetailRow>
                  <DetailRow label="Phone">{displayed.phone}</DetailRow>
                  <DetailRow label="Discovery">{displayed.discoveryChannel}</DetailRow>
                  {displayed.internalReferrer ? <DetailRow label="Referrer">{displayed.internalReferrer}</DetailRow> : null}
                  {displayed.pic && <DetailRow label="PIC">{displayed.pic}</DetailRow>}
                  {displayed.typeformSubmittedAt ? <DetailRow label="Submitted">{displayed.typeformSubmittedAt}</DetailRow> : null}
                  {displayed.typeformToken ? <DetailRow label="Token">{displayed.typeformToken}</DetailRow> : null}
                </div>
              </section>

              <section>
                <h3 className="text-foreground mb-2 text-sm font-medium">Note</h3>
                <textarea
                  value={displayed.note ?? ""}
                  onChange={event => onUpdateApplicant?.(displayed.id, { note: event.currentTarget.value })}
                  placeholder="Add candidate note..."
                  className="border-border bg-card/80 text-foreground focus:border-primary min-h-28 w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none"
                />
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
