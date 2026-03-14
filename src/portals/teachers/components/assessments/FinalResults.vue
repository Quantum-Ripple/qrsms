<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Final Term Results</h2>
        
      </div>

      <button
        @click="exportToExcel"
        :disabled="!tableRows.length || exporting"
        class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ exporting ? "Exporting..." : "Export to Excel" }}
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <label class="mb-2 block text-sm font-semibold text-slate-700">
          Select  Assessment
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

      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <label class="mb-2 block text-sm font-semibold text-slate-700">
          Assessment / Strand Weight (%)
        </label>

        <input
          v-model.number="strandWeight"
          type="number"
          min="0"
          max="100"
          class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />

        <p class="mt-2 text-xs text-slate-500">
          Example: 30
        </p>
      </div>

      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <label class="mb-2 block text-sm font-semibold text-slate-700">
          End-Term Exam Weight (%)
        </label>

        <input
          v-model.number="examWeight"
          type="number"
          min="0"
          max="100"
          class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />

        <p class="mt-2 text-xs text-slate-500">
          Example: 70
        </p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        @click="saveWeights"
        :disabled="!selectedExam || savingWeights || !weightsValid"
        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ savingWeights ? "Saving..." : "Save Weights" }}
      </button>

      <span v-if="weightMessage" class="text-sm text-slate-600">
        {{ weightMessage }}
      </span>
    </div>

    <div
      v-if="!weightsValid"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      Strand weight and exam weight must add up to 100.
    </div>

    <div class="rounded-xl border bg-white shadow-sm">
      <div v-if="loading" class="p-8 text-center text-sm text-slate-500">
        Loading final results...
      </div>

      <div v-else-if="!selectedExam" class="p-8 text-center text-sm text-slate-500">
        Select an exam to view final results.
      </div>

      <div v-else-if="!students.length" class="p-8 text-center text-sm text-slate-500">
        No students found for this class.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-100">
            <tr>
              <th class="sticky left-0 bg-slate-100 px-4 py-3 text-left font-semibold text-slate-700">
                Student
              </th>
              <th class="px-4 py-3 text-center font-semibold text-slate-700">
                Strand Points
              </th>
              <th class="px-4 py-3 text-center font-semibold text-slate-700">
                Strand Score ({{ strandWeight }}%)
              </th>
              <th class="px-4 py-3 text-center font-semibold text-slate-700">
                End-Term Exam ({{ examWeight }}%)
              </th>
              <th class="px-4 py-3 text-center font-semibold text-slate-700">
                Final Score
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
              <td class="px-4 py-3 text-center">
                {{ row.strandPoints }}
              </td>
              <td class="px-4 py-3 text-center">
                {{ row.weightedStrand }}
              </td>
              <td class="px-4 py-3 text-center">
                {{ row.weightedExam }}
              </td>
              <td class="px-4 py-3 text-center font-semibold text-blue-700">
                {{ row.finalScore }}
              </td>
              <td class="px-4 py-3 text-center font-semibold text-emerald-700">
                {{ row.level }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
      <div><strong>How scores are calculated</strong></div>
      <div class="mt-2">
        Strand score is converted from rubric points into a percentage, then weighted.
      </div>
      <div>
        End-term exam score is the average of submitted subject scores, then weighted.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue"
import * as XLSX from "xlsx"
import { useClassStore } from "@/stores/classStore"
import { useToast } from "vue-toastification"

import { getExams } from "@/portals/teachers/api/Grades"
import studentsApi from "../../api/Students"
import {
  getRubricScores,
  getAllSubjectScores,
  getTermWeights,
  createTermWeights,
  updateTermWeights
} from "../../api/assessments"

const classStore = useClassStore()
const toast = useToast()

const exams = ref([])
const selectedExam = ref(null)

const students = ref([])
const rubricScores = ref([])
const subjectScores = ref([])

const strandWeight = ref(30)
const examWeight = ref(70)

const termWeightId = ref(null)

const loading = ref(false)
const savingWeights = ref(false)
const exporting = ref(false)
const weightMessage = ref("")

const weightsValid = computed(() => {
  return Number(strandWeight.value) + Number(examWeight.value) === 100
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

const loadExams = async () => {
  const cls = classStore.activeClass
  if (!cls) return

  const allExams = await getExams()

  exams.value = allExams.filter(exam =>
    exam.class_level === cls.class_level &&
    exam.stream === cls.stream
  )

  if (exams.value.length) {
    selectedExam.value = exams.value[0].id
  }
}

const loadStudents = async () => {
  const cls = classStore.activeClass
  if (!cls) return

  const res = await studentsApi.filter(cls.class_level, cls.stream)
  students.value = Array.isArray(res) ? res : res.results ?? []
}

const loadWeights = async () => {
  if (!selectedExam.value) return

  try {
    const data = await getTermWeights(selectedExam.value)
    const first = Array.isArray(data) && data.length ? data[0] : null

    if (first) {
      termWeightId.value = first.id
      strandWeight.value = Number(first.strand_weight)
      examWeight.value = Number(first.exam_weight)
    } else {
      termWeightId.value = null
      strandWeight.value = 30
      examWeight.value = 70
    }
  } catch (error) {
    console.error("Failed to load term weights:", error)
  }
}

const loadResults = async () => {
  if (!selectedExam.value) return

  loading.value = true

  try {
    const [rubricData, subjectData] = await Promise.all([
      getRubricScores(selectedExam.value),
      getAllSubjectScores(selectedExam.value)
    ])

    rubricScores.value = Array.isArray(rubricData) ? rubricData : []
    subjectScores.value = Array.isArray(subjectData) ? subjectData : []
  } catch (error) {
    console.error("Failed to load final result data:", error)
    rubricScores.value = []
    subjectScores.value = []
  } finally {
    loading.value = false
  }
}

const uniqueSubStrands = computed(() => {
  return Array.from(new Set(rubricScores.value.map(item => item.substrand)))
})

const maxStrandPoints = computed(() => {
  return uniqueSubStrands.value.length * 8
})

const rubricPointMap = computed(() => {

  const map = {}

  rubricScores.value.forEach(item => {

    const studentId = Number(item.student)
    const points = Number(item.points || 0)

    if (!map[studentId]) {
      map[studentId] = 0
    }

    map[studentId] += points

  })

  return map

})

const subjectScoreMap = computed(() => {
  const map = {}

  subjectScores.value.forEach(item => {
    const studentId = item.student
    const score = Number(item.score)

    if (!map[studentId]) {
      map[studentId] = []
    }

    map[studentId].push(score)
  })

  return map
})

const tableRows = computed(() => {
  return students.value.map(student => {
    const strandPoints = rubricPointMap.value[student.id] ?? 0

    const strandPercent = maxStrandPoints.value > 0
      ? (strandPoints / maxStrandPoints.value) * 100
      : 0

    const safeStrandPercent = Math.min(strandPercent, 100)
    const weightedStrand = (safeStrandPercent * Number(strandWeight.value)) / 100

    //const weightedStrand = (strandPercent * Number(strandWeight.value)) / 100

    const examScores = subjectScoreMap.value[student.id] ?? []
    const examAverage = examScores.length
      ? examScores.reduce((sum, item) => sum + item, 0) / examScores.length
      : 0

    const weightedExam = (examAverage * Number(examWeight.value)) / 100

    const finalScore = weightedStrand + weightedExam

    return {
      studentId: student.id,
      studentName: `${student.full_name}`,
      strandPoints: strandPoints,
      weightedStrand: weightedStrand.toFixed(2),
      weightedExam: weightedExam.toFixed(2),
      finalScore: finalScore.toFixed(2),
      level: levelFromScore(finalScore)
    }
  })
})

const saveWeights = async () => {
  if (!selectedExam.value || !weightsValid.value) return

  savingWeights.value = true
  weightMessage.value = ""

  try {
    const payload = {
      exam: selectedExam.value,
      strand_weight: strandWeight.value,
      exam_weight: examWeight.value
    }

    if (termWeightId.value) {
      await updateTermWeights(termWeightId.value, payload)
    } else {
      const created = await createTermWeights(payload)
      termWeightId.value = created.id
    }

    weightMessage.value = "Weights saved successfully."
    toast.success("Weights saved Successfully!")
  } catch (error) {
    console.error("Failed to save weights:", error)
    weightMessage.value = "Failed to save weights."
    toast.success("Failed to save Weights!!")
  } finally {
    savingWeights.value = false
  }
}

const exportToExcel = async () => {
  if (!tableRows.value.length) return

  exporting.value = true

  try {
    const rows = tableRows.value.map(row => ({
      Student: row.studentName,
      "Strand Points": row.strandPoints,
      [`Strand Score (${strandWeight.value}%)`]: row.weightedStrand,
      [`End-Term Exam (${examWeight.value}%)`]: row.weightedExam,
      "Final Score": row.finalScore,
      "Level": row.level
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Final Results")

    const examName =
      exams.value.find(e => e.id === selectedExam.value)?.name || "Exam"

    XLSX.writeFile(workbook, `Final_Results_${examName}.xlsx`)
  } catch (error) {
    console.error("Failed to export Excel:", error)
  } finally {
    exporting.value = false
  }
}

watch(selectedExam, async () => {
  await loadWeights()
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