<template>
  <div>

    <!-- TERM SELECTOR -->
    <div class="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3 mb-4">
      <label class="text-sm font-medium text-gray-600">
        Term
      </label>

      <select
        v-model="selectedTerm"
        class="border rounded px-3 py-2 text-sm"
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

    <div v-if="!selectedTerm" class="text-center text-gray-500 py-8">
      Loading...
    </div>

    <template v-else>
      <Dashboard :term-id="selectedTerm" />
      <FeeCollected :term-id="selectedTerm" />
    </template>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Dashboard from '../components/finance/dashboard.vue'
import FeeCollected from '../components/finance/FeeCollected.vue'
import { fetchTerms } from '../api/term.js'
import { getFinanceSummary } from '../api/finance.js'

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

// Resolve the backend's "current term" ONCE, before Dashboard/FeeCollected
// ever mount (they're behind v-else above, gated on selectedTerm being
// set). That means both children only ever fetch with an explicit term —
// no "fetch with nothing, then fetch again once we learn the term" pass.
const resolveInitialTerm = async () => {
  try {
    const data = await getFinanceSummary()
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