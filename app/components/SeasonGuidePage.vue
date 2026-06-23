<script setup lang="ts">
import type { SeasonGuidePayload, SeasonTeam } from '../../shared/types/season-guide'
import { teamId } from '../utils/season-guide'

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const requestUrl = useRequestURL()
const toast = useToast()
const copiedTeamId = ref('')
const routeSeason = computed(() => paramValue(route.params.season))
const routeTeam = computed(() => paramValue(route.params.team))
const detailOpen = ref(Boolean(routeTeam.value))
const hydrated = ref(false)
const initialTeamRoute = ref(Boolean(routeTeam.value))
let copiedResetTimer: ReturnType<typeof setTimeout> | undefined

const seasonGuideKey = computed(() => `season-guide:${routeSeason.value || 'default'}`)
const seasonGuideQuery = computed(() => routeSeason.value ? { season: routeSeason.value } : undefined)

const { data, error, status } = await useApiData<SeasonGuidePayload>(config.public.seasonApiBase, {
  key: seasonGuideKey,
  query: seasonGuideQuery,
  watch: [routeSeason]
})

const teams = computed(() => data.value?.teams ?? [])
const settings = computed(() => data.value?.settings)
const isUpdating = computed(() => settings.value?.updating ?? false)
const seasons = computed(() => data.value?.seasons ?? [])
const activeSeasonSlug = computed(() => routeSeason.value || data.value?.activeSeasonSlug || seasons.value[0]?.slug || '')
const activeSeason = computed(() => seasons.value.find(season => season.slug === activeSeasonSlug.value))
const seasonName = computed(() => activeSeason.value?.name || 'Anh Hùng Mệnh Thế')
const seasonTitle = computed(() => activeSeason.value?.title || `Sách giáo khoa đội hình ${seasonName.value}`)
const routeSelectedTeam = computed(() => routeTeam.value
  ? teams.value.find(team => teamId(team) === routeTeam.value) || null
  : null)
const selectedTeam = computed(() => routeSelectedTeam.value)
const detailLoading = computed(() => Boolean(routeTeam.value && !selectedTeam.value && status.value === 'pending' && !error.value && !isUpdating.value))
const showInitialDetailFallback = computed(() => Boolean(routeTeam.value && selectedTeam.value && !hydrated.value && !isUpdating.value))
const instantDetailOpen = computed(() => Boolean(initialTeamRoute.value && routeTeam.value))
const seoTeam = computed(() => selectedTeam.value)
const pageTitle = computed(() => {
  if (seoTeam.value) {
    const tier = seoTeam.value.tier ? ` ${seoTeam.value.tier}` : ''

    return `${seoTeam.value.name}${tier} | ${seasonName.value} | Thăng Long Hội`
  }

  return `${seasonTitle.value} | Thăng Long Hội`
})
const pageDescription = computed(() => {
  if (isUpdating.value) {
    return settings.value?.updatingMessage || 'Thăng Long Hội đang cập nhật dữ liệu đội hình.'
  }

  if (seoTeam.value) {
    const team = seoTeam.value
    const generals = team.lineup.map(row => row.general).filter(Boolean).slice(0, 3).join(' · ')
    const labels = [
      team.tier ? `Tier ${team.tier}` : '',
      team.factions.length ? team.factions.join('/') : '',
      team.troopTypes.length ? team.troopTypes.join('/') : '',
      team.tags.length ? team.tags.join(', ') : ''
    ].filter(Boolean).join(' · ')
    const detail = [generals, labels].filter(Boolean).join('. ')

    return truncateMeta(`${team.name}: ${detail}. Xem tướng, chiến pháp, binh thư, cộng điểm, phân tích, phản biện và ghi chú.`)
  }

  return truncateMeta(`Danh sách ${teams.value.length || ''} đội hình mùa ${seasonName.value}: tướng, chiến pháp, binh thư, cộng điểm, bái sư, phân tích và ghi chú.`)
})
const canonicalUrl = computed(() => new URL(route.path, requestUrl.origin).toString())

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

useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  ogTitle: () => pageTitle.value,
  ogDescription: () => pageDescription.value,
  ogUrl: () => canonicalUrl.value,
  twitterTitle: () => pageTitle.value,
  twitterDescription: () => pageDescription.value,
  twitterCard: 'summary_large_image'
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: canonicalUrl.value }
  ]
}))

onMounted(() => {
  window.requestAnimationFrame(() => {
    hydrated.value = true
  })
})

function openTeam(team: SeasonTeam) {
  syncTeamPath(team)
}

function syncTeamPath(team: SeasonTeam) {
  const nextTeam = teamId(team)
  const nextSeason = activeSeasonSlug.value

  if (routeTeam.value === nextTeam && routeSeason.value === nextSeason) {
    detailOpen.value = true
    return
  }

  router.push(`/seasons/${nextSeason}/${nextTeam}`)
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

watch(routeTeam, (currentTeam) => {
  if (!currentTeam) {
    detailOpen.value = false
    return
  }

  detailOpen.value = true
}, { immediate: true })

watch(detailOpen, (open) => {
  if (!open && routeTeam.value) {
    clearTeamPath()
  }
})

function paramValue(value: unknown): string {
  return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')
}

function truncateMeta(value: string) {
  const normalized = value.replace(/\s+/g, ' ').trim()

  return normalized.length > 180 ? `${normalized.slice(0, 177).trim()}...` : normalized
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

    <TeamDetailDrawer
      v-model:open="detailOpen"
      :team="selectedTeam"
      :loading="detailLoading"
      :instant="instantDetailOpen"
      :copied-team-id="copiedTeamId"
      @share-team="shareTeam"
    />

    <div
      v-if="showInitialDetailFallback"
      class="fixed inset-0 z-[60] bg-elevated/75"
    >
      <div class="absolute inset-3 flex flex-col overflow-hidden rounded-xl bg-default shadow-xl sm:inset-y-4 sm:right-4 sm:left-auto sm:w-[min(860px,calc(100vw-2rem))]">
        <div class="border-b border-default px-5 py-4 pr-16 sm:px-6 sm:pr-16">
          <h2 class="text-base font-semibold text-highlighted">
            {{ selectedTeam?.name }}
          </h2>
          <p class="text-sm text-muted">
            {{ selectedTeam?.tier || '' }}
          </p>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto">
          <TeamDetailContent
            v-if="selectedTeam"
            :team="selectedTeam"
            :copied-team-id="copiedTeamId"
            @share-team="shareTeam"
          />
        </div>
      </div>
    </div>
  </div>
</template>
