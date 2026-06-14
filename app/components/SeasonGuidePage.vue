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
const routeSeason = computed(() => paramValue(route.params.season))
const routeTeam = computed(() => paramValue(route.params.team))
let copiedResetTimer: ReturnType<typeof setTimeout> | undefined

const { data, error } = await useAsyncData<SeasonGuidePayload>('season-guide', () => {
  return $fetch(config.public.seasonApiBase, {
    query: routeSeason.value ? { season: routeSeason.value } : undefined
  })
}, {
  watch: [routeSeason]
})

const teams = computed(() => data.value?.teams ?? [])
const settings = computed(() => data.value?.settings)
const isUpdating = computed(() => settings.value?.updating ?? false)
const seasons = computed(() => data.value?.seasons ?? [])
const activeSeasonSlug = computed(() => routeSeason.value || data.value?.activeSeasonSlug || seasons.value[0]?.slug || '')

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
  sidebarOpen.value = false
  syncTeamPath(team)
}

function syncTeamPath(team: SeasonTeam) {
  const nextTeam = teamId(team)
  const nextSeason = activeSeasonSlug.value

  if (routeTeam.value === nextTeam && routeSeason.value === nextSeason) {
    selectedTeam.value = team
    detailOpen.value = true
    return
  }

  router.replace(`/seasons/${nextSeason}/${nextTeam}`)
}

function clearTeamPath() {
  if (activeSeasonSlug.value) {
    router.replace(`/seasons/${activeSeasonSlug.value}`)
  }
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
  return `${window.location.origin}/seasons/${activeSeasonSlug.value}/${teamId(team)}`
}

watch([teams, routeTeam], ([currentTeams, currentTeam]) => {
  if (!currentTeams.length || !currentTeam) {
    return
  }

  const match = currentTeams.find(team => teamId(team) === currentTeam)

  if (match && (!selectedTeam.value || teamId(selectedTeam.value) !== teamId(match))) {
    selectedTeam.value = match
  }

  if (match && !detailOpen.value) {
    detailOpen.value = true
  }
}, { immediate: true })

watch(detailOpen, (open) => {
  if (!open && routeTeam.value) {
    clearTeamPath()
  }
})

watch(() => route.fullPath, () => {
  sidebarOpen.value = false
})

function paramValue(value: unknown): string {
  return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-var(--ui-header-height))]">
    <SeasonSidebar
      :seasons="seasons"
      :khai-hoang-menus="data?.khaiHoangMenus ?? []"
      :active-season-slug="activeSeasonSlug"
    />

    <main class="min-w-0 flex-1">
      <div class="w-full space-y-5 p-4 sm:p-5 lg:p-6">
        <div class="flex items-center gap-3 lg:hidden">
          <UButton
            icon="i-lucide-panel-left-open"
            color="neutral"
            variant="outline"
            @click="sidebarOpen = true"
          >
            Menu
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
      title="Menu"
      description="Chọn mùa hoặc mục khai hoang"
      :ui="{ content: 'w-screen max-w-full sm:max-w-sm', body: 'p-0' }"
    >
      <template #body>
        <SeasonSidebar
          class="!static !flex !h-full !w-full !border-e-0 lg:!hidden"
          :seasons="seasons"
          :khai-hoang-menus="data?.khaiHoangMenus ?? []"
          :active-season-slug="activeSeasonSlug"
          @navigate="sidebarOpen = false"
        />
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
