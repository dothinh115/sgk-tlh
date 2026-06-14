import type {
  KhaiHoangChamSuRow,
  KhaiHoangDoiHinhRow,
  KhaiHoangItem,
  KhaiHoangMenu,
  KhaiHoangPayload,
  SeasonGuideSettings,
  SeasonSummary
} from '../../shared/types/season-guide'

interface KhaiHoangApiResponse {
  ok: boolean
  mode: string
  kind: string
  spreadsheetId: string
  updatedAt?: string
  settings?: Record<string, unknown>
  seasons?: Array<Record<string, string>>
  menu?: Record<string, string>
  items?: Array<Record<string, unknown>>
  message?: string
}

export default defineEventHandler(async (event): Promise<KhaiHoangPayload> => {
  const config = useRuntimeConfig()
  const source = config.seasonGuideSource as string
  const kind = clean(getQuery(event).kind) || 'doi-hinh'
  const response = await $fetch<KhaiHoangApiResponse>(appendQuery(source, {
    mode: 'khai-hoang',
    kind
  }))

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: response.message || 'Không đọc được dữ liệu khai hoang từ Google Sheets API.'
    })
  }

  if (!Array.isArray(response.items)) {
    throw createError({
      statusCode: 502,
      statusMessage: `Google Sheets API chưa trả items cho mode=khai-hoang&kind=${kind}.`
    })
  }

  return {
    ok: true,
    updatedAt: response.updatedAt ?? new Date().toISOString(),
    spreadsheetId: response.spreadsheetId,
    settings: normalizeSettings(response.settings ?? {}),
    seasons: (response.seasons ?? []).map(normalizeSeason).filter(season => season.slug),
    menu: normalizeKhaiHoangMenu(response.menu ?? { slug: kind, name: kind }),
    items: normalizeItems(response.items, kind)
  }
})

function normalizeItems(rows: Array<Record<string, unknown>>, kind: string): KhaiHoangItem[] {
  return rows
    .map((row, index) => ({
      slug: clean(row.slug),
      rank: toNumber(row.rank) ?? index + 1,
      name: clean(row.name),
      transformTo: splitList(row.transformTo),
      notes: clean(row.notes),
      lineup: normalizeLineup(row.lineup, kind)
    }))
    .filter(item => item.name)
}

function normalizeLineup(value: unknown, kind: string): Array<KhaiHoangDoiHinhRow | KhaiHoangChamSuRow> {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((row) => {
      const item = record(row)

      if (kind === 'cham-su') {
        return {
          general: clean(item.general),
          tactic: clean(item.tactic)
        }
      }

      return {
        general: clean(item.general),
        before20: clean(item.before20),
        after20: clean(item.after20)
      }
    })
    .filter(row => row.general)
}

function normalizeSettings(raw: Record<string, unknown>): SeasonGuideSettings {
  return {
    updating: toBoolean(raw.updating),
    updatingTitle: clean(raw.updatingTitle) || 'Dữ liệu đang được cập nhật',
    updatingMessage: clean(raw.updatingMessage) || 'Thăng Long Hội đang cập nhật dữ liệu đội hình.',
    notice: clean(raw.notice),
    defaultSeasonSlug: clean(raw.defaultSeasonSlug),
    apiVersion: toNumber(raw.apiVersion),
    lastUpdated: clean(raw.lastUpdated)
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

function normalizeKhaiHoangMenu(raw: Record<string, string>): KhaiHoangMenu {
  return {
    slug: clean(raw.slug),
    name: clean(raw.name)
  }
}

function splitList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(splitList)
  }

  return clean(value)
    .split(/\n+/g)
    .map(item => item.trim())
    .filter(Boolean)
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
