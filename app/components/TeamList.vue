<script setup lang="ts">
import type { SeasonTeam } from '../../shared/types/season-guide'
import { teamId } from '../utils/season-guide'
import { factionBadgeClass, tagBadgeClass, troopTypeBadgeClass } from '../utils/team-badges'

const props = defineProps<{
  teams: SeasonTeam[]
  copiedTeamId: string
}>()

const emit = defineEmits<{
  selectTeam: [team: SeasonTeam]
  shareTeam: [team: SeasonTeam]
}>()

interface FilterOption {
  key: string
  groupKey: string
  label: string
  value: string
  count: number
  className: string
}

interface FilterGroup {
  label: string
  getter: (team: SeasonTeam) => string[]
  classGetter: (value: string) => string
}

const singleSelectFilterGroups = new Set([filterGroupKey('Phe'), filterGroupKey('Binh chủng')])
const search = useState('team-list-search', () => '')
const activeFilters = useState<string[]>('team-list-active-filters', () => [])

const visibleTeams = computed(() => {
  const keyword = normalizeSearch(search.value)
  const filteredTeams = props.teams.filter(matchesActiveFilters)

  if (!keyword) {
    return filteredTeams
  }

  return filteredTeams
    .map(team => ({
      team,
      score: searchScore(team, keyword)
    }))
    .filter(result => result.score !== Number.POSITIVE_INFINITY)
    .sort((a, b) => a.score - b.score || a.team.rank - b.team.rank)
    .map(result => result.team)
})

const filterOptions = computed(() => {
  const filteredTeams = props.teams.filter(matchesActiveFilters)
  const groups: FilterGroup[] = [
    {
      label: 'Phe',
      getter: team => teamList(team.factions),
      classGetter: factionBadgeClass
    },
    {
      label: 'Binh chủng',
      getter: team => teamList(team.troopTypes),
      classGetter: troopTypeBadgeClass
    },
    {
      label: 'Thẻ',
      getter: team => teamList(team.tags),
      classGetter: tagBadgeClass
    }
  ]

  return groups
    .flatMap(group => collectFilterOptions(group.label, filteredTeams, group.getter, group.classGetter))
    .filter(option => option.count > 0)
})

const hasActiveFilters = computed(() => activeFilters.value.length > 0)

function generalNames(team: SeasonTeam) {
  const lineup = teamList(team.lineup)

  return lineup.map(row => row.general).filter(Boolean).slice(0, 3).join(' · ')
}

function collectFilterOptions(
  label: string,
  teams: SeasonTeam[],
  getter: (team: SeasonTeam) => string[],
  classGetter: (value: string) => string
): FilterOption[] {
  const counts = new Map<string, { value: string, count: number }>()
  const groupKey = filterGroupKey(label)

  for (const team of teams) {
    for (const value of unique(getter(team))) {
      const key = filterKey(label, value)
      const current = counts.get(key)

      counts.set(key, {
        value,
        count: (current?.count ?? 0) + 1
      })
    }
  }

  return [...counts.entries()]
    .map(([key, item]) => ({
      key,
      groupKey,
      label,
      value: item.value,
      count: item.count,
      className: classGetter(item.value)
    }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'vi'))
}

function toggleFilter(option: FilterOption) {
  if (activeFilters.value.includes(option.key)) {
    activeFilters.value = activeFilters.value.filter(item => item !== option.key)
    return
  }

  if (singleSelectFilterGroups.has(option.groupKey)) {
    activeFilters.value = [
      ...activeFilters.value.filter(item => !item.startsWith(`${option.groupKey}:`)),
      option.key
    ]
    return
  }

  activeFilters.value = [...activeFilters.value, option.key]
}

function clearFilters() {
  activeFilters.value = []
}

function matchesActiveFilters(team: SeasonTeam) {
  if (!activeFilters.value.length) {
    return true
  }

  const teamKeys = [
    ...teamList(team.factions).map(value => filterKey('Phe', value)),
    ...teamList(team.troopTypes).map(value => filterKey('Binh chủng', value)),
    ...teamList(team.tags).map(value => filterKey('Thẻ', value))
  ]

  return activeFilters.value.every(key => teamKeys.includes(key))
}

function searchScore(team: SeasonTeam, keyword: string) {
  const primaryFields = [team.name]
  const priorityFields = [
    team.tier,
    generalNames(team),
    ...teamList(team.factions),
    ...teamList(team.troopTypes),
    ...teamList(team.tags)
  ]
  const secondaryFields = [
    team.mentor,
    team.notes,
    ...teamList(team.analysisItems),
    ...teamList(team.objectionItems),
    ...teamList(team.builds).flatMap(build => [build.name, build.status, build.idea, build.source]),
    ...teamList(team.lineup).flatMap(row => [
      row.general,
      row.tactic1,
      row.tactic2,
      row.battleBook,
      row.attribute,
      row.role,
      row.note,
      row.source
    ])
  ]

  if (includesKeyword(primaryFields, keyword)) {
    return 0
  }

  if (includesKeyword(priorityFields, keyword)) {
    return 1
  }

  if (includesKeyword(secondaryFields, keyword)) {
    return 2
  }

  return Number.POSITIVE_INFINITY
}

