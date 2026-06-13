<script setup lang="ts">
import type { SeasonTeamBuild, SeasonTeamLineupRow } from '../../shared/types/season-guide'

const props = defineProps<{
  builds: SeasonTeamBuild[]
  lineup: SeasonTeamLineupRow[]
}>()

const groupedBuilds = computed(() => {
  const lineup = Array.isArray(props.lineup) ? props.lineup : []
  const fallbackBuilds = lineup.reduce<SeasonTeamBuild[]>((items, row) => {
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

  const builds = Array.isArray(props.builds) && props.builds.length ? props.builds : fallbackBuilds

  return builds.map(build => ({
    ...build,
    rows: lineup.filter(row => row.buildId === build.id)
  })).filter(build => build.rows.length)
})

function tacticText(row: SeasonTeamLineupRow) {
  return [row.tactic1, row.tactic2].filter(Boolean).join(' + ') || 'Chưa khóa chiến pháp'
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="build in groupedBuilds"
      :key="build.id"
      class="overflow-hidden rounded-lg border border-default"
    >
      <div class="divide-y divide-default">
        <div
          v-for="row in build.rows"
          :key="`${build.id}-${row.general}-${row.tactic1}-${row.tactic2}`"
          class="grid gap-4 p-4 lg:grid-cols-[160px_minmax(0,1.1fr)_minmax(0,1fr)_180px]"
        >
          <div>
            <p class="font-semibold text-highlighted">
              {{ row.general || 'Slot' }}
            </p>
          </div>

          <div class="leading-6 text-default">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              Chiến pháp
            </p>
            <p class="mt-1 font-medium">
              {{ tacticText(row) }}
            </p>
          </div>

          <div class="leading-6 text-default">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              Binh thư
            </p>
            <p class="mt-1">
              {{ row.battleBook || 'Chưa có dữ liệu binh thư.' }}
            </p>
          </div>

          <div class="leading-6 text-default">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              Cộng điểm
            </p>
            <p class="mt-1">
              {{ row.attribute || '-' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="!groupedBuilds.length"
      class="rounded-lg border border-default p-4 text-sm text-muted"
    >
      Chưa đủ dữ liệu chiến pháp.
    </div>
  </div>
</template>
