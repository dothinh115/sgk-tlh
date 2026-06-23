<script setup lang="ts">
import type { SeasonTeam, SeasonTeamLineupRow } from '../../shared/types/season-guide'
import { teamId } from '../utils/season-guide'
import { factionBadgeClass, tagBadgeClass, troopTypeBadgeClass } from '../utils/team-badges'

const props = defineProps<{
  team: SeasonTeam | null
  loading: boolean
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

const factions = computed(() => teamList(props.team?.factions))
const troopTypes = computed(() => teamList(props.team?.troopTypes))
const tags = computed(() => teamList(props.team?.tags))

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

const analysisItems = computed(() => teamList(props.team?.analysisItems))
const objectionItems = computed(() => teamList(props.team?.objectionItems))

function teamList<T>(value: T[] | undefined | null) {
  return Array.isArray(value) ? value : []
}
</script>

<template>
  <USlideover
    v-model:open="open"
    side="right"
    :title="team?.name || (loading ? 'Đang tải đội hình' : 'Không tìm thấy đội hình')"
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

          <div
            v-if="factions.length || troopTypes.length || tags.length"
            class="mt-4 flex flex-wrap gap-2"
          >
            <span
              v-for="faction in factions"
              :key="`faction-${faction}`"
              class="inline-flex rounded-md border px-2 py-1 text-sm font-medium"
              :class="factionBadgeClass(faction)"
            >
              {{ faction }}
            </span>
            <span
              v-for="troopType in troopTypes"
              :key="`troop-${troopType}`"
              class="inline-flex rounded-md border px-2 py-1 text-sm font-medium"
              :class="troopTypeBadgeClass(troopType)"
            >
              {{ troopType }}
            </span>
            <span
              v-for="tag in tags"
              :key="`tag-${tag}`"
              class="inline-flex rounded-md border px-2 py-1 text-sm font-medium"
              :class="tagBadgeClass()"
            >
              {{ tag }}
            </span>
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
          v-if="analysisItems.length"
          class="border-b border-default p-5 sm:p-6"
        >
          <h3 class="section-title">
            Phân tích
          </h3>
          <ul class="mt-3 space-y-2">
            <li
              v-for="item in analysisItems"
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

        <section
          v-if="objectionItems.length"
          class="border-b border-default p-5 sm:p-6"
        >
          <h3 class="section-title">
            Phản biện
          </h3>
          <ul class="mt-3 space-y-2">
            <li
              v-for="item in objectionItems"
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

      <div
        v-else
        class="flex min-h-[360px] flex-col items-center justify-center gap-3 bg-default p-8 text-center"
      >
        <UIcon
          :name="loading ? 'i-lucide-loader-circle' : 'i-lucide-search-x'"
          class="size-8 text-muted"
          :class="{ 'animate-spin': loading }"
        />
        <div>
          <h3 class="font-semibold text-highlighted">
            {{ loading ? 'Đang tải đội hình' : 'Không tìm thấy đội hình' }}
          </h3>
          <p class="mt-1 max-w-sm text-sm text-muted">
            {{ loading ? 'Nội dung chi tiết sẽ hiện ngay khi dữ liệu mùa sẵn sàng.' : 'Link này không khớp với đội hình nào trong mùa hiện tại.' }}
          </p>
        </div>
      </div>
    </template>
  </USlideover>
</template>
