<template>
  <div class="p-6 bg-gray-50 min-h-screen space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-semibold text-gray-800">Inactive Students</h2>
        
      </div>
      <button @click="router.push({ name: 'PrincipalStudents' })"
              class="border border-gray-300 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 w-full sm:w-auto">
        Back to students
      </button>
    </div>

    <div class="flex flex-col sm:flex-row gap-3">
      <input v-model="searchQuery" type="text" placeholder="Search by name or admission number..."
             class="w-full sm:max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      <select v-model="outcome" class="px-4 py-2 border border-gray-300 rounded-lg bg-white">
        <option value="">All outcomes</option>
        <option value="GRADUATED">Graduated</option>
        <option value="WITHDRAWN">Withdrawn</option>
      </select>
    </div>

    <p v-if="isError" class="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      Could not load inactive students.
    </p>

    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-100 text-gray-700">
            <tr>
              <th class="px-4 py-3">Full Name</th>
              <th class="px-4 py-3">Admission No.</th>
              <th class="px-4 py-3">Last class</th>
              <th class="px-4 py-3">Outcome</th>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Note</th>
              <th class="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in students" :key="s.id" class="border-t hover:bg-gray-50">
              <td class="px-4 py-3">{{ s.full_name }}</td>
              <td class="px-4 py-3">{{ s.admission_number }}</td>
              <td class="px-4 py-3">{{ s.last_class || 'No record' }}<span v-if="s.last_year" class="text-gray-500"> · {{ s.last_year }}</span></td>
              <td class="px-4 py-3"><span class="rounded px-2 py-0.5 text-xs font-medium" :class="badge(s.outcome)">{{ label(s.outcome) }}</span></td>
              <td class="px-4 py-3">{{ formatDate(s.left_on) }}</td>
              <td class="px-4 py-3 max-w-xs truncate" :title="s.note">{{ s.note || '—' }}</td>
              <td class="px-4 py-3 text-center whitespace-nowrap space-x-2">
                <button @click="viewStudent(s)" class="text-blue-600 hover:underline">View</button>
                <button @click="openReinstate(s)" class="text-green-700 hover:underline">Reinstate</button>
              </td>
            </tr>
            <tr v-if="!isLoading && !students.length">
              <td colspan="7" class="text-center py-6 text-gray-500">No inactive students found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sm:hidden divide-y">
        <div v-for="s in students" :key="s.id" class="p-4 space-y-1">
          <div class="flex justify-between items-start gap-2">
            <p class="font-semibold">{{ s.full_name }}</p>
            <span class="shrink-0 rounded px-2 py-0.5 text-xs font-medium" :class="badge(s.outcome)">{{ label(s.outcome) }}</span>
          </div>
          <p class="text-sm text-gray-600">Adm: {{ s.admission_number }}</p>
          <p class="text-sm text-gray-600">{{ s.last_class || 'No record' }} <span v-if="s.last_year">· {{ s.last_year }}</span> · {{ formatDate(s.left_on) }}</p>
          <p v-if="s.note" class="text-sm text-gray-500">{{ s.note }}</p>
          <div class="grid grid-cols-2 gap-2 pt-2">
            <button @click="viewStudent(s)" class="rounded border border-blue-200 py-2 text-blue-700">View</button>
            <button @click="openReinstate(s)" class="rounded border border-green-200 py-2 text-green-700">Reinstate</button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
        <button :disabled="!data?.previous" @click="page--" class="px-3 py-1 bg-white border rounded disabled:opacity-40">Previous</button>
        <span class="text-sm text-gray-600">Page {{ page }}</span>
        <button :disabled="!data?.next" @click="page++" class="px-3 py-1 bg-white border rounded disabled:opacity-40">Next</button>
      </div>
    </div>

    <div v-if="reinstating" class="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40"
         @click.self="reinstating = null">
      <div class="w-full sm:max-w-md bg-white rounded-t-lg sm:rounded-lg p-5 space-y-4">
        <h3 class="text-lg font-semibold">Reinstate {{ reinstating.full_name }}</h3>
        <p class="text-sm text-gray-600">
          The student becomes active again and joins the class you choose in the current academic year.
          Their earlier record is kept.
        </p>
        <select v-model="classId" class="w-full border px-3 py-2 rounded">
          <option disabled value="">Select class</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.display_name }}</option>
        </select>
        <div class="flex justify-end gap-2">
          <button @click="reinstating = null" class="border px-4 py-2 rounded">Cancel</button>
          <button @click="confirmReinstate" :disabled="!classId || saving"
                  class="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">
            {{ saving ? 'Saving...' : 'Reinstate' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useToast } from 'vue-toastification'
import studentsApi from '../api/Students.js'
import { fetchAcademicYears, fetchClassInstances } from '../api/promotions'

const router = useRouter()
const toast = useToast()
const queryClient = useQueryClient()
const unwrap = (d) => (Array.isArray(d) ? d : d?.results ?? [])

const searchQuery = ref('')
const debouncedSearch = ref('')
const outcome = ref('')
const page = ref(1)
let timer = null

watch(searchQuery, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => { debouncedSearch.value = v.trim(); page.value = 1 }, 300)
})
watch(outcome, () => { page.value = 1 })
onBeforeUnmount(() => clearTimeout(timer))

const { data, isLoading, isError } = useQuery({
  queryKey: ['inactive-students', page, debouncedSearch, outcome],
  queryFn: () => studentsApi.listInactive(page.value, debouncedSearch.value, outcome.value),
  keepPreviousData: true,
  refetchOnMount: 'always',
})
const students = computed(() => unwrap(data.value))

const label = (o) => ({ GRADUATED: 'Graduated', WITHDRAWN: 'Withdrawn' }[o] ?? 'Inactive')
const badge = (o) => ({ GRADUATED: 'bg-green-100 text-green-800', WITHDRAWN: 'bg-amber-100 text-amber-800' }[o] ?? 'bg-gray-200 text-gray-700')
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')
const viewStudent = (s) => router.push({ name: 'PrincipalStudentDetail', params: { id: s.id } })

// ----- reinstate -----
const reinstating = ref(null)
const classes = ref([])
const classId = ref('')
const saving = ref(false)

const openReinstate = async (s) => {
  reinstating.value = s
  classId.value = ''
  if (classes.value.length) return
  try {
    const years = unwrap(await fetchAcademicYears())
    const current = years.find((y) => y.is_current) ?? years[0]
    if (current) classes.value = unwrap(await fetchClassInstances({ academic_year: current.id }))
  } catch (e) {
    toast.error('Could not load classes.')
  }
}

const confirmReinstate = async () => {
  saving.value = true
  try {
    await studentsApi.reinstate(reinstating.value.id, classId.value)
    toast.success(`${reinstating.value.full_name} reinstated`)
    reinstating.value = null
    queryClient.invalidateQueries({ queryKey: ['inactive-students'] })
    queryClient.invalidateQueries({ queryKey: ['students'] })
  } catch (e) {
    toast.error(e?.response?.data?.detail || 'Could not reinstate this student.')
  } finally {
    saving.value = false
  }
}
</script>