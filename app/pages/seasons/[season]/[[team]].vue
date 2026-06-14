<script setup lang="ts">
definePageMeta({
  key: route => `season-${String(route.params.season || '')}`
})
</script>

<template>
  <SeasonGuidePage />
</template>
