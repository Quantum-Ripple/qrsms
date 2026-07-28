<template>
  <div class="min-h-screen w-full max-w-full overflow-x-hidden bg-gray-50 px-3 py-4 sm:px-6 sm:py-6">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <button
        @click="exportPDF"
        class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
      >
        Export PDF
      </button>

      <button
        @click="exportExcel"
        class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 sm:w-auto"
      >
        Export Excel
      </button>

      <button
        @click="printReport"
        class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 sm:w-auto"
      >
        Print
      </button>
    </div>

    <div class="mb-6 rounded-xl bg-white p-4 shadow-md sm:p-5">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div class="min-w-0">
          <label class="mb-1 block text-sm font-medium text-gray-700">Gender</label>
          <select v-model="filters.gender" class="w-full rounded border px-3 py-2.5 text-sm">
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div class="min-w-0">
          <label class="mb-1 block text-sm font-medium text-gray-700">Class Level</label>
          <select v-model="filters.class_level" class="w-full rounded border px-3 py-2.5 text-sm">
            <option value="">All</option>
            <option v-for="level in classLevels" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
        </div>

        <div class="min-w-0">
          <label class="mb-1 block text-sm font-medium text-gray-700">Stream</label>
          <select v-model="filters.stream" class="w-full rounded border px-3 py-2.5 text-sm">
            <option value="">All</option>
            <option v-for="s in streams" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div class="rounded-xl bg-white p-4 text-center shadow sm:p-5">
        <h3 class="text-gray-500 text-sm">Total Teachers</h3>
        <p class="text-2xl font-bold">{{ filteredTeachers.length }}</p>
      </div>

      <div class="rounded-xl bg-white p-4 text-center shadow sm:p-5">
        <h3 class="text-gray-500 text-sm">Male Teachers</h3>
        <p class="text-2xl font-bold text-blue-600">{{ maleTeachers }}</p>
      </div>

      <div class="rounded-xl bg-white p-4 text-center shadow sm:p-5">
        <h3 class="text-gray-500 text-sm">Female Teachers</h3>
        <p class="text-2xl font-bold text-pink-600">{{ femaleTeachers }}</p>
      </div>
    </div>

    <div class="space-y-3 md:hidden">
      <div
        v-for="teacher in filteredTeachers"
        :key="teacher.id"
        class="rounded-xl bg-white p-4 shadow"
      >
        <div class="text-base font-semibold text-gray-800 break-words">
          {{ teacher.first_name }} {{ teacher.last_name }}
        </div>

        <div class="mt-1 text-sm text-gray-600">
          {{ teacher.email }}
        </div>

        <div class="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
          <div class="min-w-0">
            <span class="block text-xs font-medium uppercase tracking-wide text-gray-400">Phone</span>
            <span class="break-words">{{ teacher.phone_number }}</span>
          </div>
          <div class="min-w-0">
            <span class="block text-xs font-medium uppercase tracking-wide text-gray-400">Gender</span>
            <span class="break-words">{{ teacher.gender }}</span>
          </div>
          <div class="min-w-0">
            <span class="block text-xs font-medium uppercase tracking-wide text-gray-400">Assignments</span>
            <span class="break-words">{{ teacher.assignments?.length || 0 }}</span>
          </div>
        </div>
      </div>

      <div v-if="filteredTeachers.length === 0" class="py-6 text-center text-gray-500">
        No teachers found.
      </div>
    </div>

    <div
      v-if="filteredTeachers.length"
      class="hidden min-w-0 overflow-hidden rounded-xl bg-white shadow md:block"
    >
      <div class="overflow-x-auto">
        <table id="teachersTable" class="min-w-[780px] w-full table-auto text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="border-b px-4 py-3 text-left">Full Name</th>
              <th class="border-b px-4 py-3 text-left">Email</th>
              <th class="border-b px-4 py-3 text-left">Phone</th>
              <th class="border-b px-4 py-3 text-left">Gender</th>
              <th class="border-b px-4 py-3 text-left">Assignments</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in filteredTeachers" :key="teacher.id" class="hover:bg-gray-50">
              <td class="border-b px-4 py-3 align-top break-words">
                {{ teacher.first_name }} {{ teacher.last_name }}
              </td>
              <td class="border-b px-4 py-3 align-top break-words">
                {{ teacher.email }}
              </td>
              <td class="border-b px-4 py-3 align-top whitespace-nowrap">
                {{ teacher.phone_number }}
              </td>
              <td class="border-b px-4 py-3 align-top whitespace-nowrap">
                {{ teacher.gender }}
              </td>
              <td class="border-b px-4 py-3 align-top whitespace-nowrap">
                {{ teacher.assignments?.length || 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="hidden rounded-xl bg-white px-4 py-10 text-center text-gray-500 shadow md:block">
      No teachers found.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import teachersApi from '../../api/Teachers.js'
import { fetchClassLevels } from '../../api/config.js'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const teachers = ref([])
const classLevels = ref([])
const streams = ref([])

const filters = ref({
  gender: '',
  class_level: '',
  stream: ''
})

onMounted(() => {
  fetchTeachers()
  fetchFilterOptions()
})

async function fetchTeachers() {
  try {
    const response = await teachersApi.list()
    teachers.value = Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : []
  } catch (error) {
    console.error('Failed to load teachers', error)
  }
}

async function fetchFilterOptions() {
  try {
    const response = await fetchClassLevels()
    const payload = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []

    const levelValues = payload.map((item) => item?.name).filter(Boolean)
    const streamValues = payload
      .flatMap((item) => Array.isArray(item?.streams) ? item.streams : [])
      .map((stream) => stream?.name)
      .filter(Boolean)

    classLevels.value = [...new Set(levelValues)].sort()
    streams.value = [...new Set(streamValues)].sort()

    if (!classLevels.value.length) {
      classLevels.value = [...new Set(
        teachers.value
          .flatMap((teacher) => teacher.assignments || [])
          .map((assignment) => assignment.class_level_name)
          .filter(Boolean)
      )].sort()
    }

    if (!streams.value.length) {
      streams.value = [...new Set(
        teachers.value
          .flatMap((teacher) => teacher.assignments || [])
          .map((assignment) => assignment.stream_name)
          .filter(Boolean)
      )].sort()
    }
  } catch (error) {
    console.error('Failed to load class level options', error)
  }
}

const filteredTeachers = computed(() =>
  teachers.value.filter((teacher) => {
    const matchesGender = !filters.value.gender || teacher.gender === filters.value.gender
    const matchesClass = !filters.value.class_level ||
      teacher.assignments?.some((assignment) => assignment.class_level_name === filters.value.class_level)
    const matchesStream = !filters.value.stream ||
      teacher.assignments?.some((assignment) => assignment.stream_name === filters.value.stream)

    return matchesGender && matchesClass && matchesStream
  })
)

const maleTeachers = computed(() => filteredTeachers.value.filter((teacher) => teacher.gender === 'Male').length)
const femaleTeachers = computed(() => filteredTeachers.value.filter((teacher) => teacher.gender === 'Female').length)

function exportPDF() {
  const doc = new jsPDF()
  autoTable(doc, {
    head: [['Full Name', 'Email', 'Phone', 'Gender', 'Assignments']],
    body: filteredTeachers.value.map((teacher) => [
      `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim(),
      teacher.email || '',
      teacher.phone_number || '',
      teacher.gender || '',
      teacher.assignments?.length || 0
    ])
  })
  doc.save('teacher_report.pdf')
}

function exportExcel() {
  const ws = XLSX.utils.json_to_sheet(filteredTeachers.value)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Teachers')
  XLSX.writeFile(wb, 'teacher_report.xlsx')
}

function printReport() {
  const printContent = document.getElementById('teachersTable').outerHTML
  const win = window.open('', '', 'width=900,height=600')
  win.document.write(`<html><body>${printContent}</body></html>`)
  win.document.close()
  win.print()
}
</script>
