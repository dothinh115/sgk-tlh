<script setup lang="ts">
import type { KhaiHoangMenu, SeasonGuideMetaPayload } from '../shared/types/season-guide'
import { getPrimaryColorPreflightScript } from '~/utils/primary-colors'

const config = useRuntimeConfig()
const route = useRoute()
const title = 'Sách giáo khoa Anh Hùng Mệnh Thế'
const description = 'Bản tổng hợp đội hình, chiến pháp, đồng thuận và phản biện cộng đồng cho mùa Anh Hùng Mệnh Thế.'
const primaryColorPreflight = getPrimaryColorPreflightScript()
const sidebarOpen = ref(false)
const defaultKhaiHoangMenus: KhaiHoangMenu[] = [
  { slug: 'doi-hinh', name: 'Đội hình' },
  { slug: 'cham-su', name: 'Chạm sứ' }
]

const { data: shellData } = await useApiData<SeasonGuideMetaPayload>(config.public.seasonApiBase, {
  key: 'season-guide-meta-shell',
  query: { mode: 'seasons' }
})

const shellSeasons = computed(() => shellData.value?.seasons ?? [])
const shellKhaiHoangMenus = computed(() => shellData.value?.khaiHoangMenus?.length
  ? shellData.value.khaiHoangMenus
  : defaultKhaiHoangMenus)
const activeSeasonSlug = computed(() => route.path.startsWith('/seasons/')
  ? paramValue(route.params.season)
  : '')
const activeKhaiHoangKind = computed(() => route.path.startsWith('/khai-hoang/')
  ? paramValue(route.params.kind)
  : '')

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  script: [
    {
      innerHTML: primaryColorPreflight,
      tagPosition: 'head'
    }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'vi'
  }
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})

watch(() => route.fullPath, () => {
  sidebarOpen.value = false
})

function paramValue(value: unknown): string {
  return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')
}
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator
      color="var(--ui-primary)"
      :height="3"
    />

    <div class="min-h-screen bg-elevated/55 text-default">
      <UHeader
        :toggle="false"
        :ui="{
          root: 'border-b border-default bg-default/90 backdrop-blur supports-[backdrop-filter]:bg-default/80',
          container: 'max-w-none !mx-0 !px-0',
          left: 'flex items-center gap-1.5',
          right: 'flex items-center justify-end gap-1 px-4'
        }"
      >
        <template #left>
          <UButton
            class="ms-2 lg:hidden"
            icon="i-lucide-panel-left-open"
            color="neutral"
            variant="ghost"
            aria-label="Mở menu"
            @click="sidebarOpen = true"
          />

          <NuxtLink
            to="/"
            class="flex h-full items-center gap-3 px-2 sm:px-4"
          >
            <div class="flex size-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <UIcon
                name="i-lucide-book-open-text"
                class="size-5"
              />
            </div>
            <div class="leading-tight">
              <p class="font-semibold text-highlighted">
                Thăng Long Hội
              </p>
              <p class="hidden text-xs text-muted sm:block">
                Tam Quốc Chí Chiến Lược
              </p>
            </div>
          </NuxtLink>
        </template>

        <template #right>
          <ThemeControls />
        </template>
      </UHeader>

      <UMain>
        <NuxtPage />
      </UMain>

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
            :seasons="shellSeasons"
            :khai-hoang-menus="shellKhaiHoangMenus"
            :active-season-slug="activeSeasonSlug"
            :active-khai-hoang-kind="activeKhaiHoangKind"
            @navigate="sidebarOpen = false"
          />
        </template>
      </USlideover>
    </div>
  </UApp>
</template>
