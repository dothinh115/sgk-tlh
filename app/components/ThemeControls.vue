<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { $primaryColor } = useNuxtApp()

const colorItems = computed<DropdownMenuItem[][]>(() => [
  $primaryColor.colors.map(color => ({
    label: color.label,
    checked: $primaryColor.current.value === color.value,
    onSelect: () => {
      $primaryColor.set(color.value)
    },
    colorClass: color.class,
    class: $primaryColor.current.value === color.value ? 'bg-primary/10 text-primary' : ''
  }))
])
</script>

<template>
  <div class="flex items-center gap-1">
    <UColorModeButton
      color="neutral"
      variant="ghost"
    />

    <UDropdownMenu
      :items="colorItems"
      :content="{ align: 'end' }"
      :ui="{ content: 'min-w-36' }"
    >
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-palette"
        aria-label="Đổi màu chủ đạo"
      />

      <template #item="{ item }">
        <div class="grid w-full grid-cols-[16px_minmax(0,1fr)_16px] items-center gap-3">
          <span
            class="size-3 rounded-full"
            :class="item.colorClass"
          />
          <span class="truncate leading-none">
            {{ item.label }}
          </span>
          <UIcon
            v-if="item.checked"
            name="i-lucide-check"
            class="size-4 text-primary"
          />
        </div>
      </template>
    </UDropdownMenu>
  </div>
</template>
