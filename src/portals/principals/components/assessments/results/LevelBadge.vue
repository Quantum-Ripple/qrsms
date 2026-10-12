<script setup>
import { computed } from 'vue'
const props = defineProps({ level: { type: String, default: null } })
const cls = computed(() => ({
  EE: 'bg-emerald-100 text-emerald-800',
  ME: 'bg-blue-100 text-blue-800',
  AE: 'bg-amber-100 text-amber-800',
  BE: 'bg-red-100 text-red-800',
}[props.level?.slice(0, 2)] ?? 'bg-gray-100 text-gray-700'))
</script>

<template>
  <span v-if="level" class="inline-block rounded-full px-2 py-0.5 text-xs font-semibold" :class="cls">{{ level }}</span>
  <span v-else class="text-gray-400">—</span>
</template>