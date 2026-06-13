<script setup lang="ts">
import type { SeasonTeam, SeasonTeamDetail } from '../../shared/types/season-guide'
import { badgeColor, paragraphs, percentText, teamId } from '../utils/season-guide'

const props = defineProps<{
  team: SeasonTeam | null
  detail: SeasonTeamDetail | null
  pending: boolean
  copiedTeamId: string
}>()

const emit = defineEmits<{
  shareTeam: [team: SeasonTeam]
}>()

const open = defineModel<boolean>('open', { default: false })

const detailVariants = computed(() => props.detail?.variants ?? props.team?.variants.map(variant => ({
  title: variant.general,
  value: variant.tactics,
  note: variant.alternatives.join('\n')
})) ?? [])

const alternatives = computed(() => props.detail?.alternatives ?? props.team?.alternatives ?? [])
const analysisBlocks = computed(() => props.detail?.analysis ?? [
  { title: 'Cách đội hoạt động', value: props.team?.analysis ?? '' },
  { title: 'Phản biện cần đọc', value: props.team?.objections ?? '' }
].filter(item => item.value))
const authorNotes = computed(() => props.detail?.authorNotes ?? paragraphs(props.team?.authorNotes ?? ''))
</script>

<template>
  <USlideover
    v-model:open="open"
    side="right"
    :title="team?.name || 'Chi tiết đội hình'"
    :description="team?.group || ''"
    :ui="{
      content: '!inset-3 !h-auto !w-auto !max-w-none !rounded-xl !overflow-hidden sm:!inset-y-4 sm:!right-4 sm:!left-auto sm:!w-[min(780px,calc(100vw-2rem))]',
      header: 'px-5 py-4 pr-16 sm:px-6 sm:pr-16',
      body: '!p-0 overflow-y-auto'
    }"
  >
    <template #body>
      <div
        v-if="team"
        class="min-h-full bg-default"
      >
        <div class="border-b border-default bg-default p-5 sm:p-6">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              color="primary"
              variant="solid"
            >
              #{{ team.rank }}
            </UBadge>
            <UBadge
              color="neutral"
              variant="soft"
            >
              {{ team.group }}
            </UBadge>
            <UBadge
              :color="badgeColor(team.reliability)"
              variant="subtle"
            >
              {{ team.reliability }}
            </UBadge>
            <UBadge
              color="neutral"
              variant="outline"
            >
              {{ team.usesDoyu }}
            </UBadge>
          </div>

          <p
            v-if="team.chineseNames"
            class="mt-2 text-sm text-muted"
          >
            {{ team.chineseNames }}
          </p>

          <div class="mt-4">
            <UButton
              color="primary"
              variant="soft"
              :icon="copiedTeamId === teamId(team) ? 'i-lucide-check' : 'i-lucide-share-2'"
              class="cursor-pointer"
              @click="emit('shareTeam', team)"
            >
              {{ copiedTeamId === teamId(team) ? 'Đã copy link' : 'Chia sẻ đội hình' }}
            </UButton>
          </div>

          <div class="mt-4 grid grid-cols-3 gap-2 text-center">
            <div class="rounded-lg border border-default bg-success/10 p-3">
              <p class="text-xl font-bold text-success">
                {{ percentText(team.supportPercent) }}
              </p>
              <p class="mt-1 text-xs text-muted">
                Ủng hộ
              </p>
            </div>
            <div class="rounded-lg border border-default bg-warning/10 p-3">
              <p class="text-xl font-bold text-warning">
                {{ percentText(team.neutralPercent) }}
              </p>
              <p class="mt-1 text-xs text-muted">
                Trung lập
              </p>
            </div>
            <div class="rounded-lg border border-default bg-error/10 p-3">
              <p class="text-xl font-bold text-error">
                {{ percentText(team.objectionPercent) }}
              </p>
              <p class="mt-1 text-xs text-muted">
                Phản biện
              </p>
            </div>
          </div>
        </div>

        <div>
          <div
            v-if="pending"
            class="space-y-6 p-5 sm:p-6"
          >
            <section>
              <div class="flex items-center gap-2">
                <USkeleton class="h-4 w-1 rounded-full" />
                <USkeleton class="h-6 w-48" />
              </div>
              <div class="mt-4 divide-y divide-default rounded-lg border border-default">
                <div
                  v-for="item in 3"
                  :key="item"
                  class="grid gap-3 p-4 sm:grid-cols-[150px_minmax(0,1fr)]"
                >
                  <USkeleton class="h-6 w-28" />
                  <div class="space-y-2">
                    <USkeleton class="h-5 w-full" />
                    <USkeleton class="h-5 w-2/3" />
                  </div>
                </div>
              </div>
            </section>

            <section
              v-for="section in 3"
              :key="section"
              class="space-y-3"
            >
              <div class="flex items-center gap-2">
                <USkeleton class="h-4 w-1 rounded-full" />
                <USkeleton class="h-6 w-44" />
              </div>
              <div class="space-y-2">
                <USkeleton class="h-5 w-full" />
                <USkeleton class="h-5 w-full" />
                <USkeleton class="h-5 w-5/6" />
              </div>
            </section>
          </div>

          <template v-else>
            <section class="border-b border-default p-5 sm:p-6">
              <h3 class="section-title">
                Đội hình và chiến pháp
              </h3>

              <div class="mt-4 divide-y divide-default rounded-lg border border-default">
                <div
                  v-for="variant in detailVariants"
                  :key="`${variant.title}-${variant.value}-${variant.note}`"
                  class="grid gap-2 p-4 sm:grid-cols-[150px_minmax(0,1fr)]"
                >
                  <div class="font-semibold text-highlighted">
                    {{ variant.title || 'Biến thể' }}
                  </div>
                  <div class="leading-6 text-default">
                    {{ variant.value || 'Chưa đủ dữ liệu chiến pháp.' }}
                  </div>
                </div>

                <div
                  v-if="!detailVariants.length"
                  class="p-4 text-sm text-muted"
                >
                  Chưa đủ dữ liệu chiến pháp.
                </div>
              </div>
            </section>

            <section
              v-for="block in analysisBlocks"
              :key="block.title"
              class="border-b border-default p-5 sm:p-6"
            >
              <h3 class="section-title">
                {{ block.title }}
              </h3>
              <p
                v-for="item in paragraphs(block.value)"
                :key="item"
                class="mt-3 leading-7 text-default"
              >
                {{ item }}
              </p>
            </section>

            <section
              v-if="alternatives.length"
              class="border-b border-default p-5 sm:p-6"
            >
              <h3 class="section-title">
                Chiến pháp thay thế / tranh cãi
              </h3>
              <ul class="mt-3 space-y-2">
                <li
                  v-for="item in alternatives"
                  :key="item"
                  class="flex gap-2 text-sm leading-6 text-muted"
                >
                  <UIcon
                    name="i-lucide-dot"
                    class="mt-0.5 size-5 shrink-0 text-primary"
                  />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>

            <section
              v-if="authorNotes.length"
              class="p-5 sm:p-6"
            >
              <h3 class="section-title">
                Ghi nhận từ tác giả / thảo luận
              </h3>
              <p
                v-for="item in authorNotes"
                :key="item"
                class="mt-3 leading-7 text-muted"
              >
                {{ item }}
              </p>
            </section>
          </template>
        </div>
      </div>
    </template>
  </USlideover>
</template>
