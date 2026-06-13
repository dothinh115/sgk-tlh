<script setup lang="ts">
import type { SeasonTeam } from '../../shared/types/season-guide'
import { badgeColor, percentText, teamId } from '../utils/season-guide'

defineProps<{
  teams: SeasonTeam[]
  copiedTeamId: string
}>()

const emit = defineEmits<{
  selectTeam: [team: SeasonTeam]
  shareTeam: [team: SeasonTeam]
}>()

function listPercentText(value: number | null) {
  return value === null ? 'N/A' : percentText(value)
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
          Sắp theo thứ tự tier, sau đó đến đồng thuận.
        </p>
      </div>

      <UBadge
        color="neutral"
        variant="soft"
      >
        {{ teams.length }} đội
      </UBadge>
    </div>

    <div class="hidden border-b border-default px-4 py-3 md:grid md:grid-cols-[minmax(0,1fr)_252px] md:gap-4">
      <div />
      <div class="grid grid-cols-3 gap-2 text-center text-xs font-medium text-muted">
        <span>Ủng hộ</span>
        <span>Trung lập</span>
        <span>Phản biện</span>
      </div>
    </div>

    <div class="divide-y divide-default">
      <div
        v-for="team in teams"
        :key="teamId(team)"
        role="button"
        tabindex="0"
        class="grid w-full cursor-pointer gap-4 px-4 py-4 text-left transition hover:bg-elevated/60 md:grid-cols-[minmax(0,1fr)_252px] md:items-center"
        @click="emit('selectTeam', team)"
        @keydown.enter.prevent="emit('selectTeam', team)"
        @keydown.space.prevent="emit('selectTeam', team)"
      >
        <div class="flex min-w-0 flex-1 gap-3">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
            {{ team.rank }}
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="font-semibold text-highlighted">
              {{ team.name }}
            </h3>
            <p
              v-if="team.chineseNames"
              class="mt-1 line-clamp-1 text-sm text-muted"
            >
              {{ team.chineseNames }}
            </p>
            <div class="mt-2 flex flex-wrap items-center gap-1.5">
              <UBadge
                size="xs"
                color="neutral"
                variant="soft"
              >
                {{ team.group }}
              </UBadge>
              <UBadge
                size="xs"
                :color="badgeColor(team.reliability)"
                variant="subtle"
              >
                {{ team.reliability }}
              </UBadge>
              <UBadge
                size="xs"
                color="neutral"
                variant="outline"
              >
                {{ team.usesDoyu }}
              </UBadge>
              <UButton
                color="neutral"
                variant="ghost"
                :icon="copiedTeamId === teamId(team) ? 'i-lucide-check' : 'i-lucide-share-2'"
                size="xs"
                aria-label="Chia sẻ đội hình"
                class="cursor-pointer"
                @click.stop="emit('shareTeam', team)"
              />
            </div>
          </div>
        </div>

        <div class="grid w-full grid-cols-3 gap-2 text-center text-sm">
          <div class="flex h-14 items-center justify-center rounded-md border border-success/25 bg-success/15 px-2 shadow-sm">
            <p class="font-bold leading-none text-success">
              {{ listPercentText(team.supportPercent) }}
            </p>
          </div>
          <div class="flex h-14 items-center justify-center rounded-md border border-warning/25 bg-warning/15 px-2 shadow-sm">
            <p class="font-bold leading-none text-warning">
              {{ listPercentText(team.neutralPercent) }}
            </p>
          </div>
          <div class="flex h-14 items-center justify-center rounded-md border border-error/25 bg-error/15 px-2 shadow-sm">
            <p class="font-bold leading-none text-error">
              {{ listPercentText(team.objectionPercent) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
