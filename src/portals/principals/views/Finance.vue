<template>
  <div>
    <div
      v-if="!academicContext.loaded || !selectedTerm"
      class="text-center text-gray-500 py-8"
    >
      Loading...
    </div>

    <template v-else>
      <Dashboard :term-id="selectedTerm" />
      <FeeCollected :term-id="selectedTerm" />
    </template>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import Dashboard from '../components/finance/dashboard.vue'
import FeeCollected from '../components/finance/FeeCollected.vue'
import { useAcademicContextStore } from '@/stores/academicContextStore'

const academicContext = useAcademicContextStore()
const selectedTerm = computed(() =>
  academicContext.selectedTermId
    ? String(academicContext.selectedTermId)
    : ''
)
</script>