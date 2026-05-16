'use client'

import { useState, useEffect, useRef } from 'react'
import {
  X,
  ExternalLink,
  Star,
  GitCompare,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Briefcase,
  Globe,
} from 'lucide-react'
import { animate } from 'animejs'
import { RatingGroup } from '@skeletonlabs/skeleton-react'
import { Applicant } from '@/lib/types'
import { Scorecard, Activity } from '../lab-types'
import {
  getPosColor,
  getPosShort,
  ROUND1_BADGE,
  formatDate,
  prefersReducedMotion,
} from '../lab-utils'

const SCORE_LABELS: { key: keyof Omit<Scorecard, 'notes'>; label: string }[] = [
  { key: 'cvQuality', label: 'CV Quality' },
  { key: 'experience', label: 'Experience' },
  { key: 'gpaScore', label: 'GPA Score' },
  { key: 'communication', label: 'Communication' },
]

interface ApplicantDrawerProps {
  applicant: Applicant | null
  onClose: () => void
  scorecard: Scorecard | undefined
  onUpdateScorecard: (id: string, sc: Scorecard) => void
  activities: Activity[]
  onAddActivity: (id: string, act: Omit<Activity, 'id'>) => void
  isInCompare: boolean
  onToggleCompare: (id: string) => void
  onUpdateRound1: (id: string, result: 'Passed' | 'Failed' | 'Waiting list' | undefined) => void
  onUpdateNotes: (id: string, notes: string) => void
  readOnly?: boolean
}

type DrawerTab = 'profile' | 'scorecard' | 'timeline'

export default function ApplicantDrawer({
  applicant,
  onClose,
  scorecard,
  onUpdateScorecard,
  activities,
  onAddActivity,
  isInCompare,
  onToggleCompare,
  onUpdateRound1,
  onUpdateNotes,
  readOnly,
}: ApplicantDrawerProps) {
  const [tab, setTab] = useState<DrawerTab>('profile')
  const [noteText, setNoteText] = useState('')
  const [localSc, setLocalSc] = useState<Scorecard>(
    () => scorecard ?? { cvQuality: 0, experience: 0, gpaScore: 0, communication: 0, notes: '' }
  )
  const panelRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // B4: sync stale state when applicant changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSc(
      scorecard ?? { cvQuality: 0, experience: 0, gpaScore: 0, communication: 0, notes: '' }
    )
    setTab('profile')
  }, [applicant?.id, scorecard])

  useEffect(() => {
    if (!applicant || !panelRef.current || prefersReducedMotion()) return
    animate(panelRef.current, {
      translateX: ['420px', '0px'],
      opacity: [0, 1],
      duration: 300,
      ease: 'outCubic',
    })
    if (backdropRef.current) animate(backdropRef.current, { opacity: [0, 1], duration: 200 })
  }, [applicant])

  useEffect(() => {
    if (!contentRef.current || prefersReducedMotion()) return
    animate(contentRef.current, {
      opacity: [0, 1],
      translateY: [4, 0],
      duration: 150,
      ease: 'outQuad',
    })
  }, [tab])

  if (!applicant) return null

  const a = applicant
  const safePortfolio = a.portfolio && /^https?:\/\//i.test(a.portfolio) ? a.portfolio : undefined
  const visibleTabs: DrawerTab[] = readOnly ? ['profile'] : ['profile', 'scorecard', 'timeline']
  const posColor = getPosColor(a.position1)
  const r1Badge = a.round1Result ? ROUND1_BADGE[a.round1Result] : null

  function avgScore(sc: Scorecard) {
    const vals = [sc.cvQuality, sc.experience, sc.gpaScore, sc.communication].filter((v) => v > 0)
    return vals.length ? (vals.reduce((x, y) => x + y, 0) / vals.length).toFixed(1) : '—'
  }

  function handleScoreChange(key: keyof Omit<Scorecard, 'notes'>, val: number) {
    const next = { ...localSc, [key]: val }
    setLocalSc(next)
    onUpdateScorecard(a.id, next)
    onAddActivity(a.id, {
      timestamp: new Date().toISOString(),
      action: `Updated ${key} score to ${val}/5`,
      user: 'You',
    })
  }

  function handleSaveNotes() {
    const next = { ...localSc, notes: noteText }
    setLocalSc(next)
    onUpdateScorecard(a.id, next)
    onAddActivity(a.id, {
      timestamp: new Date().toISOString(),
      action: 'Updated scorecard notes',
      user: 'You',
    })
    setNoteText('')
  }

  return (
    <>
      {/* Backdrop */}
      <div ref={backdropRef} className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Drawer */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 z-50 flex h-full w-full flex-col bg-white sm:w-[420px]"
        style={{ boxShadow: '-4px 0 40px rgba(4,23,43,0.12)' }}
      >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-[#f5f5f5] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{ backgroundColor: posColor.bg, color: posColor.text }}
                >
                  {a.name.split(' ').slice(-1)[0]?.[0] ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold tracking-tight text-[#1b1b1b]">{a.name}</p>
                  <span
                    className="mt-0.5 inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold"
                    style={{ backgroundColor: posColor.light, color: posColor.bg }}
                  >
                    {getPosShort(a.position1)}
                  </span>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1.5">
                {r1Badge && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ backgroundColor: r1Badge.bg, color: r1Badge.text }}
                  >
                    {a.round1Result}
                  </span>
                )}
                <button
                  onClick={() => onToggleCompare(a.id)}
                  title={isInCompare ? 'Remove from compare' : 'Add to compare'}
                  className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 ${isInCompare ? 'bg-[#8d1600] text-white' : 'text-[#767676] hover:bg-[#f9f9f9]'}`}
                >
                  <GitCompare size={13} />
                </button>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#767676] transition-colors duration-150 hover:bg-[#f9f9f9]"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Tab bar */}
            <div role="tablist" className="mt-3 flex items-center gap-1 border-b border-[#f0f0f0]">
              {visibleTabs.map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`h-8 cursor-pointer rounded-t px-3 text-xs font-semibold capitalize transition-colors duration-150 ${tab === t ? '-mb-px border-b-2 border-[#8d1600] text-[#1b1b1b]' : 'text-[#555555]'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div ref={contentRef} className="flex-1 overflow-y-auto">
            {tab === 'profile' && (
              <ProfileTab
                applicant={applicant}
                onUpdateRound1={onUpdateRound1}
                onUpdateNotes={onUpdateNotes}
                safePortfolio={safePortfolio}
              />
            )}
            {tab === 'scorecard' && !readOnly && (
              <ScorecardTab
                scorecard={localSc}
                avgScore={avgScore(localSc)}
                onScoreChange={handleScoreChange}
                noteText={noteText}
                onNoteChange={setNoteText}
                onSaveNotes={handleSaveNotes}
              />
            )}
            {tab === 'timeline' && !readOnly && (
              <TimelineTab activities={activities} applicant={applicant} />
            )}
          </div>
      </div>
    </>
  )
}

