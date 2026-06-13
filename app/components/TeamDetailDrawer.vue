<script setup lang="ts">
import type { SeasonTeam, SeasonTeamLineupRow } from '../../shared/types/season-guide'
import { teamId } from '../utils/season-guide'

const props = defineProps<{
  team: SeasonTeam | null
  copiedTeamId: string
}>()

const emit = defineEmits<{
  shareTeam: [team: SeasonTeam]
}>()

const open = defineModel<boolean>('open', { default: false })

const lineup = computed<SeasonTeamLineupRow[]>(() => {
  const teamLineup = props.team?.lineup

  return Array.isArray(teamLineup) ? teamLineup : []
})

const builds = computed(() => {
  const teamBuilds = props.team?.builds

  return Array.isArray(teamBuilds) ? teamBuilds : []
})

const noteItems = computed(() => {
  const note = props.team?.notes || ''

  return note
    .split(/\n+/)
    .map(item => item.trim())
    .filter(item => !/^Đội\s+(top|mạnh|tham khảo),/i.test(item))
    .filter(Boolean)
})

const mentor = computed(() => {
  const value = props.team?.mentor || ''

  return value && value !== '-' ? value : ''
})
</script>

<template>
  <USlideover
    v-model:open="open"
    side="right"
    :title="team?.name || 'Chi tiết đội hình'"
    :description="team?.tier || ''"
    :ui="{
      content: '!inset-3 !h-auto !w-auto !max-w-none !rounded-xl !overflow-hidden sm:!inset-y-4 sm:!right-4 sm:!left-auto sm:!w-[min(860px,calc(100vw-2rem))]',
      header: 'px-5 py-4 pr-16 sm:px-6 sm:pr-16',
      body: '!p-0 overflow-y-auto'
    }"
  >
    <template #body>
      <div
        v-if="team"
        class="min-h-full bg-default"
      >
        <div class="border-b border-default bg-default p-5 sm:p-6">
          <div class="flex flex-wrap items-center gap-3">
            <UBadge
              color="primary"
              variant="solid"
            >
              #{{ team.rank }}
            </UBadge>

            <UButton
              color="primary"
              variant="soft"
              :icon="copiedTeamId === teamId(team) ? 'i-lucide-check' : 'i-lucide-share-2'"
              class="cursor-pointer"
              @click="emit('shareTeam', team)"
            >
              {{ copiedTeamId === teamId(team) ? 'Đã copy link' : 'Chia sẻ đội hình' }}
            </UButton>
          </div>
        </div>

        <section
          v-if="mentor"
          class="border-b border-default p-5 sm:p-6"
        >
          <h3 class="section-title">
            Bái sư
          </h3>
          <p class="mt-3 leading-7 text-default">
            {{ mentor }}
          </p>
        </section>

        <section class="border-b border-default p-5 sm:p-6">
          <h3 class="section-title">
            Đội hình và chiến pháp
          </h3>

          <TeamBuilds
            class="mt-4"
            :builds="builds"
            :lineup="lineup"
          />
        </section>

        <section
          v-if="noteItems.length"
          class="p-5 sm:p-6"
        >
          <h3 class="section-title">
            Ghi chú
          </h3>
          <ul class="mt-3 space-y-2">
            <li
              v-for="item in noteItems"
              :key="item"
              class="flex gap-2 leading-7 text-default"
            >
              <UIcon
                name="i-lucide-dot"
                class="mt-1 size-5 shrink-0 text-primary"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </USlideover>
</template>
