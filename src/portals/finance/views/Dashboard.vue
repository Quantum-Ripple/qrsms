<template>
  <div class="w-full max-w-full min-w-0 overflow-x-hidden p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
    <div class="w-full max-w-full min-w-0">
      <Overview :term-id="selectedTerm" />
    </div>

    <div class="w-full max-w-full min-w-0">
      <Category :term-id="selectedTerm" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Overview from '../components/dashboard/Overview.vue'
import Category from '../components/dashboard/Category.vue'
import { useAcademicContextStore } from '@/stores/academicContextStore'

const academicContext = useAcademicContextStore()
const selectedTerm = computed(() => {
  return academicContext.selectedTermId ? String(academicContext.selectedTermId) : ''
})
</script>