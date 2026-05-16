export const POS_COLORS: Record<string, { bg: string; text: string; light: string }> = {
  'AI Engineering Intern': { bg: '#55DB9C', text: '#1b1b1b', light: '#e6faf2' },
  'Data Analysis Intern': { bg: '#F76969', text: '#fff', light: '#fef0f0' },
  'Game Design Intern': { bg: '#7B69FB', text: '#fff', light: '#f0eeff' },
  'Unity Development Intern': { bg: '#4BA2FF', text: '#fff', light: '#eef5ff' },
  'Game User Acquisition Intern': { bg: '#E9CBFF', text: '#1b1b1b', light: '#f7f0ff' },
  'Human Resources Intern': { bg: '#FF8AB7', text: '#1b1b1b', light: '#fff0f6' },
  'Game Quality Assurance Intern': { bg: '#F9D529', text: '#1b1b1b', light: '#fffbe8' },
}

export const POS_SHORT: Record<string, string> = {
  'AI Engineering Intern': 'AI Eng',
  'Data Analysis Intern': 'Data',
  'Game Design Intern': 'Game Design',
  'Unity Development Intern': 'Unity',
  'Game User Acquisition Intern': 'Game UA',
  'Human Resources Intern': 'HR',
  'Game Quality Assurance Intern': 'Game QA',
}

export const ALL_POSITIONS = Object.keys(POS_COLORS)

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function getPosColor(pos: string) {
  return POS_COLORS[pos] ?? { bg: '#e5e5e5', text: '#555555', light: '#f5f5f5' }
}

export function getPosShort(pos: string) {
  return POS_SHORT[pos] ?? pos
}

export const ROUND1_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  Passed: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  Failed: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  'Waiting list': { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function generateActivityId(): string {
  return crypto.randomUUID()
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
