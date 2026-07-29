<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">{{ grade }} {{ stream }} Results</h2>
      
      </div>

      <button
        @click="exportToExcel"
        :disabled="!tableRows.length || exporting"
        class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ exporting ? "Exporting..." : "Export to Excel" }}
      </button>
    </div>

    <div class="rounded-xl border bg-white p-4 shadow-sm">
      <label class="mb-2 block text-sm font-semibold text-slate-700">
        Select Assessment
      </label>

      <select
        v-model="selectedExam"
        class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
      >
        <option :value="null" disabled>Select exam</option>
        <option v-for="exam in exams" :key="exam.id" :value="exam.id">
          {{ exam.name }}
        </option>
      </select>
    </div>

    <div
      v-if="message"
      class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      {{ message }}
    </div>

    <div class="rounded-xl border bg-white shadow-sm">
      <div v-if="loading" class="p-8 text-center text-sm text-slate-500">
        Loading results...
      </div>

      <div v-else-if="!selectedExam" class="p-8 text-center text-sm text-slate-500">
        Select an exam to view results.
      </div>

      <div v-else-if="!students.length" class="p-8 text-center text-sm text-slate-500">
        No students found for this class.
      </div>

      <div v-else-if="!subjectColumns.length" class="p-8 text-center text-sm text-slate-500">
        No submitted subject scores found for this exam.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-100">
            <tr>
              <th class="sticky left-0 bg-slate-100 px-4 py-3 text-left font-semibold text-slate-700">
                Student
              </th>

              <th
                v-for="subject in subjectColumns"
                :key="subject"
                class="px-4 py-3 text-center font-semibold text-slate-700"
              >
                {{ subjectLabel(subject) }}
              </th>

              <th class="px-4 py-3 text-center font-semibold text-slate-700">
                Total
              </th>

              <th class="px-4 py-3 text-center font-semibold text-slate-700">
                Level
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in tableRows"
              :key="row.studentId"
              class="border-t hover:bg-slate-50"
            >
              <td class="sticky left-0 bg-white px-4 py-3 font-medium text-slate-800">
                {{ row.studentName }}
              </td>

              <td
                v-for="subject in subjectColumns"
                :key="subject"
                class="px-4 py-3 text-center"
              >
                {{ row.subjects[subject] ?? "-" }}
              </td>

              <td class="px-4 py-3 text-center font-semibold text-blue-700">
                {{ row.total }}
              </td>

              <td class="px-4 py-3 text-center font-semibold text-emerald-700">
                {{ row.level }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, computed, watch, onMounted } from "vue"
import { useClassStore } from "@/stores/classStore"
import * as XLSX from "xlsx"

import { getExams } from "@/portals/teachers/api/Grades"
import studentsApi from "../../api/Students"
import { getAllSubjectScores } from "../../api/assessments"

const classStore = useClassStore()

const exams = ref([])
const selectedExam = ref(null)

const students = ref([])
const subjectScores = ref([])

const loading = ref(false)
const exporting = ref(false)
const message = ref("")

const grade=computed(() => classStore.activeClass?.class_level_name)
const stream=computed(() => classStore.activeClass?.stream_name)

const loadExams = async () => {
  const cls = classStore.activeClass
  if (!cls) return

  try {
    const allExams = await getExams()

            exams.value = allExams.filter(exam => {
              if (cls.class_instance && exam.class_instance) {
        return String(exam.class_instance) === String(cls.class_instance)
      }

      return exam.class_level === cls.class_level &&
        exam.stream === cls.stream
    })

    if (exams.value.length) {
      selectedExam.value = exams.value[0].id
    }
  } catch (error) {
    console.error("Failed to load exams:", error)
    message.value = "Failed to load exams."
  }
}

const loadStudents = async () => {
  const cls = classStore.activeClass
  if (!cls) return

  try {
    const res = await studentsApi.filter(cls.class_level, cls.stream)
    students.value = Array.isArray(res) ? res : res.results ?? []
  } catch (error) {
    console.error("Failed to load students:", error)
    message.value = "Failed to load students."
  }
}

const loadResults = async () => {
  if (!selectedExam.value) return

  loading.value = true
  message.value = ""

  try {
    const data = await getAllSubjectScores(selectedExam.value)
    subjectScores.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Failed to load subject results:", error)
    message.value = "Failed to load subject results."
    subjectScores.value = []
  } finally {
    loading.value = false
  }
}

const subjectColumns = computed(() => {
  const subjects = new Set(subjectScores.value.map(item => item.subject))
  return Array.from(subjects)
})

const scoreMap = computed(() => {
  const map = {}

  subjectScores.value.forEach(item => {
    const key = `${item.student}_${item.subject}`
    map[key] = Number(item.score)
  })

  return map
})

const levelFromScore = (score) => {
  const value = Number(score)

  if (value >= 90) return "EE1"
  if (value >= 75) return "EE2"
  if (value >= 58) return "ME1"
  if (value >= 41) return "ME2"
  if (value >= 31) return "AE1"
  if (value >= 21) return "AE2"
  if (value >= 11) return "BE1"
  return "BE2"
}

const subjectLabel = (code) => {
  const labels = {
    MAT: "Math",
    ENG: "English",
    KIS: "Kiswahili",
    SCI: "Science",
    SST: "Social Studies",
    CRE: "CRE",
    IRE: "IRE",
    HRE: "HRE",
    PRE: "PRE",
    AGR: "Agriculture",
    CA: "Creative Arts",
    PE: "P.E."
  }

  return labels[code] || code
}

const tableRows = computed(() => {
  return students.value.map(student => {
    const subjects = {}
    let total = 0
    let count = 0

    subjectColumns.value.forEach(subject => {
      const key = `${student.id}_${subject}`
      const score = scoreMap.value[key]

      if (score !== undefined && score !== null) {
        subjects[subject] = score
        total += score
        count++
      } else {
        subjects[subject] = null
      }
    })

    const average = count ? (total / count) : 0

    return {
      studentId: student.id,
      studentName: `${student.full_name}`,
      subjects,
      total: count ? average.toFixed(2) : "-",
      level: count ? levelFromScore(average) : "-"
    }
  })
})

const exportToExcel = async () => {
  if (!tableRows.value.length) return

  exporting.value = true

  try {
    const rows = tableRows.value.map(row => {
      const exportRow = {
        Student: row.studentName
      }

      subjectColumns.value.forEach(subject => {
        exportRow[subjectLabel(subject)] = row.subjects[subject] ?? ""
      })

      exportRow["Total"] = row.total
      exportRow["Level"] = row.level

      return exportRow
    })

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Results")

    const examName =
      exams.value.find(e => e.id === selectedExam.value)?.name || "Exam"

    XLSX.writeFile(workbook, `Results_${examName}.xlsx`)
  } catch (error) {
    console.error("Failed to export results:", error)
    message.value = "Failed to export Excel file."
  } finally {
    exporting.value = false
  }
}

watch(selectedExam, async () => {
  await loadResults()
})

watch(
  () => classStore.activeClass,
  async (newCls) => {
    if (newCls) {
      await loadExams()
      await loadStudents()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  if (classStore.activeClass) {
    await loadExams()
    await loadStudents()
  }
})
</script>