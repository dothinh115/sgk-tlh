import type { SeasonGuidePayload, SeasonGuideSettings, SeasonSummary, SeasonTeam } from '../../shared/types/season-guide'

interface SeasonApiResponse {
  ok: boolean
  mode: string
  spreadsheetId: string
  updatedAt?: string
  settings?: Record<string, unknown>
  season?: Record<string, string>
  seasons?: Array<Record<string, string>>
  teams?: Array<Record<string, unknown>>
  message?: string
}

export default defineEventHandler(async (event): Promise<SeasonGuidePayload> => {
  const config = useRuntimeConfig()
  const source = config.seasonGuideSource as string
  const query = getQuery(event)
  const requestedSeason = clean(query.season)
  const seasonsResponse = await $fetch<SeasonApiResponse>(appendQuery(source, {
    mode: 'seasons'
  })).catch(() => null)

  if (!seasonsResponse) {
    return updatingPayload()
  }

  if (!seasonsResponse.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: seasonsResponse.message || 'Không đọc được dữ liệu mùa từ Google Sheets API.'
    })
  }

  const settings = normalizeSettings(seasonsResponse.settings ?? {})
  const seasons = (seasonsResponse.seasons ?? [])
    .map(normalizeSeason)
    .filter(season => season.slug)

  if (seasonsResponse.mode === 'season') {
    return normalizeSeasonPayload(seasonsResponse, settings, seasons)
  }

  const selectedSeasonSlug = requestedSeason || settings.defaultSeasonSlug || seasons[0]?.slug

  if (!selectedSeasonSlug) {
    return updatingPayload(seasonsResponse)
  }

  const seasonResponse = await $fetch<SeasonApiResponse>(appendQuery(source, {
    season: selectedSeasonSlug
  })).catch(() => null)

  if (!seasonResponse?.ok) {
    return updatingPayload(seasonsResponse)
  }

  return normalizeSeasonPayload(seasonResponse, settings, seasons)
})

function normalizeSeasonPayload(response: SeasonApiResponse, settings: SeasonGuideSettings, seasons: SeasonSummary[]): SeasonGuidePayload {
  const activeSeason = response.season ? normalizeSeason(response.season) : seasons.find(season => season.slug === settings.defaultSeasonSlug)

  return {
    ok: true,
    updatedAt: response.updatedAt ?? new Date().toISOString(),
    spreadsheetId: response.spreadsheetId,
    settings,
    seasons,
    activeSeasonSlug: activeSeason?.slug ?? settings.defaultSeasonSlug,
    teams: normalizeTeams(response.teams ?? []),
    stats: []
  }
}

function updatingPayload(response?: SeasonApiResponse): SeasonGuidePayload {
  return {
    ok: true,
    updatedAt: response?.updatedAt ?? new Date().toISOString(),
    spreadsheetId: response?.spreadsheetId ?? '',
    settings: {
      ...defaultSettings(),
      updating: true
    },
    seasons: [],
    activeSeasonSlug: '',
    teams: [],
    stats: []
  }
}

function normalizeSettings(raw: Record<string, unknown>): SeasonGuideSettings {
  const fallback = defaultSettings()

  return {
    updating: toBoolean(raw.updating),
    updatingTitle: clean(raw.updatingTitle) || fallback.updatingTitle,
    updatingMessage: clean(raw.updatingMessage) || fallback.updatingMessage,
    notice: clean(raw.notice),
    defaultSeasonSlug: clean(raw.defaultSeasonSlug),
    apiVersion: toNumber(raw.apiVersion),
    lastUpdated: clean(raw.lastUpdated)
  }
}

function defaultSettings(): SeasonGuideSettings {
  return {
    updating: false,
    updatingTitle: 'Dữ liệu đang được cập nhật',
    updatingMessage: 'Thăng Long Hội đang chỉnh lại dữ liệu mùa. Một số nội dung có thể thay đổi trong ít phút tới.',
    notice: '',
    defaultSeasonSlug: '',
    apiVersion: null,
    lastUpdated: ''
  }
}

function normalizeSeason(raw: Record<string, string>): SeasonSummary {
  return {
    slug: clean(raw.slug),
    prefix: clean(raw.prefix),
    name: clean(raw.name),
    title: clean(raw.title),
    status: clean(raw.status)
  }
}

