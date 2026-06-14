<script setup lang="ts">
import type { SeasonGuideMetaPayload } from '../../shared/types/season-guide'

const config = useRuntimeConfig()

const { data } = await useApiData<SeasonGuideMetaPayload>(config.public.seasonApiBase, {
  key: 'season-guide-meta-shell',
  query: { mode: 'seasons' }
})

const seasons = computed(() => data.value?.seasons ?? [])
const khaiHoangMenus = computed(() => data.value?.khaiHoangMenus ?? [])
</script>

<template>
  <div class="flex min-h-[calc(100vh-var(--ui-header-height))]">
    <SeasonSidebar
      :seasons="seasons"
      :khai-hoang-menus="khaiHoangMenus"
      active-season-slug=""
    />

    <main class="min-w-0 flex-1">
      <div class="w-full space-y-5 p-4 sm:p-5 lg:p-6">
        <section class="rounded-xl border border-default bg-default p-5 shadow-sm sm:p-6">
          <UBadge
            color="primary"
            variant="subtle"
          >
            Thăng Long Hội
          </UBadge>
          <h1 class="mt-3 text-3xl font-bold tracking-normal text-highlighted">
            Sách giáo khoa Tam Quốc Chí Chiến Lược
          </h1>
          <p class="mt-2 max-w-2xl leading-7 text-muted">
            Chọn khu vực cần đọc trong menu hoặc mở nhanh các mục bên dưới.
          </p>
        </section>

        <section class="grid gap-4 md:grid-cols-3">
          <NuxtLink
            to="/seasons/anh-hung-menh-the"
            class="group rounded-xl border border-default bg-default p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <UIcon
              name="i-lucide-book-open-text"
              class="size-8 text-primary"
            />
            <h2 class="mt-4 text-lg font-semibold text-highlighted">
              Anh Hùng Mệnh Thế
            </h2>
            <p class="mt-2 text-sm leading-6 text-muted">
              Đội hình mùa, chiến pháp, binh thư, cộng điểm và ghi chú.
            </p>
          </NuxtLink>

          <NuxtLink
            to="/khai-hoang/doi-hinh"
            class="group rounded-xl border border-default bg-default p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <UIcon
              name="i-lucide-users"
              class="size-8 text-primary"
            />
            <h2 class="mt-4 text-lg font-semibold text-highlighted">
              Khai hoang đội hình
            </h2>
            <p class="mt-2 text-sm leading-6 text-muted">
              Trước cấp 20, sau cấp 20 và hướng chuyển hình.
            </p>
          </NuxtLink>

          <NuxtLink
            to="/khai-hoang/cham-su"
            class="group rounded-xl border border-default bg-default p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <UIcon
              name="i-lucide-gem"
              class="size-8 text-primary"
            />
            <h2 class="mt-4 text-lg font-semibold text-highlighted">
              Chạm sứ
            </h2>
            <p class="mt-2 text-sm leading-6 text-muted">
              Võ tướng, chiến pháp và ghi chú chuyển khai hoang.
            </p>
          </NuxtLink>
        </section>
      </div>
    </main>
  </div>
</template>
