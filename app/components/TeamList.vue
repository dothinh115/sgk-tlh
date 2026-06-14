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

const search = ref('')

const visibleTeams = computed(() => {
  const keyword = normalizeSearch(search.value)

  if (!keyword) {
    return props.teams
  }

  return props.teams
    .map(team => ({
      team,
      score: searchScore(team, keyword)
    }))
    .filter(result => result.score !== Number.POSITIVE_INFINITY)
    .sort((a, b) => a.score - b.score || a.team.rank - b.team.rank)
    .map(result => result.team)
})

function generalNames(team: SeasonTeam) {
  const lineup = teamList(team.lineup)

  return lineup.map(row => row.general).filter(Boolean).slice(0, 3).join(' · ')
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
    </div>

    <div class="divide-y divide-default">
      <div
        v-for="team in visibleTeams"
        :key="teamId(team)"
        role="button"
        tabindex="0"
        class="flex w-full cursor-pointer items-start gap-4 px-4 py-4 text-left transition hover:bg-elevated/60"
        @click="emit('selectTeam', team)"
        @keydown.enter.prevent="emit('selectTeam', team)"
        @keydown.space.prevent="emit('selectTeam', team)"
      >
        <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
          {{ team.rank }}
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="font-semibold text-highlighted">
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
            class="mt-1 text-sm leading-6 text-muted"
          >
            {{ generalNames(team) }}
          </p>

          <div
            v-if="teamList(team.factions).length || teamList(team.troopTypes).length || teamList(team.tags).length"
            class="mt-2 flex flex-wrap gap-1.5"
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
        </div>

        <UButton
          color="neutral"
          variant="ghost"
          :icon="copiedTeamId === teamId(team) ? 'i-lucide-check' : 'i-lucide-share-2'"
          size="sm"
          aria-label="Chia sẻ đội hình"
          class="shrink-0 cursor-pointer"
          @click.stop="emit('shareTeam', team)"
        />
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
