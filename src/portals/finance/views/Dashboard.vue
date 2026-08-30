<template>
  <div class="w-full max-w-full min-w-0 overflow-x-hidden p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">

    <!-- TERM SELECTOR -->
    <div
      class="w-full max-w-full min-w-0 bg-white p-3 sm:p-4 rounded-xl shadow-sm border
             flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
    >
      <label class="text-sm font-medium text-gray-600 shrink-0">
        Term
      </label>

      <select
        v-model="selectedTerm"
        class="w-full sm:w-auto sm:min-w-[160px] max-w-full
               border rounded px-3 py-2 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option
          v-for="term in terms"
          :key="term.id"
          :value="String(term.id)"
        >
          {{ term.name }}, {{ term.academic_year_name }}
        </option>
      </select>
    </div>

    <div class="w-full max-w-full min-w-0">
      <Overview :term-id="selectedTerm" />
    </div>

    <div class="w-full max-w-full min-w-0">
      <Category :term-id="selectedTerm" />
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Overview from '../components/dashboard/Overview.vue'
import Category from '../components/dashboard/Category.vue'
import { fetchTerms } from '../api/term.js'
import { overview } from '../api/dashboard.js'

const terms = ref([])
const selectedTerm = ref('')

const loadTerms = async () => {
  try {
    const response = await fetchTerms()
    terms.value = Array.isArray(response) ? response : response?.results || []
  } catch (error) {
    console.error('Failed loading terms:', error)
  }
}

const resolveInitialTerm = async () => {
  try {
    const data = await overview()
    if (data?.term?.id) {
      selectedTerm.value = String(data.term.id)
    }
  } catch (error) {
    console.error('Failed resolving current term:', error)
  }
}

onMounted(async () => {
  await Promise.all([loadTerms(), resolveInitialTerm()])
})
</script>