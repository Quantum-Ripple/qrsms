<template>
  <div class="p-4 sm:p-6 bg-gray-50 min-h-screen">

    <!-- Horizontal Tabs -->
    <div class="mb-6 border-b border-gray-200 overflow-x-auto">
      <nav class="flex space-x-4" aria-label="Reports Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="selectedTab = tab.id"
          :class="selectedTab === tab.id
            ? 'border-blue-600 text-blue-600 border-b-2 font-medium'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="whitespace-nowrap py-3 px-4 border-b-2 text-sm font-medium transition"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Dynamic Report Component -->
    <div>
      <component :is="currentTabComponent" />
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import StudentReport from '../components/reports/StudentsReport.vue'
import Transactions from '../components/reports/Transactions.vue'


const tabs = [
  { id: 'students', label: 'Student Reports' },
  { id: 'teachers', label: 'Teacher Reports'},
  { id: 'finance', label: 'Finance Reports'}
]

const selectedTab = ref('students')

const currentTabComponent = computed(() => {
  return {
    students: StudentReport,
    finance: Transactions,
    
  }[selectedTab.value]
})
</script>
