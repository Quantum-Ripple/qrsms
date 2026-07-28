<template>
  <div class="min-h-screen bg-gray-50 px-3 py-4 sm:px-6 sm:py-6">

    <!-- Horizontal Tabs -->
    <div class="mb-6 overflow-x-auto border-b border-gray-200">
      <nav class="flex min-w-max gap-1 sm:gap-2" aria-label="Reports Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="selectedTab = tab.id"
          :class="selectedTab === tab.id
            ? 'border-blue-600 text-blue-600 border-b-2 font-medium'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition sm:px-4"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Dynamic Report Component -->
    <div class="min-w-0">
      <component :is="currentTabComponent" />
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import StudentReport from '../components/reports/StudentsReport.vue'
import Transactions from '../components/reports/Transactions.vue'
import TeacherReport from '../components/reports/TeachersReport.vue'


const tabs = [
  { id: 'students', label: 'Student Reports' },
  { id: 'teachers', label: 'Teacher Reports'},
  { id: 'finance', label: 'Finance Reports'}
]

const selectedTab = ref('students')

const currentTabComponent = computed(() => {
  return {
    students: StudentReport,
    teachers: TeacherReport,
    finance: Transactions
    
  }[selectedTab.value]
})
</script>
