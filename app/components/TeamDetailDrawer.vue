<script setup lang="ts">
import type { SeasonTeam } from '../../shared/types/season-guide'

defineProps<{
  team: SeasonTeam | null
  loading: boolean
  copiedTeamId: string
}>()

const emit = defineEmits<{
  shareTeam: [team: SeasonTeam]
}>()

const open = defineModel<boolean>('open', { default: false })

function closeDrawer() {
  open.value = false
}
</script>

<template>
  <Transition
    name="team-detail-drawer"
    appear
  >
    <div
      v-if="open"
      class="fixed inset-0 z-50 bg-elevated/75"
      @click.self="closeDrawer"
    >
      <section
        role="dialog"
        aria-modal="true"
        :aria-label="team?.name || (loading ? 'Đang tải đội hình' : 'Không tìm thấy đội hình')"
        class="absolute inset-3 flex flex-col overflow-hidden rounded-xl bg-default shadow-xl ring ring-default sm:inset-y-4 sm:right-4 sm:left-auto sm:w-[min(860px,calc(100vw-2rem))]"
      >
        <header class="relative border-b border-default px-5 py-4 pr-16 sm:px-6 sm:pr-16">
          <h2 class="text-base font-semibold text-highlighted">
            {{ team?.name || (loading ? 'Đang tải đội hình' : 'Không tìm thấy đội hình') }}
          </h2>
          <p
            v-if="team?.tier"
            class="mt-1 text-sm text-muted"
          >
            {{ team.tier }}
          </p>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            aria-label="Đóng chi tiết đội hình"
            class="absolute top-3 right-3 cursor-pointer"
            @click="closeDrawer"
          />
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto">
          <TeamDetailContent
            v-if="team"
            :team="team"
            :copied-team-id="copiedTeamId"
            @share-team="emit('shareTeam', $event)"
          />

          <div
            v-else
            class="flex min-h-full flex-col items-center justify-center gap-3 bg-default p-8 text-center"
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
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.team-detail-drawer-enter-active,
.team-detail-drawer-leave-active {
  transition: opacity 180ms ease;
}

.team-detail-drawer-enter-active [role="dialog"],
.team-detail-drawer-leave-active [role="dialog"] {
  transition: transform 220ms ease, opacity 220ms ease;
}

.team-detail-drawer-enter-from,
.team-detail-drawer-leave-to {
  opacity: 0;
}

.team-detail-drawer-enter-from [role="dialog"],
.team-detail-drawer-leave-to [role="dialog"] {
  opacity: 0;
  transform: translateX(24px);
}
</style>
