<script setup lang="ts">
import type { SeasonSummary } from '../../shared/types/season-guide'

defineProps<{
  teamCount: number
  seasons: SeasonSummary[]
  activeSeasonSlug: string
}>()
</script>

<template>
  <UDashboardSidebar
    class="!w-72 bg-default"
    :ui="{
      root: 'sticky top-[var(--ui-header-height)] hidden lg:flex h-[calc(100vh-var(--ui-header-height))] min-h-0 !w-72 shrink-0 flex-col border-e border-default',
      header: 'h-auto shrink-0 px-4 py-4',
      body: 'flex-1 overflow-y-auto px-3 pb-4 pt-0',
      footer: 'border-t border-default px-4 py-3'
    }"
  >
    <template #header>
      <div class="w-full">
        <p class="text-sm font-semibold uppercase tracking-wide text-muted">
          Mùa giải
        </p>
      </div>
    </template>

    <nav>
      <NuxtLink
        v-for="season in seasons"
        :key="season.slug"
        :to="{ query: { season: season.slug } }"
        class="block rounded-lg border px-3 py-3 shadow-sm"
        :class="season.slug === activeSeasonSlug ? 'border-primary/25 bg-primary/15 text-primary' : 'border-default bg-elevated/40 text-default hover:bg-elevated'"
      >
        <div class="flex items-start gap-3">
          <span
            class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md shadow-sm"
            :class="season.slug === activeSeasonSlug ? 'bg-primary text-white' : 'bg-default text-muted'"
          >
            <UIcon
              name="i-lucide-book-open-text"
              class="size-5"
            />
          </span>
          <span class="min-w-0 flex-1">
            <span class="font-semibold text-highlighted">{{ season.name }}</span>
            <span class="mt-1 block text-sm font-medium text-primary">{{ teamCount }} đội hình</span>
          </span>
        </div>
      </NuxtLink>
    </nav>
  </UDashboardSidebar>
</template>
