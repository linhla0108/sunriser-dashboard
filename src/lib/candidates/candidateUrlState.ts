import type { ReadonlyURLSearchParams } from "next/navigation"
import type { V2View } from "@/lib/views/useViewState"

export const CANDIDATE_VIEW_KEYS = ["table", "pipeline", "chart"] as const
export const CANDIDATE_RESULT_KEYS = ["Passed", "Failed", "Waiting list"] as const
export const CANDIDATE_PIPELINE_GROUP_KEYS = ["round1", "round2", "position", "batch"] as const
export const CANDIDATE_SORT_KEYS = ["name", "position", "university", "gpa", "year", "batch", "pic", "round1", "round2"] as const
export const CANDIDATE_SORT_DIRS = ["asc", "desc"] as const
export const CANDIDATE_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 80, 100] as const
export type CandidatePageSize = (typeof CANDIDATE_PAGE_SIZE_OPTIONS)[number]
export const DEFAULT_CANDIDATE_PAGE_SIZE: CandidatePageSize = 20

export type CandidateView = (typeof CANDIDATE_VIEW_KEYS)[number]
export type CandidatePipelineGroup = (typeof CANDIDATE_PIPELINE_GROUP_KEYS)[number]
export type CandidateSortKey = (typeof CANDIDATE_SORT_KEYS)[number]
export type CandidateSortDir = (typeof CANDIDATE_SORT_DIRS)[number]
export type CandidateSortState = { key: CandidateSortKey; dir: CandidateSortDir } | null

export interface CandidateUrlState {
  search: string
  position: string
  batch: string
  result: string
  view: CandidateView
  page: number
  pageSize: CandidatePageSize
  sort: CandidateSortState
  group: CandidatePipelineGroup
}

export const DEFAULT_CANDIDATE_URL_STATE: CandidateUrlState = {
  search: "",
  position: "",
  batch: "",
  result: "",
  view: "table",
  page: 1,
  pageSize: DEFAULT_CANDIDATE_PAGE_SIZE,
  sort: { key: "name", dir: "asc" },
  group: "round1",
}

function isOneOf<T extends readonly string[]>(value: string | null, options: T): value is T[number] {
  return !!value && options.includes(value)
}

function parsePage(value: string | null) {
  if (!value) return DEFAULT_CANDIDATE_URL_STATE.page
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : DEFAULT_CANDIDATE_URL_STATE.page
}

function parsePageSize(value: string | null): CandidatePageSize {
  if (!value) return DEFAULT_CANDIDATE_URL_STATE.pageSize
  const size = Number(value)
  return (CANDIDATE_PAGE_SIZE_OPTIONS as readonly number[]).includes(size) ? (size as CandidatePageSize) : DEFAULT_CANDIDATE_URL_STATE.pageSize
}

export function parseCandidateSort(value: string | null): CandidateSortState {
  if (!value) return DEFAULT_CANDIDATE_URL_STATE.sort
  if (value === "none") return null
  const [key, dir] = value.split(".")
  if (isOneOf(key, CANDIDATE_SORT_KEYS) && isOneOf(dir, CANDIDATE_SORT_DIRS)) {
    return { key, dir }
  }
  return DEFAULT_CANDIDATE_URL_STATE.sort
}

export function formatCandidateSort(sort: CandidateSortState) {
  return sort ? `${sort.key}.${sort.dir}` : "none"
}

export function parseCandidateUrlState(params: ReadonlyURLSearchParams | URLSearchParams): CandidateUrlState {
  const view = params.get("view")
  const result = params.get("result")
  const group = params.get("group")

  return {
    search: params.get("search") ?? "",
    position: params.get("position") ?? "",
    batch: params.get("batch") ?? "",
    result: isOneOf(result, CANDIDATE_RESULT_KEYS) ? result : "",
    view: isOneOf(view, CANDIDATE_VIEW_KEYS) ? (view as V2View) : DEFAULT_CANDIDATE_URL_STATE.view,
    page: parsePage(params.get("page")),
    pageSize: parsePageSize(params.get("pageSize")),
    sort: parseCandidateSort(params.get("sort")),
    group: isOneOf(group, CANDIDATE_PIPELINE_GROUP_KEYS) ? group : DEFAULT_CANDIDATE_URL_STATE.group,
  }
}

export function writeCandidateUrlState(params: URLSearchParams, patch: Partial<CandidateUrlState>) {
  const next = { ...parseCandidateUrlState(params), ...patch }

  setParam(params, "search", next.search, DEFAULT_CANDIDATE_URL_STATE.search)
  setParam(params, "position", next.position, DEFAULT_CANDIDATE_URL_STATE.position)
  setParam(params, "batch", next.batch, DEFAULT_CANDIDATE_URL_STATE.batch)
  setParam(params, "result", next.result, DEFAULT_CANDIDATE_URL_STATE.result)
  setParam(params, "view", next.view, DEFAULT_CANDIDATE_URL_STATE.view)
  setParam(params, "page", String(next.page), String(DEFAULT_CANDIDATE_URL_STATE.page))
  setParam(params, "pageSize", String(next.pageSize), String(DEFAULT_CANDIDATE_URL_STATE.pageSize))
  setParam(params, "sort", formatCandidateSort(next.sort), formatCandidateSort(DEFAULT_CANDIDATE_URL_STATE.sort))
  setParam(params, "group", next.group, DEFAULT_CANDIDATE_URL_STATE.group)

  return params
}

function setParam(params: URLSearchParams, key: string, value: string, defaultValue: string) {
  const normalized = value.trim()
  if (!normalized || normalized === defaultValue) {
    params.delete(key)
  } else {
    params.set(key, normalized)
  }
}
