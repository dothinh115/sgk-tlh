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
      group: clean(row.group),
      dataType: clean(row.dataType),
      name: clean(row.name),
      chineseNames: clean(row.chineseNames),
      tier: clean(row.tier),
      mentor: clean(row.mentor),
      sourceLevel: '',
      threadMentions: toNumber(row.threadMentions),
      commentMentions: toNumber(row.commentMentions),
      supportPercent: toNumber(row.supportPercent),
      neutralPercent: toNumber(row.neutralPercent),
      objectionPercent: toNumber(row.objectionPercent),
      usesDoyu: clean(row.usesDoyu),
      reliability: clean(row.reliability),
      variants: [],
      alternatives: [],
      analysis: '',
      objections: '',
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

function appendQuery(source: string, params: Record<string, string>): string {
  const url = new URL(source)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  return url.toString()
}
