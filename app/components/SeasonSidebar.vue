<script setup lang="ts">
import type { KhaiHoangMenu, SeasonSummary } from '../../shared/types/season-guide'

const props = defineProps<{
  seasons: SeasonSummary[]
  khaiHoangMenus?: KhaiHoangMenu[]
  activeSeasonSlug: string
  activeKhaiHoangKind?: string
}>()

const openGroups = useCookie<string[]>('thang-long-sidebar-open-groups', {
  default: () => ['seasons', 'starter']
})

const accordionItems = [
  {
    label: 'Mùa giải',
    icon: 'i-lucide-calendar-days',
    value: 'seasons'
  },
  {
    label: 'Khai hoang',
    icon: 'i-lucide-sprout',
    value: 'starter'
  }
]

const seasonItems = computed(() => props.seasons.map(season => ({
  label: season.name,
  icon: 'i-lucide-book-open-text',
  to: `/seasons/${season.slug}`,
  active: season.slug === props.activeSeasonSlug
})))

const starterItems = computed(() => {
  const menus = props.khaiHoangMenus?.length
    ? props.khaiHoangMenus
    : [
        { slug: 'doi-hinh', name: 'Đội hình' },
        { slug: 'cham-su', name: 'Chạm sứ' }
      ]

  return menus.map(menu => ({
    label: menu.name,
    icon: menu.slug === 'cham-su' ? 'i-lucide-gem' : 'i-lucide-users',
    to: `/khai-hoang/${menu.slug}`,
    active: menu.slug === props.activeKhaiHoangKind
  }))
})
</script>

<template>
  <aside class="sticky top-[var(--ui-header-height)] hidden h-[calc(100vh-var(--ui-header-height))] min-h-0 w-72 shrink-0 flex-col border-e border-default bg-default lg:flex">
    <nav class="flex-1 overflow-y-auto px-4 py-6">
      <UAccordion
        v-model="openGroups"
        type="multiple"
        :items="accordionItems"
        class="w-full"
        :ui="{
          item: 'border-b-0',
          trigger: 'rounded-lg px-2.5 py-2.5 text-base hover:bg-elevated/60',
          body: 'pb-3 pl-5'
        }"
      >
        <template #body="{ item }">
          <UNavigationMenu
            orientation="vertical"
            :items="item.value === 'seasons' ? seasonItems : starterItems"
            highlight
            class="w-full"
          />
        </template>
      </UAccordion>
    </nav>
  </aside>
</template>