function ProfileTab({
  applicant: a,
  onUpdateRound1,
  onUpdateNotes,
  safePortfolio,
}: {
  applicant: Applicant
  onUpdateRound1: (id: string, r: 'Passed' | 'Failed' | 'Waiting list' | undefined) => void
  onUpdateNotes: (id: string, n: string) => void
  safePortfolio: string | undefined
}) {
  return (
    <div className="space-y-4 p-4">
      {/* Contact */}
      <Section title="Contact">
        <InfoRow icon={<Mail size={12} />} label="Email" value={a.email} />
        <InfoRow icon={<Phone size={12} />} label="Phone" value={a.phone} />
        {safePortfolio && (
          <div className="flex items-start gap-2">
            <Globe size={12} className="mt-0.5 flex-shrink-0 text-[#767676]" />
            <a
              href={safePortfolio}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1 text-sm text-[#8d1600] hover:underline"
            >
              Portfolio <ExternalLink size={10} />
            </a>
          </div>
        )}
      </Section>

      {/* Education */}
      <Section title="Education">
        <InfoRow icon={<GraduationCap size={12} />} label="University" value={a.university} />
        <InfoRow icon={<GraduationCap size={12} />} label="Major" value={a.major} />
        <InfoRow icon={<GraduationCap size={12} />} label="Year" value={a.yearOfStudy} />
        <InfoRow
          icon={<GraduationCap size={12} />}
          label="GPA"
          value={`${a.gpa.toFixed(2)} / 10`}
        />
      </Section>

      {/* Application */}
      <Section title="Application">
        <InfoRow icon={<Briefcase size={12} />} label="Position 1" value={a.position1} />
        {a.position2 && (
          <InfoRow icon={<Briefcase size={12} />} label="Position 2" value={a.position2} />
        )}
        <InfoRow
          icon={<Calendar size={12} />}
          label="Submitted"
          value={formatDate(a.submittedAt)}
        />
        <InfoRow icon={<Calendar size={12} />} label="Batch" value={`Batch ${a.batch}`} />
        <InfoRow
          icon={<Briefcase size={12} />}
          label="Full time"
          value={a.fullTime ? 'Yes' : 'No'}
        />
        <InfoRow
          icon={<Briefcase size={12} />}
          label="Experience"
          value={a.hasExperience ? 'Yes' : 'No'}
        />
        {a.experienceDesc && (
          <InfoRow icon={<Briefcase size={12} />} label="Details" value={a.experienceDesc} />
        )}
        <InfoRow icon={<Briefcase size={12} />} label="Discovery" value={a.discoveryChannel} />
        {a.pic && <InfoRow icon={<Briefcase size={12} />} label="PIC" value={a.pic} />}
      </Section>

      {/* Round 1 */}
      <Section title="Round 1 Result">
        <div className="flex flex-wrap gap-2">
          {[undefined, 'Passed', 'Failed', 'Waiting list'].map((opt) => {
            const isActive = a.round1Result === opt
            const badge = opt ? ROUND1_BADGE[opt] : null
            return (
              <button
                key={opt ?? 'none'}
                onClick={() =>
                  onUpdateRound1(a.id, opt as 'Passed' | 'Failed' | 'Waiting list' | undefined)
                }
                className="h-7 cursor-pointer rounded-full border px-3 text-xs font-semibold transition-colors duration-150"
                style={
                  isActive && badge
                    ? { backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }
                    : { backgroundColor: '#f9f9f9', color: '#767676', borderColor: '#e5e5e5' }
                }
              >
                {opt ?? 'None'}
              </button>
            )
          })}
        </div>
        <textarea
          defaultValue={a.round1Notes ?? ''}
          onBlur={(e) => onUpdateNotes(a.id, e.target.value)}
          placeholder="Add notes..."
          rows={3}
          className="mt-3 w-full resize-none rounded-2xl border border-[#e8e8e8] p-3 text-sm text-[#1b1b1b] placeholder-[#767676] transition-colors focus:border-[#1b1b1b] focus:outline-none"
        />
      </Section>
    </div>
  )
}

function ScorecardTab({
  scorecard,
  avgScore,
  onScoreChange,
  noteText,
  onNoteChange,
  onSaveNotes,
}: {
  scorecard: Scorecard
  avgScore: string
  onScoreChange: (k: keyof Omit<Scorecard, 'notes'>, v: number) => void
  noteText: string
  onNoteChange: (v: string) => void
  onSaveNotes: () => void
}) {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-[#555555] uppercase">
          Scorecard
        </span>
        <span className="text-lg font-bold text-[#8d1600]">
          {avgScore}
          <span className="text-xs font-normal text-[#767676]">/5</span>
        </span>
      </div>

      {SCORE_LABELS.map(({ key, label }) => (
        <div key={key}>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium text-[#1b1b1b]">{label}</span>
            <span className="text-sm font-bold text-[#8d1600]">{scorecard[key] || '—'}</span>
          </div>
          <RatingGroup
            value={scorecard[key]}
            onValueChange={(v) => onScoreChange(key, v as unknown as number)}
            count={5}
          >
            <RatingGroup.Control className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <RatingGroup.Item
                  key={i}
                  index={i}
                  className="flex h-8 flex-1 cursor-pointer items-center justify-center rounded-xl bg-[#f9f9f9] text-[#c0c0c0] transition-colors duration-150 data-[highlighted]:bg-[#8d1600] data-[highlighted]:text-white"
                >
                  <Star size={13} />
                </RatingGroup.Item>
              ))}
            </RatingGroup.Control>
            <RatingGroup.HiddenInput />
          </RatingGroup>
        </div>
      ))}

      <div>
        <p className="mb-2 text-xs font-semibold tracking-widest text-[#555555] uppercase">Notes</p>
        {scorecard.notes && (
          <p className="mb-2 rounded-2xl bg-[#f9f9f9] p-3 text-sm text-[#555555]">
            {scorecard.notes}
          </p>
        )}
        <textarea
          value={noteText}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full resize-none rounded-2xl border border-[#e8e8e8] p-3 text-sm text-[#1b1b1b] placeholder-[#767676] transition-colors focus:border-[#1b1b1b] focus:outline-none"
        />
        {noteText && (
          <button
            onClick={onSaveNotes}
            className="mt-2 h-8 cursor-pointer rounded-full bg-[#8d1600] px-4 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#7a1200]"
          >
            Save note
          </button>
        )}
      </div>
    </div>
  )
}

