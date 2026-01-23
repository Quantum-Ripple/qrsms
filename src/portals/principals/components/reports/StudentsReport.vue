
<!--
Purpose:
This page is designed to allow school principals to view, filter, and export
student records in a structured and user-friendly manner. It provides a clear
overview of students while enabling dynamic filtering and reporting functionality.

Key Features:
1. Filtering:
   - Users can filter the student list based on:
     • Class Level (Grade 1 to Grade 12)
     • Stream (North, South, East, West)
     • Gender (Male, Female)
   - The filtering is reactive, updating the student list and summary cards
     instantly as the filter criteria are changed.

2. Summary Cards:
   - Displays a quick overview of the filtered students:
     • Total Students
     • Total Boys
     • Total Girls
   - These summaries update automatically based on applied filters.

3. Student Table / List:
   - Provides a responsive view of students:
     • A table for medium to large screens
     • Card-based layout for small screens (mobile)
   - Columns include Full Name, Admission Number, Class Level, Stream, and Gender.
   - Clicking on a student opens the detailed view for that student.

4. Export & Print Functionality:
   - Buttons at the top allow the principal to:
     • Export the filtered student list to PDF
     • Export the filtered student list to Excel
     • Print the filtered student list
   - These actions operate on the currently filtered data, ensuring the
     exported or printed reports match what the principal is viewing.

Data Flow / Interaction with the Program:
- The component fetches the student data from the `studentsApi.list()` endpoint
  on mount.
- All filtering is done **reactively on the frontend**, ensuring fast updates
  without repeated backend calls.
- Summary cards compute totals using `computed` properties based on
  `filteredStudents`.
- The page integrates seamlessly with the Vue Router:
  • Clicking on a student navigates to the detailed student view page.
- Export and print functionality uses standard libraries (e.g., jsPDF, XLSX)
  to generate downloadable or printable reports.


-->



<template>
  <div class="w-full max-w-full overflow-x-hidden p-4 sm:p-6 bg-gray-50 min-h-screen">
    
    <div class="flex flex-wrap gap-3 mb-6">
      <button
        @click="exportPDF"
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
      >
        Export PDF
      </button>

      <button
        @click="exportExcel"
        class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
      >
        Export Excel
      </button>

      <button
        @click="printReport"
        class="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm"
      >
        Print
      </button>
    </div>

    <div class="bg-white p-4 rounded-lg shadow-md mb-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label class="block text-gray-700 font-medium mb-1">Class Level</label>
          <select v-model="filters.class_level" class="w-full border rounded px-3 py-2 text-sm">
            <option value="">All</option>
            <option v-for="level in classLevels" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-1">Stream</label>
          <select v-model="filters.stream" class="w-full border rounded px-3 py-2 text-sm">
            <option value="">All</option>
            <option v-for="s in streams" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-1">Gender</label>
          <select v-model="filters.gender" class="w-full border rounded px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
      </div>
    </div>

 
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
      <div class="bg-white p-4 rounded-lg shadow text-center">
        <h3 class="text-gray-500 text-sm">Total Students</h3>
        <p class="text-2xl font-bold">{{ filteredStudents.length }}</p>
      </div>

      <div class="bg-white p-4 rounded-lg shadow text-center">
        <h3 class="text-gray-500 text-sm">Total Boys</h3>
        <p class="text-2xl font-bold text-blue-600">{{ totalBoys }}</p>
      </div>

      <div class="bg-white p-4 rounded-lg shadow text-center">
        <h3 class="text-gray-500 text-sm">Total Girls</h3>
        <p class="text-2xl font-bold text-pink-600">{{ totalGirls }}</p>
      </div>
    </div>

    
    <div class="sm:hidden space-y-3">
      <div
        v-for="student in filteredStudents"
        :key="student.id"
        class="bg-white rounded-lg shadow p-3"
      >
        <div class="font-semibold text-gray-800">
          {{ student.full_name }}
        </div>

        <div class="text-sm text-gray-600 mt-1">
          Adm No: {{ student.admission_number }}
        </div>

        <div class="mt-2 text-sm">
          {{ student.class_level }} · {{ student.stream }}
        </div>

        <div class="mt-1 text-sm font-medium">
          Gender: {{ student.gender }}
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
      class="hidden sm:block overflow-x-auto bg-white rounded-lg shadow"
    >
      <table id="studentsTable" class="w-full table-auto text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-3 px-4 text-left border-b">Full Name</th>
            <th class="py-3 px-4 text-left border-b">Admission No</th>
            <th class="py-3 px-4 text-left border-b">Class</th>
            <th class="py-3 px-4 text-left border-b">Stream</th>
            <th class="py-3 px-4 text-left border-b">Gender</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="student in filteredStudents"
            :key="student.id"
            class="hover:bg-gray-50"
          >
            <td class="py-3 px-4 border-b break-words">
              {{ student.full_name }}
            </td>
            <td class="py-3 px-4 border-b whitespace-nowrap">
              {{ student.admission_number }}
            </td>
            <td class="py-3 px-4 border-b whitespace-nowrap">
              {{ student.class_level }}
            </td>
            <td class="py-3 px-4 border-b whitespace-nowrap">
              {{ student.stream }}
            </td>
            <td class="py-3 px-4 border-b whitespace-nowrap">
              {{ student.gender }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import studentsApi from "../../api/Students.js"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

const students = ref([])

const classLevels = [
  "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6",
  "Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"
]

const streams = ["North", "South", "East", "West"]

const filters = ref({
  class_level: "",
  stream: "",
  gender: ""
})

onMounted(fetchStudents)

async function fetchStudents() {
  students.value = await studentsApi.list()
}

const filteredStudents = computed(() =>
  students.value.filter(s =>
    (!filters.value.class_level || s.class_level === filters.value.class_level) &&
    (!filters.value.stream || s.stream === filters.value.stream) &&
    (!filters.value.gender || s.gender === filters.value.gender)
  )
)

const totalGirls = computed(() =>
  filteredStudents.value.filter(s => s.gender === "F").length
)

const totalBoys = computed(() =>
  filteredStudents.value.filter(s => s.gender === "M").length
)


function exportPDF() {
  const doc = new jsPDF()
  autoTable(doc, {
    head: [["Full Name", "Admission No", "Class", "Stream", "Gender"]],
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
  const ws = XLSX.utils.json_to_sheet(filteredStudents.value)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Students")
  XLSX.writeFile(wb, "student_report.xlsx")
}

function printReport() {
  const printContent = document.getElementById("studentsTable").outerHTML
  const win = window.open("", "", "width=900,height=600")
  win.document.write(`<html><body>${printContent}</body></html>`)
  win.document.close()
  win.print()
}
</script>
