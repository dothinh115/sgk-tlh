<script setup lang="ts">
defineProps<{
  updatedAt: string
}>()
</script>

<template>
  <section class="rounded-xl border border-default bg-default p-5 shadow-sm">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <UBadge
          color="primary"
          variant="subtle"
        >
          Sách giáo khoa mùa
        </UBadge>
        <h1 class="mt-3 text-2xl font-bold tracking-normal text-highlighted sm:text-3xl">
          Anh Hùng Mệnh Thế
        </h1>
        <p class="mt-2 max-w-2xl leading-7 text-muted">
          Chọn đội trong danh sách bên dưới để mở hồ sơ: đội hình, chiến pháp, biến thể, điểm đồng thuận và phản biện chính.
        </p>
      </div>

      <p
        v-if="updatedAt"
        class="shrink-0 text-sm text-muted"
      >
        Cập nhật {{ updatedAt }}
      </p>
    </div>
  </section>
</template>