function TimelineTab({ activities, applicant }: { activities: Activity[]; applicant: Applicant }) {
  const all = [
    {
      id: 'submit',
      timestamp: applicant.submittedAt,
      action: 'Application submitted',
      detail: `Applied for ${applicant.position1}`,
      user: applicant.name,
    },
    ...activities,
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="p-4">
      <p className="mb-4 text-xs font-semibold tracking-widest text-[#555555] uppercase">
        Activity Timeline
      </p>
      <div className="relative">
        <div className="absolute top-0 bottom-0 left-3 w-px bg-[#f0f0f0]" />
        <div className="space-y-4">
          {all.map((act, i) => (
            <div key={act.id ?? i} className="relative flex gap-3">
              <div className="z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#e8e8e8] bg-white">
                <div className="h-2 w-2 rounded-full bg-[#8d1600]" />
              </div>
              <div className="min-w-0 pb-1">
                <p className="text-sm font-medium text-[#1b1b1b]">{act.action}</p>
                {act.detail && <p className="mt-0.5 text-xs text-[#767676]">{act.detail}</p>}
                <p className="mt-1 text-[10px] text-[#767676]">
                  {new Date(act.timestamp).toLocaleString('vi-VN')} · {act.user}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold tracking-widest text-[#555555] uppercase">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex-shrink-0 text-[#767676]">{icon}</span>
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="w-20 flex-shrink-0 text-[11px] text-[#767676]">{label}</span>
        <span className="truncate text-sm text-[#1b1b1b]">{value}</span>
      </div>
    </div>
  )
}
