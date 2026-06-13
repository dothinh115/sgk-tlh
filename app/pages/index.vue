<script setup lang="ts">
import type { SeasonGuidePayload, SeasonTeam, SeasonTeamDetail, SeasonTeamDetailPayload } from '../../shared/types/season-guide'
import { teamId } from '../utils/season-guide'

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const selectedTeam = ref<SeasonTeam | null>(null)
const selectedTeamDetail = ref<SeasonTeamDetail | null>(null)
const detailPending = ref(false)
const detailOpen = ref(false)
const sidebarOpen = ref(false)
const copiedTeamId = ref('')
const seasonQuery = computed(() => queryValue(route.query.season))
const loadedDetailKey = ref('')
let copiedResetTimer: ReturnType<typeof setTimeout> | undefined

const { data, error } = await useAsyncData<SeasonGuidePayload>('season-guide', () => {
  return $fetch(config.public.seasonApiBase, {
    query: seasonQuery.value ? { season: seasonQuery.value } : undefined
  })
}, {
  watch: [seasonQuery]
})

const teams = computed(() => data.value?.teams ?? [])
const stats = computed(() => data.value?.stats ?? [])
const settings = computed(() => data.value?.settings)
const isUpdating = computed(() => settings.value?.updating ?? false)
const seasons = computed(() => data.value?.seasons ?? [])
const activeSeasonSlug = computed(() => String(route.query.season || data.value?.activeSeasonSlug || seasons.value[0]?.slug || ''))
const activeSeason = computed(() => seasons.value.find(season => season.slug === activeSeasonSlug.value))
const publicStats = computed(() => stats.value.filter((stat) => {
  const label = stat.label.toLowerCase()

  return !label.includes('api') && !label.includes('cách đọc') && !label.includes('cách lọc')
}))

const topStats = computed(() => {
  const allTeams = teams.value
  const highTrust = allTeams.filter(team => team.reliability === 'cao').length
  const doyuTeams = allTeams.filter(team => team.usesDoyu.includes('có')).length
  const contestedTeams = allTeams.filter(team => (team.objectionPercent ?? 0) >= 20).length

  return [
    { label: 'Đội hình', value: allTeams.length.toString(), icon: 'i-lucide-users-round' },
    { label: 'Độ tin cậy cao', value: highTrust.toString(), icon: 'i-lucide-shield-check' },
    { label: 'Đội có đô úy', value: doyuTeams.toString(), icon: 'i-lucide-swords' },
    { label: 'Đội tranh cãi', value: contestedTeams.toString(), icon: 'i-lucide-message-circle-warning' }
  ]
})

const updatedAt = computed(() => {
  if (!data.value?.updatedAt) {
    return ''
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(data.value.updatedAt))
})

function openTeam(team: SeasonTeam) {
  if (!selectedTeam.value || teamId(selectedTeam.value) !== teamId(team)) {
    selectedTeamDetail.value = null
    loadedDetailKey.value = ''
  }

  selectedTeam.value = team
  detailOpen.value = true
  sidebarOpen.value = false
  syncTeamQuery(team)
  void loadTeamDetail(team)
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

async function loadTeamDetail(team: SeasonTeam) {
  if (!import.meta.client || !activeSeasonSlug.value) {
    return
  }

  const detailKey = `${activeSeasonSlug.value}:${teamId(team)}`

  if (loadedDetailKey.value === detailKey && selectedTeamDetail.value) {
    return
  }

  detailPending.value = true
  loadedDetailKey.value = detailKey

  try {
    const response = await $fetch<SeasonTeamDetailPayload>('/api/season-guide/team', {
      query: {
        season: activeSeasonSlug.value,
        team: teamId(team)
      }
    })

    if (selectedTeam.value && teamId(selectedTeam.value) === teamId(team)) {
      selectedTeamDetail.value = response.detail
    }
  } finally {
    detailPending.value = false
  }
}

watch([teams, () => route.query.team], ([currentTeams, queryTeam]) => {
  if (!currentTeams.length || !queryTeam) {
    return
  }

  const match = currentTeams.find(team => teamId(team) === queryValue(queryTeam))

  if (match && (!selectedTeam.value || teamId(selectedTeam.value) !== teamId(match))) {
    selectedTeam.value = match
    selectedTeamDetail.value = null
    loadedDetailKey.value = ''
    detailOpen.value = true
    void loadTeamDetail(match)
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

        <OverviewStats
          :updated-at="updatedAt"
        />

        <UAlert
          v-if="isUpdating"
          color="warning"
          variant="subtle"
          icon="i-lucide-refresh-cw"
          :title="settings?.updatingTitle || 'Dữ liệu đang được cập nhật'"
          :description="settings?.updatingMessage || 'Thăng Long Hội đang chỉnh lại dữ liệu mùa. Một số nội dung có thể thay đổi trong ít phút tới.'"
          :ui="{
            root: 'border border-warning/30 bg-warning/10',
            icon: 'animate-spin'
          }"
        />

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          title="Không đọc được dữ liệu"
          :description="error.message"
        />

        <template v-else>
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

          <SourceStats
            :summary-stats="topStats"
            :stats="publicStats"
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
      :detail="selectedTeamDetail"
      :pending="detailPending"
      :copied-team-id="copiedTeamId"
      @share-team="shareTeam"
    />
  </div>
</template>
