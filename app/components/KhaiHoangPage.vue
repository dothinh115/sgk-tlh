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
const itemTones = [
  {
    badge: 'border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-300',
    before: 'border-sky-400/40 bg-sky-400/10 text-sky-700 dark:text-sky-300',
    after: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300'
  },
  {
    badge: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300',
    before: 'border-violet-400/40 bg-violet-400/10 text-violet-700 dark:text-violet-300',
    after: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-700 dark:text-cyan-300'
  },
  {
    badge: 'border-rose-400/40 bg-rose-400/10 text-rose-700 dark:text-rose-300',
    before: 'border-orange-400/40 bg-orange-400/10 text-orange-700 dark:text-orange-300',
    after: 'border-lime-400/40 bg-lime-400/10 text-lime-700 dark:text-lime-300'
  },
  {
    badge: 'border-sky-400/40 bg-sky-400/10 text-sky-700 dark:text-sky-300',
    before: 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-700 dark:text-fuchsia-300',
    after: 'border-teal-400/40 bg-teal-400/10 text-teal-700 dark:text-teal-300'
  }
]
type ItemTone = (typeof itemTones)[number]
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

function itemTone(index: number): ItemTone {
  return itemTones[index % itemTones.length] ?? itemTones[0]!
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
            color="neutral"
            variant="soft"
          >
            Khai hoang
          </UBadge>
          <h1 class="mt-3 text-2xl font-bold tracking-normal text-highlighted sm:text-3xl">
            {{ title }}
          </h1>
          <p class="mt-2 max-w-2xl leading-7 text-muted">
            {{ isChamSu ? 'Đội chạm sứ, võ tướng, chiến pháp và ghi chú.' : 'Đội khai hoang, chiến pháp trước cấp 20, sau cấp 20 và hướng chuyển hình.' }}
          </p>
          <p class="mt-3 text-sm font-medium text-muted">
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
            v-for="(item, index) in visibleItems"
            :key="item.slug"
            class="border-b border-default p-4 last:border-b-0 sm:p-5"
          >
            <div
              class="rounded-xl border border-default bg-default p-4 shadow-sm transition-colors sm:p-5"
            >
              <div class="flex items-start gap-3">
                <div class="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-primary" />
                <div class="min-w-0 flex-1">
                  <h2 class="text-lg font-semibold text-highlighted">
                    {{ item.name }}
                  </h2>
                </div>
              </div>

              <div class="mt-4 overflow-hidden rounded-lg border border-default bg-default/70">
                <div
                  v-if="isChamSu"
                  class="divide-y divide-default"
                >
                  <div
                    v-for="row in chamSuRows(item.lineup)"
                    :key="`${item.slug}-${row.general}`"
                    class="grid gap-2 p-3 transition-colors hover:bg-elevated/60 sm:grid-cols-[180px_1fr]"
                  >
                    <p class="font-semibold text-highlighted">
                      {{ row.general }}
                    </p>
                    <div>
                      <span
                        class="inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                        :class="itemTone(index).before"
                      >
                        Chiến pháp
                      </span>
                      <p class="mt-1 text-default">
                        {{ row.tactic }}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  v-else
                  class="divide-y divide-default"
                >
                  <div
                    v-for="row in doiHinhRows(item.lineup)"
                    :key="`${item.slug}-${row.general}`"
                    class="grid gap-3 p-3 transition-colors hover:bg-elevated/60 lg:grid-cols-[150px_1fr_1fr]"
                  >
                    <p class="font-semibold text-highlighted">
                      {{ row.general }}
                    </p>
                    <div>
                      <span
                        class="inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                        :class="itemTone(index).before"
                      >
                        Trước cấp 20
                      </span>
                      <p class="mt-1 text-default">
                        {{ row.before20 }}
                      </p>
                    </div>
                    <div>
                      <span
                        class="inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                        :class="itemTone(index).after"
                      >
                        Sau cấp 20
                      </span>
                      <p class="mt-1 text-default">
                        {{ row.after20 }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="item.transformTo.length"
                class="mt-4 rounded-lg border border-primary/15 bg-primary/5 p-3"
              >
                <p class="text-xs font-semibold uppercase tracking-wide text-primary">
                  Chuyển hình
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span
                    v-for="target in item.transformTo"
                    :key="target"
                    class="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-semibold"
                    :class="itemTone(index).badge"
                  >
                    <UIcon
                      name="i-lucide-arrow-right"
                      class="size-3.5"
                    />
                    {{ target }}
                  </span>
                </div>
              </div>

              <div
                v-if="noteItems(item.notes).length"
                class="mt-4 rounded-lg border border-primary/15 bg-primary/5 p-3"
              >
                <p class="text-xs font-semibold uppercase tracking-wide text-primary">
                  Ghi chú
                </p>
                <ul class="mt-2 space-y-2">
                  <li
                    v-for="note in noteItems(item.notes)"
                    :key="note"
                    class="flex gap-2 text-sm leading-6 text-muted"
                  >
                    <span
                      class="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span>{{ note }}</span>
                  </li>
                </ul>
              </div>
            </div>
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
