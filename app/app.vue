<script setup lang="ts">
import { getPrimaryColorPreflightScript } from '~/utils/primary-colors'

const title = 'Sách giáo khoa Anh Hùng Mệnh Thế'
const description = 'Bản tổng hợp đội hình, chiến pháp, đồng thuận và phản biện cộng đồng cho mùa Anh Hùng Mệnh Thế.'
const primaryColorPreflight = getPrimaryColorPreflightScript()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  script: [
    {
      innerHTML: primaryColorPreflight,
      tagPosition: 'head'
    }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'vi'
  }
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-elevated/55 text-default">
      <UHeader
        :toggle="false"
        :ui="{
          root: 'border-b border-default bg-default/90 backdrop-blur supports-[backdrop-filter]:bg-default/80',
          container: 'max-w-none !mx-0 !px-0',
          left: 'flex items-center gap-1.5',
          right: 'flex items-center justify-end gap-1 px-4'
        }"
      >
        <template #left>
          <NuxtLink
            to="/"
            class="flex h-full items-center gap-3 px-4"
          >
            <div class="flex size-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <UIcon
                name="i-lucide-book-open-text"
                class="size-5"
              />
            </div>
            <div class="leading-tight">
              <p class="font-semibold text-highlighted">
                Thăng Long Hội
              </p>
              <p class="hidden text-xs text-muted sm:block">
                Tam Quốc Chí Chiến Lược
              </p>
            </div>
          </NuxtLink>
        </template>

        <template #right>
          <ThemeControls />
        </template>
      </UHeader>

      <UMain>
        <NuxtPage />
      </UMain>
    </div>
  </UApp>
</template>
