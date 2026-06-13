<script setup lang="ts">
import type { CrawlStat } from '../../shared/types/season-guide'

defineProps<{
  summaryStats: Array<{
    label: string
    value: string
    icon: string
  }>
  stats: CrawlStat[]
}>()
</script>

<template>
  <section class="rounded-xl border border-default bg-default p-5 shadow-sm">
    <div class="flex items-center gap-2">
      <UIcon
        name="i-lucide-database"
        class="size-5 text-primary"
      />
      <h2 class="font-semibold text-highlighted">
        Nguồn dữ liệu
      </h2>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="item in summaryStats"
        :key="item.label"
        class="rounded-lg border border-default bg-elevated/40 p-4"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm text-muted">
            {{ item.label }}
          </p>
          <UIcon
            :name="item.icon"
            class="size-5 text-primary"
          />
        </div>
        <p class="mt-2 text-3xl font-semibold text-highlighted">
          {{ item.value }}
        </p>
      </div>
    </div>

    <div class="mt-4 grid gap-3 md:grid-cols-2">
      <div
        v-for="stat in stats"
        :key="`${stat.label}-${stat.value}`"
        class="rounded-lg border border-default bg-elevated/40 p-4"
      >
        <p class="text-sm text-muted">
          {{ stat.label }}
        </p>
        <p class="mt-2 leading-6 text-highlighted">
          {{ stat.value }}
        </p>
      </div>
    </div>
  </section>
</template>
