'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { mockApplicants } from '@/lib/mockData'
import { Applicant } from '@/lib/types'
import { LabView, Scorecard, Activity, SavedView, FilterCondition } from './lab-types'
import LabHeader from './components/LabHeader'
import QuickFilters from './components/QuickFilters'
import FunnelStats from './components/FunnelStats'
import LabTableView from './components/LabTableView'
import KanbanView from './components/KanbanView'
import GalleryView from './components/GalleryView'
import ApplicantDrawer from './components/ApplicantDrawer'
import BulkToolbar from './components/BulkToolbar'
import CommandPalette from './components/CommandPalette'
import ExportModal from './components/ExportModal'
import FilterBuilder from './components/FilterBuilder'
import SavedViewsPopover from './components/SavedViewsPopover'
import ComparePanel from './components/ComparePanel'
import FloatingPillNav from './components/FloatingPillNav'

export default function LabPage() {
  // ── View & search ─────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<LabView>('table')
  const [search, setSearch] = useState('')

  // ── Quick filters ─────────────────────────────────────────────────────────
  const [positionFilter, setPositionFilter] = useState('')
  const [batchFilter, setBatchFilter] = useState('')
  const [round1Filter, setRound1Filter] = useState('')

  // ── Advanced filter conditions (Feature 12) ───────────────────────────────
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([])

  // ── Applicants (local mutable copy) ──────────────────────────────────────
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants)

  // ── Selection for bulk actions (Feature 4) ───────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // ── Applicant detail drawer (Feature 5) ──────────────────────────────────
  const [detailApplicant, setDetailApplicant] = useState<Applicant | null>(null)

  // ── Scorecards (Feature 9) ────────────────────────────────────────────────
  const [scorecards, setScorecards] = useState<Record<string, Scorecard>>({})

  // ── Activity timeline (Feature 14) ───────────────────────────────────────
  const [activities, setActivities] = useState<Record<string, Activity[]>>({})

  // ── Compare mode (Feature 15) ─────────────────────────────────────────────
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)

  // ── Panels/modals ─────────────────────────────────────────────────────────
  const [cmdOpen, setCmdOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [filterBuilderOpen, setFilterBuilderOpen] = useState(false)
  const [savedViewsOpen, setSavedViewsOpen] = useState(false)
  const [savedViews, setSavedViews] = useState<SavedView[]>([])

  const saveViewWrapperRef = useRef<HTMLDivElement>(null)

  // ── Keyboard shortcut: Cmd+K (Feature 13) ────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Filtering (Features 3, 12) ────────────────────────────────────────────
  const filteredApplicants = useMemo(() => {
    let list = applicants

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.university.toLowerCase().includes(q)
      )
    }
    if (positionFilter) list = list.filter((a) => a.position1 === positionFilter)
    if (batchFilter) list = list.filter((a) => String(a.batch) === batchFilter)
    if (round1Filter) list = list.filter((a) => a.round1Result === round1Filter)

    // Advanced conditions (Feature 12)
    for (const cond of filterConditions) {
      list = list.filter((a) => {
        const rawVal = a[cond.field as keyof Applicant]
        const val = String(rawVal ?? '').toLowerCase()
        const cv = cond.value.toLowerCase()
        if (cond.operator === 'contains') return val.includes(cv)
        if (cond.operator === 'equals') return val === cv
        const num = parseFloat(val)
        const cv2 = parseFloat(cv)
        if (isNaN(num) || isNaN(cv2)) return true
        if (cond.operator === 'gt') return num > cv2
        if (cond.operator === 'lt') return num < cv2
        if (cond.operator === 'gte') return num >= cv2
        if (cond.operator === 'lte') return num <= cv2
        return true
      })
    }

    return list
  }, [applicants, search, positionFilter, batchFilter, round1Filter, filterConditions])

  const filterCount =
    [positionFilter, batchFilter, round1Filter].filter(Boolean).length + filterConditions.length

  // ── Bulk helpers ──────────────────────────────────────────────────────────
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredApplicants.map((a) => a.id)))
  }, [filteredApplicants])

  const handleClearSelection = useCallback(() => setSelectedIds(new Set()), [])

  // ── Round 1 update ────────────────────────────────────────────────────────
  const handleUpdateRound1 = useCallback(
    (id: string, result: 'Passed' | 'Failed' | 'Waiting list' | undefined) => {
      setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, round1Result: result } : a)))
      setActivities((prev) => ({
        ...prev,
        [id]: [
          ...(prev[id] ?? []),
          {
            id: Math.random().toString(36).slice(2),
            timestamp: new Date().toISOString(),
            action: result ? `Round 1 set to "${result}"` : 'Round 1 result cleared',
            user: 'You',
          },
        ],
      }))
      // Update detailApplicant if open
      setDetailApplicant((prev) => (prev?.id === id ? { ...prev, round1Result: result } : prev))
    },
    []
  )

  // ── Notes update ──────────────────────────────────────────────────────────
  const handleUpdateNotes = useCallback((id: string, notes: string) => {
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, round1Notes: notes } : a)))
  }, [])

  // ── Bulk actions ──────────────────────────────────────────────────────────
  const handleBulkRound1 = useCallback(
    (result: 'Passed' | 'Failed' | 'Waiting list') => {
      setApplicants((prev) =>
        prev.map((a) => (selectedIds.has(a.id) ? { ...a, round1Result: result } : a))
      )
      setSelectedIds(new Set())
    },
    [selectedIds]
  )

  const handleBulkAssignPic = useCallback(
    (pic: string) => {
      setApplicants((prev) => prev.map((a) => (selectedIds.has(a.id) ? { ...a, pic } : a)))
      setSelectedIds(new Set())
    },
    [selectedIds]
  )

  const handleExportSelected = useCallback(() => {
    const toExport = applicants.filter((a) => selectedIds.has(a.id))
    const header = 'Name,Email,Position,University,GPA,Batch,Round1'
    const body = toExport
      .map(
        (a) =>
          `${a.name},${a.email},${a.position1},${a.university},${a.gpa},${a.batch},${a.round1Result ?? ''}`
      )
      .join('\n')
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const el = document.createElement('a')
    el.href = url
    el.download = `sunriser-selected-${Date.now()}.csv`
    el.click()
    URL.revokeObjectURL(url)
    setSelectedIds(new Set())
  }, [applicants, selectedIds])

  // ── Scorecard update ──────────────────────────────────────────────────────
  const handleUpdateScorecard = useCallback((id: string, sc: Scorecard) => {
    setScorecards((prev) => ({ ...prev, [id]: sc }))
  }, [])

  // ── Activity update ───────────────────────────────────────────────────────
  const handleAddActivity = useCallback((id: string, act: Omit<Activity, 'id'>) => {
    setActivities((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), { ...act, id: Math.random().toString(36).slice(2) }],
    }))
  }, [])

  // ── Compare ───────────────────────────────────────────────────────────────
  const handleToggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) return prev
      const next = [...prev, id]
      if (next.length >= 2) setCompareOpen(true)
      return next
    })
  }, [])

  // ── Saved views (Feature 11) ──────────────────────────────────────────────
  const handleSaveCurrentView = useCallback(
    (name: string) => {
      const sv: SavedView = {
        id: Math.random().toString(36).slice(2),
        name,
        view: activeView,
        search,
        position: positionFilter,
        batch: batchFilter,
        round1: round1Filter,
        createdAt: new Date().toISOString(),
      }
      setSavedViews((prev) => [...prev, sv])
    },
    [activeView, search, positionFilter, batchFilter, round1Filter]
  )

  const handleLoadSavedView = useCallback((sv: SavedView) => {
    setActiveView(sv.view)
    setSearch(sv.search)
    setPositionFilter(sv.position)
    setBatchFilter(sv.batch)
    setRound1Filter(sv.round1)
  }, [])

  const handleDeleteSavedView = useCallback((id: string) => {
    setSavedViews((prev) => prev.filter((v) => v.id !== id))
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearch('')
    setPositionFilter('')
    setBatchFilter('')
    setRound1Filter('')
    setFilterConditions([])
  }, [])

  return (
    <div className="min-h-screen bg-[#FCFCFC]">
      <div className="mx-auto max-w-screen-2xl p-3 pb-24 sm:p-4 lg:p-6">
        {/* Header (Features 3, 11, 10, 13) */}
        <div className="relative">
          <LabHeader
            activeView={activeView}
            onViewChange={setActiveView}
            search={search}
            onSearch={setSearch}
            filterCount={filterCount}
            selectedCount={selectedIds.size}
            onCmdOpen={() => setCmdOpen(true)}
            onExport={() => setExportOpen(true)}
            onSaveView={() => setSavedViewsOpen((v) => !v)}
            onFilterBuilder={() => setFilterBuilderOpen(true)}
            totalFiltered={filteredApplicants.length}
            totalAll={applicants.length}
          />
          {/* Saved views popover (Feature 11) */}
          <div ref={saveViewWrapperRef} className="absolute top-0 right-0">
            <SavedViewsPopover
              open={savedViewsOpen}
              onClose={() => setSavedViewsOpen(false)}
              savedViews={savedViews}
              onLoad={handleLoadSavedView}
              onDelete={handleDeleteSavedView}
              onSaveCurrent={handleSaveCurrentView}
              anchorRef={saveViewWrapperRef}
            />
          </div>
        </div>

        {/* Quick filter chips (Feature 3) */}
        <QuickFilters
          position={positionFilter}
          batch={batchFilter}
          round1={round1Filter}
          onPosition={setPositionFilter}
          onBatch={setBatchFilter}
          onRound1={setRound1Filter}
          extraConditions={filterConditions}
          onRemoveCondition={(id) => setFilterConditions((prev) => prev.filter((c) => c.id !== id))}
        />

        {/* Funnel stats (Feature 7) */}
        <FunnelStats applicants={filteredApplicants} />

        {/* Main view */}
        {activeView === 'table' && (
          <LabTableView
            applicants={filteredApplicants}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearSelection}
            onOpenDetail={setDetailApplicant}
            onUpdateRound1={handleUpdateRound1}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
          />
        )}
        {activeView === 'kanban' && (
          <KanbanView
            applicants={filteredApplicants}
            onOpenDetail={setDetailApplicant}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
          />
        )}
        {activeView === 'gallery' && (
          <GalleryView
            applicants={filteredApplicants}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onOpenDetail={setDetailApplicant}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
          />
        )}
      </div>

      {/* Applicant detail drawer (Features 5, 9, 14) */}
      <ApplicantDrawer
        applicant={detailApplicant}
        onClose={() => setDetailApplicant(null)}
        scorecard={detailApplicant ? scorecards[detailApplicant.id] : undefined}
        onUpdateScorecard={handleUpdateScorecard}
        activities={detailApplicant ? (activities[detailApplicant.id] ?? []) : []}
        onAddActivity={handleAddActivity}
        isInCompare={detailApplicant ? compareIds.includes(detailApplicant.id) : false}
        onToggleCompare={handleToggleCompare}
        onUpdateRound1={handleUpdateRound1}
        onUpdateNotes={handleUpdateNotes}
      />

      {/* Bulk toolbar (Feature 4) */}
      <BulkToolbar
        selectedCount={selectedIds.size}
        onClear={handleClearSelection}
        onSetRound1={handleBulkRound1}
        onAssignPic={handleBulkAssignPic}
        onExportSelected={handleExportSelected}
      />

      {/* Command palette (Feature 13) */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        applicants={applicants}
        onViewChange={setActiveView}
        onExport={() => setExportOpen(true)}
        onFilterBuilder={() => setFilterBuilderOpen(true)}
        onOpenDetail={setDetailApplicant}
        onClearFilters={handleClearFilters}
      />

      {/* Export modal (Feature 10) */}
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        applicants={filteredApplicants}
        totalAll={applicants.length}
      />

      {/* Filter builder (Feature 12) */}
      <FilterBuilder
        open={filterBuilderOpen}
        conditions={filterConditions}
        onClose={() => setFilterBuilderOpen(false)}
        onApply={setFilterConditions}
      />

      {/* Floating pill nav (Dimension reference) */}
      <FloatingPillNav />

      {/* Compare panel (Feature 15) */}
      {compareOpen && (
        <ComparePanel
          compareIds={compareIds}
          applicants={applicants}
          onClose={() => setCompareOpen(false)}
          onRemove={(id) => {
            setCompareIds((prev) => {
              const next = prev.filter((x) => x !== id)
              if (next.length < 2) setCompareOpen(false)
              return next
            })
          }}
          onOpenDetail={setDetailApplicant}
        />
      )}
    </div>
  )
}
