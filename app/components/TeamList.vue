<script setup lang="ts">
import type { SeasonTeam } from '../../shared/types/season-guide'
import { teamId } from '../utils/season-guide'

defineProps<{
  teams: SeasonTeam[]
  copiedTeamId: string
}>()

const emit = defineEmits<{
  selectTeam: [team: SeasonTeam]
  shareTeam: [team: SeasonTeam]
}>()
function generalNames(team: SeasonTeam) {
  const lineup = Array.isArray(team.lineup) ? team.lineup : []

  return lineup.map(row => row.general).filter(Boolean).slice(0, 3).join(' · ')
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
        {{ teams.length }} đội
      </UBadge>
    </div>

    <div class="divide-y divide-default">
      <div
        v-for="team in teams"
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
    </div>
  </section>
</template>
