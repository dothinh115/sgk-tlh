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
  objections: string
  authorNotes: string
  notes: string
  sourceStatus: string
}

export interface TeamDetailTextBlock {
  title: string
  value: string
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

export interface SeasonTeamDetail {
  summary: Record<string, string>
  builds: SeasonTeamBuild[]
  lineup: SeasonTeamLineupRow[]
  variants: Array<{
    title: string
    value: string
    note: string
  }>
  alternatives: string[]
  analysis: TeamDetailTextBlock[]
  authorNotes: string[]
}

export interface SeasonTeamDetailPayload {
  ok: boolean
  updatedAt: string
  spreadsheetId: string
  team: SeasonTeam
  detail: SeasonTeamDetail
}

export interface CrawlStat {
  label: string
  value: string
}

export interface SeasonGuideSettings {
  updating: boolean
  updatingTitle: string
  updatingMessage: string
  defaultSeasonSlug: string
  apiVersion: number | null
  lastUpdated: string
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
  activeSeasonSlug: string
  teams: SeasonTeam[]
  stats: CrawlStat[]
}
