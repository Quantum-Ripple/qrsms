<template>
  <button
    :disabled="loading || disabled"
    v-bind="$attrs"
    class="flex items-center justify-center"
  >
    <template v-if="loading">
      <i class="fa fa-spinner fa-spin mr-2"></i>
      {{ loadingText }}
    </template>

    <template v-else>
      <slot />
    </template>
  </button>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },

  disabled: {
    type: Boolean,
    default: false
  },

  loadingText: {
    type: String,
    default: 'Loading...'
  }
})
</script>