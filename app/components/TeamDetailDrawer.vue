<script setup lang="ts">
import type { SeasonTeam } from '../../shared/types/season-guide'

defineProps<{
  team: SeasonTeam | null
  loading: boolean
  instant: boolean
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
    :title="team?.name || (loading ? 'Đang tải đội hình' : 'Không tìm thấy đội hình')"
    :description="team?.tier || ''"
    :ui="{
      overlay: instant ? 'data-[state=open]:!animate-none data-[state=closed]:!animate-none' : '',
      content: [
        '!inset-3 !h-auto !w-auto !max-w-none !rounded-xl !overflow-hidden sm:!inset-y-4 sm:!right-4 sm:!left-auto sm:!w-[min(860px,calc(100vw-2rem))]',
        instant ? 'data-[state=open]:!animate-none data-[state=closed]:!animate-none' : ''
      ],
      header: 'px-5 py-4 pr-16 sm:px-6 sm:pr-16',
      body: '!p-0 overflow-y-auto'
    }"
  >
    <template #body>
      <TeamDetailContent
        v-if="team"
        :team="team"
        :copied-team-id="copiedTeamId"
        @share-team="emit('shareTeam', $event)"
      />

      <div
        v-else
        class="flex min-h-[360px] flex-col items-center justify-center gap-3 bg-default p-8 text-center"
      >
        <UIcon
          :name="loading ? 'i-lucide-loader-circle' : 'i-lucide-search-x'"
          class="size-8 text-muted"
          :class="{ 'animate-spin': loading }"
        />
        <div>
          <h3 class="font-semibold text-highlighted">
            {{ loading ? 'Đang tải đội hình' : 'Không tìm thấy đội hình' }}
          </h3>
          <p class="mt-1 max-w-sm text-sm text-muted">
            {{ loading ? 'Nội dung chi tiết sẽ hiện ngay khi dữ liệu mùa sẵn sàng.' : 'Link này không khớp với đội hình nào trong mùa hiện tại.' }}
          </p>
        </div>
      </div>
    </template>
  </USlideover>
</template>
