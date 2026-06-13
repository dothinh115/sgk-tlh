import type { SeasonTeam, SeasonTeamDetail, SeasonTeamDetailPayload } from '../../../shared/types/season-guide'

interface TeamApiResponse {
  ok: boolean
  spreadsheetId: string
  updatedAt?: string
  team?: Record<string, string>
  detail?: {
    summary?: Record<string, string>
    builds?: Array<Record<string, string>>
    lineup?: Array<Record<string, string>>
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
    builds: [],
    lineup: []
  }
}

function normalizeDetail(detail: TeamApiResponse['detail']): SeasonTeamDetail {
  return {
    summary: detail?.summary ?? {},
    builds: (detail?.builds ?? []).map(row => ({
      id: clean(row.id),
      name: clean(row.name),
      status: clean(row.status),
      idea: clean(row.idea),
      source: clean(row.source)
    })).filter(row => row.id || row.name),
    lineup: (detail?.lineup ?? []).map(row => ({
      buildId: clean(row.buildId),
      buildName: clean(row.buildName),
      general: clean(row.general),
      tactic1: clean(row.tactic1),
      tactic2: clean(row.tactic2),
      battleBook: clean(row.battleBook),
      attribute: clean(row.attribute),
      role: clean(row.role),
      note: clean(row.note),
      source: clean(row.source)
    })).filter(row => row.buildId || row.general || row.tactic1 || row.tactic2),
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
