export interface TeamVariant {
  general: string
  tactics: string
  alternatives: string[]
}

export interface SeasonTeam {
  slug: string
  detailSheet: string
  rank: number
  group: string
  dataType: string
  name: string
  chineseNames: string
  tier: string
  factions: string[]
  troopTypes: string[]
  tags: string[]
  mentor: string
  sourceLevel: string
  threadMentions: number | null
  commentMentions: number | null
  supportPercent: number | null
  neutralPercent: number | null
  objectionPercent: number | null
  usesDoyu: string
  reliability: string
  variants: TeamVariant[]
  alternatives: string[]
  analysis: string
  analysisItems: string[]
  objections: string
  objectionItems: string[]
  authorNotes: string
  notes: string
  sourceStatus: string
  builds: SeasonTeamBuild[]
  lineup: SeasonTeamLineupRow[]
}

export interface SeasonTeamBuild {
  id: string
  name: string
  status: string
  idea: string
  source: string
}

export interface SeasonTeamLineupRow {
  buildId: string
  buildName: string
  general: string
  tactic1: string
  tactic2: string
  battleBook: string
  attribute: string
  role: string
  note: string
  source: string
}

export interface CrawlStat {
  label: string
  value: string
}

export interface SeasonGuideSettings {
  updating: boolean
  updatingTitle: string
  updatingMessage: string
  notice: string
  defaultSeasonSlug: string
  apiVersion: number | null
  lastUpdated: string
}

export interface KhaiHoangMenu {
  slug: string
  name: string
}

export interface SeasonSummary {
  slug: string
  prefix: string
  name: string
  title: string
  status: string
}

export interface SeasonGuidePayload {
  ok: boolean
  updatedAt: string
  spreadsheetId: string
  settings: SeasonGuideSettings
  seasons: SeasonSummary[]
  khaiHoangMenus: KhaiHoangMenu[]
  activeSeasonSlug: string
  teams: SeasonTeam[]
  stats: CrawlStat[]
}

export interface SeasonGuideMetaPayload {
  ok: boolean
  updatedAt: string
  spreadsheetId: string
  settings: SeasonGuideSettings
  seasons: SeasonSummary[]
  khaiHoangMenus: KhaiHoangMenu[]
}

export interface KhaiHoangDoiHinhRow {
  general: string
  before20: string
  after20: string
}

export interface KhaiHoangChamSuRow {
  general: string
  tactic: string
}

export interface KhaiHoangItem {
  slug: string
  rank: number
  name: string
  transformTo: string[]
  notes: string
  lineup: Array<KhaiHoangDoiHinhRow | KhaiHoangChamSuRow>
}

export interface KhaiHoangPayload {
  ok: boolean
  updatedAt: string
  spreadsheetId: string
  settings: SeasonGuideSettings
  seasons: SeasonSummary[]
  menu: KhaiHoangMenu
  items: KhaiHoangItem[]
}
