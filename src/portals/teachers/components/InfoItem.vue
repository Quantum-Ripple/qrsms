<template>
  <div>
    <p class="text-sm text-gray-500">
      {{ label }}
    </p>

    <p class="mt-1 font-medium text-gray-800">
      {{ value }}
    </p>
  </div>
</template>


<script setup>
defineProps({
  label: String,
  value: String
})
</script>