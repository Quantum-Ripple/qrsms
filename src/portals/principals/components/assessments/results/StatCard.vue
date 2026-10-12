<script setup>
defineProps({ label: String, value: [String, Number], sub: String })
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <p class="text-xs font-medium uppercase tracking-wide text-gray-500">{{ label }}</p>
    <p class="mt-1 text-2xl font-bold text-gray-900">{{ value ?? '—' }}</p>
    <p v-if="sub" class="mt-0.5 text-xs text-gray-500">{{ sub }}</p>
  </div>
</template>