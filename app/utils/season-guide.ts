import type { SeasonTeam } from '../../shared/types/season-guide'

export function teamId(team: SeasonTeam) {
  return `doi-${team.rank}-${team.name}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function badgeColor(value: string) {
  if (value === 'cao') {
    return 'success'
  }

  if (value === 'trung bình') {
    return 'warning'
  }

  return 'neutral'
}

export function percentText(value: number | null) {
  return value === null ? 'Chưa đủ dữ liệu' : `${value}%`
}

export function paragraphs(text: string) {
  return text.split(/\n+/).map(item => item.trim()).filter(Boolean)
}
