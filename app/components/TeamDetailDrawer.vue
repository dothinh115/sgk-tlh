<script setup lang="ts">
import type { SeasonTeam } from '../../shared/types/season-guide'
import { badgeColor, paragraphs, percentText, teamId } from '../utils/season-guide'

defineProps<{
  team: SeasonTeam | null
  copiedTeamId: string
}>()

const emit = defineEmits<{
  shareTeam: [team: SeasonTeam]
}>()

const open = defineModel<boolean>('open', { default: false })
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
          <section class="border-b border-default p-5 sm:p-6">
            <h3 class="section-title">
              Đội hình và chiến pháp
            </h3>

            <div class="mt-4 divide-y divide-default rounded-lg border border-default">
              <div
                v-for="variant in team.variants"
                :key="`${variant.general}-${variant.tactics}`"
                class="grid gap-2 p-4 sm:grid-cols-[150px_minmax(0,1fr)]"
              >
                <div class="font-semibold text-highlighted">
                  {{ variant.general || 'Biến thể' }}
                </div>
                <div class="leading-6 text-default">
                  {{ variant.tactics || 'Chưa đủ dữ liệu chiến pháp.' }}
                </div>
              </div>
            </div>
          </section>

          <section
            v-if="team.analysis"
            class="border-b border-default p-5 sm:p-6"
          >
            <h3 class="section-title">
              Cách đội hoạt động
            </h3>
            <p
              v-for="item in paragraphs(team.analysis)"
              :key="item"
              class="mt-3 leading-7 text-default"
            >
              {{ item }}
            </p>
          </section>

          <section
            v-if="team.alternatives.length"
            class="border-b border-default p-5 sm:p-6"
          >
            <h3 class="section-title">
              Chiến pháp thay thế / tranh cãi
            </h3>
            <ul class="mt-3 space-y-2">
              <li
                v-for="item in team.alternatives"
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
            v-if="team.objections"
            class="border-b border-default p-5 sm:p-6"
          >
            <h3 class="section-title">
              Phản biện cần đọc
            </h3>
            <p
              v-for="item in paragraphs(team.objections)"
              :key="item"
              class="mt-3 leading-7 text-muted"
            >
              {{ item }}
            </p>
          </section>

          <section
            v-if="team.authorNotes"
            class="p-5 sm:p-6"
          >
            <h3 class="section-title">
              Ghi nhận từ tác giả / thảo luận
            </h3>
            <p
              v-for="item in paragraphs(team.authorNotes)"
              :key="item"
              class="mt-3 leading-7 text-muted"
            >
              {{ item }}
            </p>
          </section>
        </div>
      </div>
    </template>
  </USlideover>
</template>
