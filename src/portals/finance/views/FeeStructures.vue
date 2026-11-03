<template>
  <div class="space-y-4 p-3 sm:space-y-6 sm:p-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:gap-4">
        <label class="sr-only" for="fee-search">Search by class level</label>
        <input
          id="fee-search"
          v-model="search"
          type="search"
          placeholder="Search by class level..."
          class="w-full rounded border px-3 py-2 sm:w-64"
        />

        <label class="sr-only" for="fee-class">Filter by class</label>
        <select id="fee-class" v-model="selectedClass" class="w-full rounded border px-3 py-2 sm:w-auto">
          <option value="">All Classes</option>
          <option
            v-for="cls in classLevels"
            :key="cls.id"
            :value="cls.name"
          >
            {{ cls.name }}
          </option>
        </select>

        <label class="sr-only" for="fee-year">Filter by academic year</label>
        <select id="fee-year" v-model="selectedYear" class="w-full rounded border px-3 py-2 sm:w-auto">
          <option value="">All Academic Years</option>
          <option
            v-for="year in academicYears"
            :key="year.id"
            :value="year.label"
          >
            {{ year.label }}
          </option>
        </select>
      </div>
      <button
        @click="goToCreate"
        class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto"
      >
        Add Fee Structure
      </button>
    </div>

    <div class="hidden overflow-x-auto rounded border md:block">
      <table class="w-full border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-left">Class</th>
            <th class="p-3 text-left">Term</th>
            <th class="p-3 text-left">Year</th>
            <th class="p-3 text-left">Amount</th>
            <th class="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="fee in filteredFees"
            :key="fee.id"
            class="border-t hover:bg-gray-50"
          >
            <td class="p-3">{{ fee.class_level_name }}</td>
            <td class="p-3">{{ fee.term_name }}</td>
            <td class="p-3">{{ fee.academic_year }}</td>
            <td class="p-3 font-medium">
              {{ formatCurrency(fee.amount) }}
            </td>
            <td class="p-3 text-center">
              <button
                @click="viewFee(fee.id)"
                class="text-blue-600 hover:underline"
              >
                View
              </button>
            </td>
          </tr>

          <tr v-if="!filteredFees.length">
            <td colspan="5" class="text-center p-4 text-gray-500">
              No fee structures found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 md:hidden">
      <article
        v-for="fee in filteredFees"
        :key="fee.id"
        class="rounded-lg border bg-white p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <h2 class="min-w-0 break-words font-semibold text-gray-900">
            {{ fee.class_level_name }}
          </h2>
          <span class="shrink-0 text-right font-semibold text-gray-900">
            {{ formatCurrency(fee.amount) }}
          </span>
        </div>

        <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-gray-500">Term</dt>
            <dd class="mt-0.5 break-words font-medium text-gray-800">{{ fee.term_name }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Year</dt>
            <dd class="mt-0.5 font-medium text-gray-800">{{ fee.academic_year }}</dd>
          </div>
        </dl>

        <button
          @click="viewFee(fee.id)"
          class="mt-4 w-full rounded border border-blue-200 px-3 py-2 font-medium text-blue-700 hover:bg-blue-50"
        >
          View Fee Structure
        </button>
      </article>

      <div
        v-if="!filteredFees.length"
        class="rounded-lg border bg-white p-6 text-center text-gray-500"
      >
        No fee structures found.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFees } from '../api/fee'
import { fetchAcademicYears } from '../api/term'

import { getClassLevels } from '@/api/classes'

const classLevels = ref([])
const academicYears = ref([])
const selectedYear = ref('')

const normalizeAcademicYear = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  return value.name || value.year || value.academic_year || ''
}

const getAcademicYearSortValue = (value) => {
  const label = normalizeAcademicYear(value)
  if (!label) return 0

  const match = label.match(/(\d{4})/g)
  if (!match) return 0

  const firstYear = Number(match[0])
  const lastYear = Number(match[match.length - 1] || 0)
  return Math.max(firstYear, lastYear)
}

const loadClassLevels = async () => {
  try {
    classLevels.value = await getClassLevels()
  } catch (err) {
    console.error("Failed to load class levels:", err)
  }
}

const loadAcademicYears = async () => {
  try {
    const response = await fetchAcademicYears()
    const data = Array.isArray(response) ? response : response?.results || []

    academicYears.value = data
      .map((year) => ({
        id: year.id,
        label: normalizeAcademicYear(year)
      }))
      .filter((year) => year.label)
      .sort((a, b) => getAcademicYearSortValue(b.label) - getAcademicYearSortValue(a.label))

    if (academicYears.value.length) {
      selectedYear.value = academicYears.value[0].label
    }
  } catch (err) {
    console.error('Failed to load academic years:', err)
  }
}

const router = useRouter()
const fees = ref([])
const search = ref('')
const selectedClass = ref('')

const fetchFees = async () => {
  try {
    const data = await getFees()
    fees.value = data
  } catch (err) {
    console.error("Failed to fetch fees:", err)
  }
}

onMounted(async () => {
    await loadClassLevels()
    await loadAcademicYears()
    await fetchFees()
})

const filteredFees = computed(() => {
  return [...fees.value]
    .filter(fee => {
      const className = fee.class_level_name || ""
      const feeAcademicYear = fee.academic_year || ""

      const matchesSearch =
        className.toLowerCase().includes(search.value.toLowerCase())

      const matchesClass =
        !selectedClass.value ||
        className === selectedClass.value

      const matchesYear =
        !selectedYear.value ||
        feeAcademicYear === selectedYear.value ||
        String(fee.academic_year_id || '') === String(selectedYear.value)

      return matchesSearch && matchesClass && matchesYear
    })
    .sort((a, b) => getAcademicYearSortValue(b.academic_year || '') - getAcademicYearSortValue(a.academic_year || ''))
})

const goToCreate = () => {
  router.push({ name: 'FeeCreate'})
}

const viewFee = (id) => {
  router.push({
    name: 'FeeDetails',
    params: { id }
  })
}


const formatCurrency = (value) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(value)
</script>
