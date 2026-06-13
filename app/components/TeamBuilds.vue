<script setup lang="ts">
import type { SeasonTeamBuild, SeasonTeamLineupRow } from '../../shared/types/season-guide'

const props = defineProps<{
  builds: SeasonTeamBuild[]
  lineup: SeasonTeamLineupRow[]
}>()

const groupedBuilds = computed(() => {
  const fallbackBuilds = props.lineup.reduce<SeasonTeamBuild[]>((items, row) => {
    if (!items.some(item => item.id === row.buildId)) {
      items.push({
        id: row.buildId,
        name: row.buildName || 'Bản tham khảo',
        status: '',
        idea: '',
        source: ''
      })
    }

    return items
  }, [])

  const builds = props.builds.length ? props.builds : fallbackBuilds

  return builds.map(build => ({
    ...build,
    rows: props.lineup.filter(row => row.buildId === build.id)
  })).filter(build => build.rows.length || build.idea)
})

function tacticText(row: SeasonTeamLineupRow) {
  return [row.tactic1, row.tactic2].filter(Boolean).join(' + ') || 'Chưa khóa chiến pháp'
}
</script>

<template>
  <div class="space-y-4">
    <UCard
      v-for="build in groupedBuilds"
      :key="build.id"
      :ui="{ body: 'p-0 sm:p-0', header: 'p-4 sm:p-4' }"
    >
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="font-semibold text-highlighted">
                {{ build.name }}
              </h4>
              <UBadge
                v-if="build.status"
                color="primary"
                variant="subtle"
              >
                {{ build.status }}
              </UBadge>
            </div>
            <p
              v-if="build.idea"
              class="mt-1 text-sm leading-6 text-muted"
            >
              {{ build.idea }}
            </p>
          </div>
        </div>
      </template>

      <div class="divide-y divide-default">
        <div
          v-for="row in build.rows"
          :key="`${build.id}-${row.general}-${row.tactic1}-${row.tactic2}`"
          class="grid gap-3 p-4 lg:grid-cols-[150px_minmax(0,1fr)]"
        >
          <div>
            <p class="font-semibold text-highlighted">
              {{ row.general || 'Slot' }}
            </p>
            <p
              v-if="row.attribute"
              class="mt-1 text-xs text-muted"
            >
              {{ row.attribute }}
            </p>
          </div>

          <div class="space-y-2">
            <div class="rounded-lg border border-default bg-elevated/40 p-3">
              <p class="text-xs font-medium uppercase tracking-wide text-muted">
                Chiến pháp
              </p>
              <p class="mt-1 font-medium leading-6 text-default">
                {{ tacticText(row) }}
              </p>
            </div>

            <div class="grid gap-2 md:grid-cols-2">
              <div class="rounded-lg border border-default bg-muted/30 p-3">
                <p class="text-xs font-medium uppercase tracking-wide text-muted">
                  Binh thư
                </p>
                <p class="mt-1 text-sm leading-6 text-default">
                  {{ row.battleBook || 'Chưa có dữ liệu binh thư.' }}
                </p>
              </div>
              <div class="rounded-lg border border-default bg-muted/30 p-3">
                <p class="text-xs font-medium uppercase tracking-wide text-muted">
                  Vai trò
                </p>
                <p class="mt-1 text-sm leading-6 text-default">
                  {{ row.role || 'Theo vai trò đội' }}
                </p>
              </div>
            </div>

            <p
              v-if="row.note"
              class="text-sm leading-6 text-muted"
            >
              {{ row.note }}
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <div
      v-if="!groupedBuilds.length"
      class="rounded-lg border border-default p-4 text-sm text-muted"
    >
      Chưa đủ dữ liệu chiến pháp.
    </div>
  </div>
</template>