function normalizeTeams(rows: Array<Record<string, unknown>>): SeasonTeam[] {
  return rows
    .map((row, index) => ({
      slug: clean(row.slug),
      detailSheet: clean(row.detailSheet),
      rank: toNumber(row.rank) ?? index + 1,
      group: '',
      dataType: '',
      name: clean(row.name),
      chineseNames: clean(row.chineseNames),
      tier: clean(row.tier),
      factions: normalizeFactions(row),
      troopTypes: normalizeTroopTypes(row),
      tags: splitList(pick(row, ['tags', 'thẻ', 'the'])),
      mentor: clean(row.mentor),
      sourceLevel: '',
      threadMentions: null,
      commentMentions: null,
      supportPercent: null,
      neutralPercent: null,
      objectionPercent: null,
      usesDoyu: '',
      reliability: '',
      variants: [],
      alternatives: [],
      analysis: '',
      analysisItems: splitList(pick(row, ['analysisItems', 'phân tích', 'phan tich'])),
      objections: '',
      objectionItems: splitList(pick(row, ['objectionItems', 'phản biện', 'phan bien'])),
      authorNotes: '',
      notes: clean(row.note),
      sourceStatus: '',
      builds: normalizeBuilds(row.builds),
      lineup: normalizeLineup(row.lineup)
    }))
    .filter(team => team.name)
    .sort((a, b) => a.rank - b.rank)
}

function normalizeBuilds(value: unknown) {
  return Array.isArray(value)
    ? value.map((row) => {
        const item = record(row)

        return {
          id: clean(item.id),
          name: clean(item.name),
          status: clean(item.status),
          idea: clean(item.idea),
          source: clean(item.source)
        }
      }).filter(row => row.id || row.name)
    : []
}

function normalizeLineup(value: unknown) {
  return Array.isArray(value)
    ? value.map((row) => {
        const item = record(row)

        return {
          buildId: clean(item.buildId),
          buildName: clean(item.buildName),
          general: clean(item.general),
          tactic1: clean(item.tactic1),
          tactic2: clean(item.tactic2),
          battleBook: clean(item.battleBook),
          attribute: clean(item.attribute),
          role: clean(item.role),
          note: clean(item.note),
          source: clean(item.source)
        }
      }).filter(row => row.buildId || row.general || row.tactic1 || row.tactic2)
    : []
}

function normalizeFactions(row: Record<string, unknown>) {
  const explicit = splitList(pick(row, ['factions', 'phe', 'quốc gia', 'quoc gia']))
    .map(normalizeFaction)
    .filter(Boolean)

  return unique(explicit)
}

function normalizeTroopTypes(row: Record<string, unknown>) {
  const explicit = splitList(pick(row, ['troopTypes', 'binh chủng', 'binh chung']))
    .map(normalizeTroopType)
    .filter(Boolean)

  return unique(explicit)
}

function normalizeFaction(value: string) {
  const key = searchKey(value)

  if (key === 'thuc') return 'Thục'
  if (key === 'ngo') return 'Ngô'
  if (key === 'nguy') return 'Ngụy'
  if (key === 'quan') return 'Quần'
  if (key === 'khac') return 'Khác'

  return ''
}

function normalizeTroopType(value: string) {
  const key = searchKey(value)

  if (['ky', 'ki'].includes(key)) return 'Kỵ'
  if (key === 'cung') return 'Cung'
  if (key === 'thuong') return 'Thương'
  if (['khien', 'thuan'].includes(key)) return 'Khiên'
  if (['khi gioi', 'xe'].includes(key)) return 'Xe'

  return ''
}

function splitList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(splitList)
  }

  return clean(value)
    .split(/\n|,|;|\/|\|/g)
    .map(item => item.trim())
    .filter(Boolean)
}

function pick(row: Record<string, unknown>, keys: string[]) {
  const normalized = new Map(Object.keys(row).map(key => [searchKey(key), row[key]]))

  for (const key of keys) {
    const value = normalized.get(searchKey(key))

    if (clean(value)) {
      return value
    }
  }

  return ''
}

function unique(values: string[]) {
  return [...new Set(values)]
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function clean(value: unknown): string {
  return String(value ?? '').trim()
}

function toNumber(value: unknown): number | null {
  const text = clean(value)

  if (!text) {
    return null
  }

  const numeric = Number(text.replace('%', '').replace(',', '.'))

  return Number.isFinite(numeric) ? numeric : null
}

function toBoolean(value: unknown): boolean {
  const text = clean(value).toLowerCase()

  return ['true', '1', 'yes', 'y', 'on', 'đúng', 'bat', 'bật'].includes(text)
}

function searchKey(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function appendQuery(source: string, params: Record<string, string>): string {
  const url = new URL(source)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  return url.toString()
}
