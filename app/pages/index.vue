<script setup lang="ts">
import type { SeasonGuidePayload, SeasonTeam } from '../../shared/types/season-guide'
import { teamId } from '../utils/season-guide'

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const selectedTeam = ref<SeasonTeam | null>(null)
const detailOpen = ref(false)
const sidebarOpen = ref(false)
const copiedTeamId = ref('')
const seasonQuery = computed(() => queryValue(route.query.season))
let copiedResetTimer: ReturnType<typeof setTimeout> | undefined

const { data, error } = await useAsyncData<SeasonGuidePayload>('season-guide', () => {
  return $fetch(config.public.seasonApiBase, {
    query: seasonQuery.value ? { season: seasonQuery.value } : undefined
  })
}, {
  watch: [seasonQuery]
})

const teams = computed(() => data.value?.teams ?? [])
const settings = computed(() => data.value?.settings)
const isUpdating = computed(() => settings.value?.updating ?? false)
const seasons = computed(() => data.value?.seasons ?? [])
const activeSeasonSlug = computed(() => String(route.query.season || data.value?.activeSeasonSlug || seasons.value[0]?.slug || ''))
const activeSeason = computed(() => seasons.value.find(season => season.slug === activeSeasonSlug.value))

const updatedAt = computed(() => {
  if (!data.value?.updatedAt) {
    return ''
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date(data.value.updatedAt))
})

function openTeam(team: SeasonTeam) {
  selectedTeam.value = team
  detailOpen.value = true
  sidebarOpen.value = false
  syncTeamQuery(team)
}

function syncTeamQuery(team: SeasonTeam) {
  const nextTeam = teamId(team)
  const nextSeason = activeSeasonSlug.value || undefined

  if (queryValue(route.query.team) === nextTeam && queryValue(route.query.season) === (nextSeason ?? '')) {
    return
  }

  router.replace({
    query: {
      ...route.query,
      season: nextSeason,
      team: nextTeam
    }
  })
}

function clearTeamQuery() {
  const { team, ...query } = route.query

  router.replace({ query })
}

async function shareTeam(team: SeasonTeam) {
  const url = buildTeamUrl(team)

  await navigator.clipboard.writeText(url)
  copiedTeamId.value = teamId(team)

  if (copiedResetTimer) {
    clearTimeout(copiedResetTimer)
  }

  copiedResetTimer = setTimeout(() => {
    copiedTeamId.value = ''
  }, 2200)

  toast.add({
    title: 'Đã copy link đội hình',
    description: team.name,
    icon: 'i-lucide-check',
    color: 'success'
  })
}

function buildTeamUrl(team: SeasonTeam) {
  const url = new URL(window.location.href)

  if (activeSeasonSlug.value) {
    url.searchParams.set('season', activeSeasonSlug.value)
  }

  url.searchParams.set('team', teamId(team))
  return url.toString()
}

watch([teams, () => route.query.team], ([currentTeams, queryTeam]) => {
  if (!currentTeams.length || !queryTeam) {
    return
  }

  const match = currentTeams.find(team => teamId(team) === queryValue(queryTeam))

  if (match && (!selectedTeam.value || teamId(selectedTeam.value) !== teamId(match))) {
    selectedTeam.value = match
    detailOpen.value = true
  }
}, { immediate: true })

watch(detailOpen, (open) => {
  if (!open && route.query.team) {
    clearTeamQuery()
  }
})

function queryValue(value: unknown): string {
  return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-var(--ui-header-height))]">
    <SeasonSidebar
      :team-count="teams.length"
      :seasons="seasons"
      :active-season-slug="activeSeasonSlug"
    />

    <main class="min-w-0 flex-1">
      <div class="mx-auto max-w-6xl space-y-5 p-4 sm:p-5 lg:p-6">
        <div class="flex items-center gap-3 lg:hidden">
          <UButton
            icon="i-lucide-panel-left-open"
            color="neutral"
            variant="outline"
            @click="sidebarOpen = true"
          >
            Mùa giải
          </UButton>

          <p class="text-sm text-muted">
            {{ teams.length }} đội hình
          </p>
        </div>

        <div
          v-if="isUpdating"
          class="flex min-h-[calc(100vh-var(--ui-header-height)-3rem)] items-center justify-center"
        >
          <UAlert
            color="warning"
            variant="subtle"
            icon="i-lucide-refresh-cw"
            :title="settings?.updatingTitle || 'Dữ liệu đang được cập nhật'"
            :description="settings?.updatingMessage || 'Thăng Long Hội đang chỉnh lại dữ liệu mùa. Một số nội dung có thể thay đổi trong ít phút tới.'"
            :ui="{
              root: 'max-w-2xl border border-warning/30 bg-warning/10',
              icon: 'animate-spin'
            }"
          />
        </div>

        <template v-else>
          <OverviewStats
            :updated-at="updatedAt"
            :team-count="teams.length"
          />

          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            title="Không đọc được dữ liệu"
            :description="error.message"
          />

          <UAlert
            v-if="settings?.notice"
            color="primary"
            variant="subtle"
            icon="i-lucide-megaphone"
            title="Thông báo"
            :description="settings.notice"
            :ui="{ root: 'border border-primary/25 bg-primary/10' }"
          />

          <TeamList
            :teams="teams"
            :copied-team-id="copiedTeamId"
            @select-team="openTeam"
            @share-team="shareTeam"
          />

          <UEmpty
            v-if="!teams.length"
            icon="i-lucide-search-x"
            title="Chưa có dữ liệu đội hình"
            description="API hiện chưa trả đội hình nào."
          />
        </template>
      </div>
    </main>

    <USlideover
      v-model:open="sidebarOpen"
      side="left"
      title="Mùa giải"
      description="Chọn mùa để đọc sách giáo khoa"
      :ui="{ content: 'w-screen max-w-full sm:max-w-sm', body: 'p-0' }"
    >
      <template #body>
        <div class="p-3">
          <div class="rounded-lg bg-primary/10 px-3 py-3 text-primary">
            <div class="flex items-start gap-3">
              <span class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-default shadow-sm">
                <UIcon
                  name="i-lucide-book-open-text"
                  class="size-5"
                />
              </span>
              <span class="min-w-0 flex-1">
                <span class="font-semibold">{{ activeSeason?.name || 'Anh Hùng Mệnh Thế' }}</span>
                <span class="mt-1 block text-sm text-primary/75">{{ teams.length }} đội hình</span>
              </span>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <TeamDetailDrawer
      v-model:open="detailOpen"
      :team="selectedTeam"
      :copied-team-id="copiedTeamId"
      @share-team="shareTeam"
    />
  </div>
</template>
