import type { ReadonlyURLSearchParams } from "next/navigation"

export const SCHEDULE_VIEW_KEYS = ["gantt", "agenda"] as const

export type ScheduleView = (typeof SCHEDULE_VIEW_KEYS)[number]

export interface ScheduleUrlState {
  view: ScheduleView
  batch: string[]
  search: string
  anchor: string
}

export const DEFAULT_SCHEDULE_URL_STATE: ScheduleUrlState = {
  view: "gantt",
  batch: [],
  search: "",
  anchor: "",
}

function isView(value: string | null): value is ScheduleView {
  return !!value && (SCHEDULE_VIEW_KEYS as readonly string[]).includes(value)
}

function parseBatch(value: string | null): string[] {
  if (!value) return []
  return value
    .split(",")
    .map(part => part.trim())
    .filter(part => part.length > 0)
}

export function parseScheduleUrlState(params: ReadonlyURLSearchParams | URLSearchParams): ScheduleUrlState {
  const view = params.get("view")
  return {
    view: isView(view) ? view : DEFAULT_SCHEDULE_URL_STATE.view,
    batch: parseBatch(params.get("batch")),
    search: params.get("search") ?? "",
    anchor: params.get("anchor") ?? "",
  }
}

export function writeScheduleUrlState(params: URLSearchParams, patch: Partial<ScheduleUrlState>) {
  const next = { ...parseScheduleUrlState(params), ...patch }

  setParam(params, "view", next.view, DEFAULT_SCHEDULE_URL_STATE.view)
  setParam(params, "batch", next.batch.join(","), "")
  setParam(params, "search", next.search.trim(), DEFAULT_SCHEDULE_URL_STATE.search)
  setParam(params, "anchor", next.anchor.trim(), DEFAULT_SCHEDULE_URL_STATE.anchor)

  return params
}

function setParam(params: URLSearchParams, key: string, value: string, defaultValue: string) {
  if (!value || value === defaultValue) {
    params.delete(key)
  } else {
    params.set(key, value)
  }
}
