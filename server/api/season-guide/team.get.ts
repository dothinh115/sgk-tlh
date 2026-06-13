import type { SeasonTeam, SeasonTeamDetail, SeasonTeamDetailPayload } from '../../../shared/types/season-guide'

interface TeamApiResponse {
  ok: boolean
  spreadsheetId: string
  updatedAt?: string
  team?: Record<string, string>
  detail?: {
    summary?: Record<string, string>
    variants?: Array<Record<string, string>>
    alternatives?: string[]
    analysis?: Array<Record<string, string>>
    authorNotes?: string[]
  }
  message?: string
}

export default defineEventHandler(async (event): Promise<SeasonTeamDetailPayload> => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const season = clean(query.season)
  const team = clean(query.team)

  if (!season || !team) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Thiếu season hoặc team.'
    })
  }

  const source = appendQuery(config.seasonGuideSource as string, { season, team })
  const response = await $fetch<TeamApiResponse>(source)

  if (!response.ok || !response.team) {
    throw createError({
      statusCode: 502,
      statusMessage: response.message || 'Không đọc được chi tiết đội hình.'
    })
  }

  return {
    ok: true,
    updatedAt: response.updatedAt ?? new Date().toISOString(),
    spreadsheetId: response.spreadsheetId,
    team: normalizeTeam(response.team),
    detail: normalizeDetail(response.detail)
  }
})

function normalizeTeam(row: Record<string, string>): SeasonTeam {
  return {
    slug: clean(row.slug),
    detailSheet: clean(row.detailSheet),
    rank: toNumber(row.rank) ?? 0,
    group: clean(row.group),
    dataType: clean(row.dataType),
    name: clean(row.name),
    chineseNames: clean(row.chineseNames),
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
    notes: clean(row.tags),
    sourceStatus: ''
  }
}

function normalizeDetail(detail: TeamApiResponse['detail']): SeasonTeamDetail {
  return {
    summary: detail?.summary ?? {},
    variants: (detail?.variants ?? []).map(row => ({
      title: clean(row.title),
      value: clean(row.value),
      note: clean(row.note)
    })).filter(row => row.title || row.value || row.note),
    alternatives: (detail?.alternatives ?? []).map(clean).filter(Boolean),
    analysis: (detail?.analysis ?? []).map(row => ({
      title: clean(row.title),
      value: clean(row.value)
    })).filter(row => row.title || row.value),
    authorNotes: (detail?.authorNotes ?? []).map(clean).filter(Boolean)
  }
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

function appendQuery(source: string, params: Record<string, string>): string {
  const url = new URL(source)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  return url.toString()
}
