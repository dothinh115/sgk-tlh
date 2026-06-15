<script setup lang="ts">
import type { KhaiHoangChamSuRow, KhaiHoangDoiHinhRow, KhaiHoangMenu, KhaiHoangPayload } from '../../shared/types/season-guide'

const route = useRoute()
const requestUrl = useRequestURL()
const activeKind = computed(() => paramValue(route.params.kind) || 'doi-hinh')
const search = ref('')

const khaiHoangKey = computed(() => `khai-hoang:${activeKind.value}`)
const khaiHoangQuery = computed(() => ({ kind: activeKind.value }))

const { data, error } = await useApiData<KhaiHoangPayload>('/api/khai-hoang', {
  key: khaiHoangKey,
  query: khaiHoangQuery,
  watch: [activeKind]
})

const seasons = computed(() => data.value?.seasons ?? [])
const khaiHoangMenus: KhaiHoangMenu[] = [
  { slug: 'doi-hinh', name: 'Đội hình' },
  { slug: 'cham-su', name: 'Chạm sứ' }
]
const items = computed(() => data.value?.items ?? [])
const visibleItems = computed(() => {
  const keyword = normalizeSearch(search.value)

  if (!keyword) {
    return items.value
  }

  return items.value.filter((item) => {
    const values = [
      item.name,
      item.notes,
      ...item.transformTo,
      ...item.lineup.flatMap((row) => {
        const record = row as unknown as Record<string, string>

        return Object.values(record)
      })
    ]

    return values.some(value => normalizeSearch(value).includes(keyword))
  })
})
const isChamSu = computed(() => activeKind.value === 'cham-su')
const title = computed(() => data.value?.menu?.name || (isChamSu.value ? 'Chạm sứ' : 'Đội hình khai hoang'))
const pageTitle = computed(() => `${title.value} khai hoang | Thăng Long Hội`)
const pageDescription = computed(() => {
  if (isChamSu.value) {
    return truncateMeta(`Danh sách ${items.value.length || ''} đội chạm sứ: võ tướng, chiến pháp và ghi chú chuyển khai hoang cho Tam Quốc Chí Chiến Lược.`)
  }

  return truncateMeta(`Danh sách ${items.value.length || ''} đội khai hoang: võ tướng, chiến pháp trước cấp 20, sau cấp 20, chuyển hình và ghi chú.`)
})
const canonicalUrl = computed(() => new URL(route.path, requestUrl.origin).toString())

useSeoMeta({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  ogTitle: () => pageTitle.value,
  ogDescription: () => pageDescription.value,
  ogUrl: () => canonicalUrl.value,
  twitterTitle: () => pageTitle.value,
  twitterDescription: () => pageDescription.value,
  twitterCard: 'summary_large_image'
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: canonicalUrl.value }
  ]
}))

function doiHinhRows(lineup: KhaiHoangPayload['items'][number]['lineup']) {
  return lineup as KhaiHoangDoiHinhRow[]
}

function chamSuRows(lineup: KhaiHoangPayload['items'][number]['lineup']) {
  return lineup as KhaiHoangChamSuRow[]
}

function noteItems(notes: string) {
  return notes.split(/\n+/).map(item => item.trim()).filter(Boolean)
}

function paramValue(value: unknown): string {
  return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function truncateMeta(value: string) {
  const normalized = value.replace(/\s+/g, ' ').trim()

  return normalized.length > 180 ? `${normalized.slice(0, 177).trim()}...` : normalized
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-var(--ui-header-height))]">
    <SeasonSidebar
      :seasons="seasons"
      :khai-hoang-menus="khaiHoangMenus"
      active-season-slug=""
      :active-khai-hoang-kind="activeKind"
    />

    <main class="min-w-0 flex-1">
      <div class="w-full space-y-5 p-4 sm:p-5 lg:p-6">
        <section class="rounded-xl border border-default bg-default p-5 shadow-sm">
          <UBadge
            color="primary"
            variant="subtle"
          >
            Khai hoang
          </UBadge>
          <h1 class="mt-3 text-2xl font-bold tracking-normal text-highlighted sm:text-3xl">
            {{ title }}
          </h1>
          <p class="mt-2 max-w-2xl leading-7 text-muted">
            {{ isChamSu ? 'Đội chạm sứ, võ tướng, chiến pháp và ghi chú.' : 'Đội khai hoang, chiến pháp trước cấp 20, sau cấp 20 và hướng chuyển hình.' }}
          </p>
          <p class="mt-3 text-sm font-medium text-primary">
            {{ visibleItems.length }} đội
          </p>
        </section>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          title="Không đọc được dữ liệu"
          :description="error.message"
        />

        <section class="overflow-hidden rounded-xl border border-default bg-default shadow-sm">
          <div class="border-b border-default p-4">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              size="lg"
              placeholder="Tìm đội, tướng, chiến pháp, chuyển hình, ghi chú..."
              :ui="{ root: 'w-full', base: 'h-11' }"
            />
          </div>

          <article
            v-for="item in visibleItems"
            :key="item.slug"
            class="border-b border-default p-4 last:border-b-0 sm:p-5"
          >
            <div>
              <h2 class="text-lg font-semibold text-highlighted">
                {{ item.name }}
              </h2>
              <p
                v-if="item.transformTo.length"
                class="mt-1 text-sm text-muted"
              >
                Chuyển hình: {{ item.transformTo.join(' · ') }}
              </p>
            </div>

            <div class="mt-4 overflow-hidden rounded-lg border border-default">
              <div
                v-if="isChamSu"
                class="divide-y divide-default"
              >
                <div
                  v-for="row in chamSuRows(item.lineup)"
                  :key="`${item.slug}-${row.general}`"
                  class="grid gap-2 p-3 sm:grid-cols-[180px_1fr]"
                >
                  <p class="font-semibold text-highlighted">
                    {{ row.general }}
                  </p>
                  <p class="text-default">
                    {{ row.tactic }}
                  </p>
                </div>
              </div>

              <div
                v-else
                class="divide-y divide-default"
              >
                <div
                  v-for="row in doiHinhRows(item.lineup)"
                  :key="`${item.slug}-${row.general}`"
                  class="grid gap-3 p-3 lg:grid-cols-[150px_1fr_1fr]"
                >
                  <p class="font-semibold text-highlighted">
                    {{ row.general }}
                  </p>
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                      Trước cấp 20
                    </p>
                    <p class="mt-1 text-default">
                      {{ row.before20 }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                      Sau cấp 20
                    </p>
                    <p class="mt-1 text-default">
                      {{ row.after20 }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ul
              v-if="noteItems(item.notes).length"
              class="mt-4 space-y-2"
            >
              <li
                v-for="note in noteItems(item.notes)"
                :key="note"
                class="flex gap-2 text-sm leading-6 text-muted"
              >
                <UIcon
                  name="i-lucide-dot"
                  class="mt-0.5 size-5 shrink-0 text-primary"
                />
                <span>{{ note }}</span>
              </li>
            </ul>
          </article>

          <UEmpty
            v-if="search && !visibleItems.length"
            icon="i-lucide-search-x"
            title="Không tìm thấy đội"
            description="Thử tìm theo tên đội, tướng, chiến pháp, chuyển hình hoặc ghi chú."
          />
        </section>
      </div>
    </main>
  </div>
</template>
