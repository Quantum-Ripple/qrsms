

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

        <div class="min-w-0">
          <label class="mb-1 block text-sm font-medium text-gray-700">Gender</label>
          <select v-model="filters.gender" class="w-full rounded border px-3 py-2.5 text-sm">
            <option value="">All</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
      </div>
    </div>

 
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div class="rounded-xl bg-white p-4 text-center shadow sm:p-5">
        <h3 class="text-gray-500 text-sm">Total Students</h3>
        <p class="text-2xl font-bold">{{ filteredStudents.length }}</p>
      </div>

      <div class="rounded-xl bg-white p-4 text-center shadow sm:p-5">
        <h3 class="text-gray-500 text-sm">Total Boys</h3>
        <p class="text-2xl font-bold text-blue-600">{{ totalBoys }}</p>
      </div>

      <div class="rounded-xl bg-white p-4 text-center shadow sm:p-5">
        <h3 class="text-gray-500 text-sm">Total Girls</h3>
        <p class="text-2xl font-bold text-pink-600">{{ totalGirls }}</p>
      </div>
    </div>

    
    <div class="space-y-3 md:hidden">
      <div
        v-for="student in filteredStudents"
        :key="student.id"
        class="rounded-xl bg-white p-4 shadow"
      >
        <div class="text-base font-semibold text-gray-800 break-words">
          {{ student.full_name }}
        </div>

        <div class="mt-1 text-sm text-gray-600">
          Adm No: {{ student.admission_number }}
        </div>

        <div class="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
          <div class="min-w-0">
            <span class="block text-xs font-medium uppercase tracking-wide text-gray-400">Class</span>
            <span class="break-words">{{ student.class_level }}</span>
          </div>
          <div class="min-w-0">
            <span class="block text-xs font-medium uppercase tracking-wide text-gray-400">Stream</span>
            <span class="break-words">{{ student.stream }}</span>
          </div>
          <div class="min-w-0">
            <span class="block text-xs font-medium uppercase tracking-wide text-gray-400">Gender</span>
            <span class="break-words">{{ student.gender }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="filteredStudents.length === 0"
        class="text-center text-gray-500 py-6"
      >
        No students found.
      </div>
    </div>

    <div
      v-if="filteredStudents.length"
      class="hidden min-w-0 overflow-hidden rounded-xl bg-white shadow md:block"
    >
      <div class="overflow-x-auto">
        <table id="studentsTable" class="min-w-[720px] w-full table-auto text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="border-b px-4 py-3 text-left">Full Name</th>
              <th class="border-b px-4 py-3 text-left">Admission No</th>
              <th class="border-b px-4 py-3 text-left">Class</th>
              <th class="border-b px-4 py-3 text-left">Stream</th>
              <th class="border-b px-4 py-3 text-left">Gender</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="student in filteredStudents"
              :key="student.id"
              class="hover:bg-gray-50"
            >
              <td class="border-b px-4 py-3 align-top break-words">
                {{ student.full_name }}
              </td>
              <td class="border-b px-4 py-3 align-top whitespace-nowrap">
                {{ student.admission_number }}
              </td>
              <td class="border-b px-4 py-3 align-top whitespace-nowrap">
                {{ student.class_level }}
              </td>
              <td class="border-b px-4 py-3 align-top whitespace-nowrap">
                {{ student.stream }}
              </td>
              <td class="border-b px-4 py-3 align-top whitespace-nowrap">
                {{ student.gender }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-else
      class="hidden rounded-xl bg-white px-4 py-10 text-center text-gray-500 shadow md:block"
    >
      No students found.
    </div>

  </div>
</template>

<script setup>

import { ref, computed } from "vue"
import { useQuery } from "@tanstack/vue-query"
import studentsApi from "../../api/Students.js"
import { fetchClassLevels } from "../../api/config.js"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

import { useAuthStore } from "@/stores/authStore.js"

const auth = useAuthStore()


// --------------------------------------------------
// SCHOOL
// --------------------------------------------------

const user = auth.user || {}
const school_id = user.school?.id || user.school_id


// --------------------------------------------------
// STUDENTS REPORT QUERY
// --------------------------------------------------

const {
  data: studentsData,
  isFetching: studentsFetching,
} = useQuery({
  queryKey: ["students-report", school_id],

  queryFn: async () => {
    const response = await studentsApi.listAll()

    return Array.isArray(response?.results)
      ? response.results
      : Array.isArray(response)
        ? response
        : []
  },

  staleTime: 10 * 60 * 1000,

  refetchOnMount: "always",
})


const students = computed(() => studentsData.value || [])


// --------------------------------------------------
// CLASS / STREAM OPTIONS
// --------------------------------------------------

const {
  data: filterOptionsData,
} = useQuery({
  queryKey: ["class-levels", school_id],

  queryFn: async () => {
    const response = await fetchClassLevels()

    return Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : []
  },

  staleTime: 0,

  refetchOnMount: "always",
})


const classLevels = computed(() => {

  const payload = filterOptionsData.value || []

  const levels = payload
    .map(item => item?.name)
    .filter(Boolean)

  if (!levels.length) {
    return [
      ...new Set(
        students.value
          .map(student => student.class_level)
          .filter(Boolean)
      )
    ].sort()
  }

  return [...new Set(levels)].sort()
})


const streams = computed(() => {

  const payload = filterOptionsData.value || []

  const streamValues = payload
    .flatMap(item =>
      Array.isArray(item?.streams)
        ? item.streams
        : []
    )
    .map(stream => stream?.name)
    .filter(Boolean)

  if (!streamValues.length) {
    return [
      ...new Set(
        students.value
          .map(student => student.stream)
          .filter(Boolean)
      )
    ].sort()
  }

  return [...new Set(streamValues)].sort()
})


// --------------------------------------------------
// FILTERS
// --------------------------------------------------

const filters = ref({
  class_level: "",
  stream: "",
  gender: ""
})


// --------------------------------------------------
// FILTERED REPORT
// --------------------------------------------------

const filteredStudents = computed(() =>
  students.value.filter(s =>
    (!filters.value.class_level ||
      s.class_level === filters.value.class_level) &&

    (!filters.value.stream ||
      s.stream === filters.value.stream) &&

    (!filters.value.gender ||
      s.gender === filters.value.gender)
  )
)


// --------------------------------------------------
// TOTALS
// --------------------------------------------------

const totalGirls = computed(() =>
  filteredStudents.value.filter(
    s => s.gender === "F"
  ).length
)


const totalBoys = computed(() =>
  filteredStudents.value.filter(
    s => s.gender === "M"
  ).length
)


// --------------------------------------------------
// EXPORT FUNCTIONS
// --------------------------------------------------

function exportPDF() {
  const doc = new jsPDF()

  autoTable(doc, {
    head: [
      ["Full Name", "Admission No", "Class", "Stream", "Gender"]
    ],

    body: filteredStudents.value.map(s => [
      s.full_name,
      s.admission_number,
      s.class_level,
      s.stream,
      s.gender
    ])
  })

  doc.save("student_report.pdf")
}


function exportExcel() {

  const ws = XLSX.utils.json_to_sheet(
    filteredStudents.value
  )

  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Students"
  )

  XLSX.writeFile(
    wb,
    "student_report.xlsx"
  )
}


function printReport() {

  const printContent =
    document.getElementById("studentsTable").outerHTML

  const win = window.open(
    "",
    "",
    "width=900,height=600"
  )

  win.document.write(
    `<html><body>${printContent}</body></html>`
  )

  win.document.close()
  win.print()
}


</script>
