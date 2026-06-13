import type { CrawlStat, SeasonGuidePayload, SeasonTeam, TeamVariant } from '../../shared/types/season-guide'

interface SheetTab {
  name: string
  gid: number
  rows: number
  columns: number
}

interface TabsResponse {
  ok: boolean
  spreadsheetId: string
  tabs: SheetTab[]
}

interface RecordsResponse<T> {
  ok: boolean
  data: T[]
}

type RawRow = Record<string, string>

const TEAM_TAB_NAME = 'Tong hop 20 doi'
const STATS_TAB_NAME = 'Thong ke crawl'

export default defineCachedEventHandler(async (): Promise<SeasonGuidePayload> => {
  const config = useRuntimeConfig()
  const source = config.seasonGuideSource as string
  const tabsResponse = await $fetch<TabsResponse>(source)

  if (!tabsResponse.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Không đọc được danh sách tab từ Google Sheets API.' })
  }

  const teamTab = tabsResponse.tabs.find(tab => tab.name === TEAM_TAB_NAME)
  const statsTab = tabsResponse.tabs.find(tab => tab.name === STATS_TAB_NAME)

  if (!teamTab) {
    throw createError({ statusCode: 502, statusMessage: `Không tìm thấy tab ${TEAM_TAB_NAME}.` })
  }

  const [teamRowsResponse, statsRowsResponse] = await Promise.all([
    $fetch<RecordsResponse<RawRow>>(`${source}?gid=${teamTab.gid}&format=records`),
    statsTab
      ? $fetch<RecordsResponse<RawRow>>(`${source}?gid=${statsTab.gid}&format=records`)
      : Promise.resolve({ ok: true, data: [] })
  ])

  return {
    ok: true,
    updatedAt: new Date().toISOString(),
    spreadsheetId: tabsResponse.spreadsheetId,
    teams: normalizeTeams(teamRowsResponse.data),
    stats: normalizeStats(statsRowsResponse.data)
  }
}, {
  maxAge: 300,
  swr: true
})

function normalizeTeams(rows: RawRow[]): SeasonTeam[] {
  const teams = new Map<string, SeasonTeam>()

  for (const row of rows) {
    const name = clean(row['Đội hình'])
    const rank = toNumber(row.STT) ?? teams.size + 1

    if (!name) {
      continue
    }

    const key = `${rank}-${name}`
    const team = teams.get(key) ?? createTeam(row, rank, name)
    const variant = createVariant(row)

    if (variant) {
      team.variants.push(variant)
    }

    teams.set(key, team)
  }

  return Array.from(teams.values()).sort((a, b) => {
    const rankDelta = a.rank - b.rank

    if (rankDelta !== 0) {
      return rankDelta
    }

    return (b.supportPercent ?? -1) - (a.supportPercent ?? -1)
  })
}

function createTeam(row: RawRow, rank: number, name: string): SeasonTeam {
  const alternatives = splitBulletText(row['Chiến pháp thay thế'])

  return {
    rank,
    group: clean(row['Nhóm']),
    dataType: clean(row['Loại dữ liệu']),
    name,
    chineseNames: clean(row['Tên Trung']),
    sourceLevel: clean(row['Mức dữ liệu gốc']),
    threadMentions: toNumber(row['Thread nhắc']),
    commentMentions: toNumber(row['Comment nhắc']),
    supportPercent: toNumber(row['% ủng hộ']),
    neutralPercent: toNumber(row['% trung lập']),
    objectionPercent: toNumber(row['% phản biện']),
    usesDoyu: clean(row['Có đô úy']),
    reliability: clean(row['Độ tin cậy']),
    variants: [],
    alternatives,
    analysis: clean(row['Phân tích']),
    objections: clean(row['Phản biện']),
    authorNotes: clean(row['Ý kiến tác giả']),
    notes: clean(row['Ghi chú']),
    sourceStatus: clean(row['Nguồn / trạng thái'])
  }
}

function createVariant(row: RawRow): TeamVariant | null {
  const general = clean(row['Tướng / biến thể'])
  const tactics = clean(row['Chiến pháp / vai trò'])

  if (!general && !tactics) {
    return null
  }

  return {
    general,
    tactics,
    alternatives: splitBulletText(row['Chiến pháp thay thế'])
  }
}

function normalizeStats(rows: RawRow[]): CrawlStat[] {
  return rows
    .map((row) => {
      const values = Object.values(row).map(clean).filter(Boolean)

      return {
        label: values[0] ?? '',
        value: values.slice(1).join(' ') || ''
      }
    })
    .filter(stat => stat.label || stat.value)
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

function splitBulletText(value: unknown): string[] {
  return clean(value)
    .split(/\n+/)
    .map(item => item.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)
}