function teamList<T>(value: T[] | undefined | null) {
  return Array.isArray(value) ? value : []
}

function unique(values: string[]) {
  return [...new Set(values)]
}

function filterKey(label: string, value: string) {
  return `${filterGroupKey(label)}:${normalizeSearch(value)}`
}

function filterGroupKey(label: string) {
  return normalizeSearch(label)
}

function includesKeyword(values: string[], keyword: string) {
  return values.some(value => normalizeSearch(value).includes(keyword))
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
</script>

<template>
  <section class="rounded-xl border border-default bg-default shadow-sm">
    <div class="flex flex-col gap-3 border-b border-default p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-semibold text-highlighted">
          Danh sách đội hình
        </h2>
        <p class="mt-1 text-sm text-muted">
          Mở từng đội để xem tướng, chiến pháp, binh thư, cộng điểm và bái sư.
        </p>
      </div>

      <UBadge
        color="neutral"
        variant="soft"
      >
        {{ visibleTeams.length }} đội
      </UBadge>
    </div>

    <div class="border-b border-default p-4">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        size="lg"
        placeholder="Tìm đội, tướng, tier, quốc gia, binh chủng, thẻ..."
        :ui="{ root: 'w-full', base: 'h-11' }"
      />

      <div
        v-if="filterOptions.length"
        class="mt-4 space-y-3"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            Lọc nhanh theo badge
          </p>

          <UButton
            v-if="hasActiveFilters"
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-lucide-x"
            class="cursor-pointer"
            @click="clearFilters"
          >
            Xóa lọc
          </UButton>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in filterOptions"
            :key="option.key"
            type="button"
            class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition hover:-translate-y-0.5 hover:shadow-sm"
            :class="[
              option.className,
              activeFilters.includes(option.key) ? 'ring-2 ring-primary/60 ring-offset-2 ring-offset-default' : 'opacity-75 hover:opacity-100'
            ]"
            @click="toggleFilter(option)"
          >
            <span>{{ option.value }}</span>
            <span class="rounded bg-default/70 px-1 text-[10px] leading-4 text-muted">
              {{ option.count }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <div
        v-for="team in visibleTeams"
        :key="teamId(team)"
        role="button"
        tabindex="0"
        class="group relative flex min-h-40 w-full cursor-pointer flex-col rounded-xl border border-default bg-elevated/35 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-elevated hover:shadow-md"
        @click="emit('selectTeam', team)"
        @keydown.enter.prevent="emit('selectTeam', team)"
        @keydown.space.prevent="emit('selectTeam', team)"
      >
        <div class="flex min-w-0 items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="line-clamp-2 font-semibold leading-6 text-highlighted">
                {{ team.name }}
              </h3>
              <UBadge
                v-if="team.tier"
                size="xs"
                color="primary"
                variant="subtle"
              >
                {{ team.tier }}
              </UBadge>
            </div>

            <p
              v-if="generalNames(team)"
              class="mt-2 line-clamp-2 text-sm leading-6 text-muted"
            >
              {{ generalNames(team) }}
            </p>
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            :icon="copiedTeamId === teamId(team) ? 'i-lucide-check' : 'i-lucide-share-2'"
            size="sm"
            aria-label="Chia sẻ đội hình"
            class="shrink-0 cursor-pointer opacity-80 transition group-hover:opacity-100"
            @click.stop="emit('shareTeam', team)"
          />
        </div>

        <div class="mt-auto pt-4">
          <div
            v-if="teamList(team.factions).length || teamList(team.troopTypes).length || teamList(team.tags).length"
            class="flex flex-wrap gap-1.5"
          >
            <span
              v-for="faction in teamList(team.factions)"
              :key="`faction-${faction}`"
              class="inline-flex rounded-md border px-1.5 py-0.5 text-xs font-medium"
              :class="factionBadgeClass(faction)"
            >
              {{ faction }}
            </span>
            <span
              v-for="troopType in teamList(team.troopTypes)"
              :key="`troop-${troopType}`"
              class="inline-flex rounded-md border px-1.5 py-0.5 text-xs font-medium"
              :class="troopTypeBadgeClass(troopType)"
            >
              {{ troopType }}
            </span>
            <span
              v-for="tag in teamList(team.tags)"
              :key="`tag-${tag}`"
              class="inline-flex rounded-md border px-1.5 py-0.5 text-xs font-medium"
              :class="tagBadgeClass()"
            >
              {{ tag }}
            </span>
          </div>

          <p
            v-else
            class="text-xs text-dimmed"
          >
            Chưa gắn phe / binh chủng / thẻ
          </p>
        </div>
      </div>

      <UEmpty
        v-if="search && !visibleTeams.length"
        icon="i-lucide-search-x"
        title="Không tìm thấy đội hình"
        description="Thử tìm theo tên đội, tên tướng, tier, quốc gia, binh chủng, thẻ, chiến pháp hoặc binh thư."
      />
    </div>
  </section>
</template>
