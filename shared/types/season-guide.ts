export interface TeamVariant {
  general: string
  tactics: string
  alternatives: string[]
}

export interface SeasonTeam {
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

export interface CrawlStat {
  label: string
  value: string
}

export interface SeasonGuidePayload {
  ok: boolean
  updatedAt: string
  spreadsheetId: string
  teams: SeasonTeam[]
  stats: CrawlStat[]
}
