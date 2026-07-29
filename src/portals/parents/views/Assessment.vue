<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            
            <h1 class="mt-1 text-3xl font-bold text-slate-900">
              Student Performance
            </h1>
       
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-4 min-w-[280px]">
            <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Select Student
            </label>

            <div v-if="studentsLoading" class="text-sm text-slate-500">
              Loading students...
            </div>

            <div v-else-if="students.length === 0" class="text-sm text-amber-600">
              No students linked to this parent account.
            </div>

            <div v-else-if="students.length === 1" class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm text-slate-500">Student</p>
                <p class="font-semibold text-slate-800">
                  {{ currentStudentName }}
                </p>
              </div>
              <div class="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                {{ studentInitials(currentStudentName) }}
              </div>
            </div>

            <div v-else>
              <select
                v-model="selectedStudentId"
                @change="onStudentChange"
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="" disabled>Select a student</option>
                <option
                  v-for="student in students"
                  :key="student.id"
                  :value="student.id"
                >
                  {{ student.full_name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Main state -->
      <div v-if="studentsLoading || loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <div
          v-for="n in 4"
          :key="n"
          class="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div class="h-4 w-24 bg-slate-200 rounded mb-4"></div>
          <div class="h-8 w-20 bg-slate-300 rounded mb-2"></div>
          <div class="h-3 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>

      <div
        v-else-if="error"
        class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm"
      >
        <div class="flex items-start gap-3">
          <div class="mt-0.5 text-red-600">⚠️</div>
          <div>
            <p class="font-semibold">Unable to load results</p>
            <p class="text-sm mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <div
        v-else-if="!selectedStudentId && students.length > 1"
        class="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm"
      >
        <div class="mx-auto mb-4 h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
          🎓
        </div>
        <h2 class="text-lg font-semibold text-slate-800">
          Select a student to view performance
        </h2>
        <p class="mt-2 text-sm text-slate-500">
          Choose a student from the dropdown above to see exam results, subject scores, and performance trends.
        </p>
      </div>

      <div
        v-else-if="examEntries.length === 0"
        class="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm"
      >
        <div class="mx-auto mb-4 h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
          📄
        </div>
        <h2 class="text-lg font-semibold text-slate-800">
          No results available yet
        </h2>
        <p class="mt-2 text-sm text-slate-500">
          There are currently no recorded exam or assessment results for
          <span class="font-medium text-slate-700">{{ currentStudentName }}</span>.
        </p>
      </div>

      <div v-else class="space-y-8">
        <!-- Student overview -->
        <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">Student</p>
            <p class="mt-2 text-xl font-bold text-slate-900">
              {{ currentStudentName }}
            </p>
            <p class="mt-1 text-sm text-slate-500">
              Performance overview
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">Exams / Assessments</p>
            <p class="mt-2 text-3xl font-bold text-slate-900">
              {{ examEntries.length }}
            </p>
            <p class="mt-1 text-sm text-slate-500">
              Recorded result sets
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">Average Score</p>
            <p class="mt-2 text-3xl font-bold text-slate-900">
              {{ overallAverageDisplay }}
            </p>
            <p class="mt-1 text-sm text-slate-500">
              Across all subjects and exams
            </p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">Best Exam</p>
            <p class="mt-2 text-xl font-bold text-slate-900 truncate">
              {{ bestExamName }}
            </p>
            <p class="mt-1 text-sm text-slate-500">
              {{ bestExamAverageDisplay }}
            </p>
          </div>
        </section>

        <!-- Chart -->
        <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div class="flex flex-col gap-1 mb-5">
            <h2 class="text-lg font-semibold text-slate-900">
              Subject Performance Trend
            </h2>
          
          </div>

          <div v-if="chartData.datasets.length > 0" class="h-[380px]">
            <Line :data="chartData" :options="chartOptions" />
          </div>

          <div v-else class="rounded-xl bg-slate-50 border border-slate-200 p-6 text-sm text-slate-500">
            No chart data available.
          </div>
        </section>

        <!-- Exam cards -->
        <section class="space-y-5">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">
                Detailed Results
              </h2>
              <p class="text-sm text-slate-500">
                Expand any exam or assessment to view subject-level results.
              </p>
            </div>

            <button
              v-if="examEntries.length > 1"
              @click="toggleAllExams"
              class="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              {{ allExpanded ? 'Collapse All' : 'Expand All' }}
            </button>
          </div>

          <div
            v-for="exam in examEntries"
            :key="exam.name"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              @click="toggleExam(exam.name)"
              class="w-full px-5 sm:px-6 py-5 text-left hover:bg-slate-50 transition"
            >
              <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div class="flex items-center gap-3">
                    <h3 class="text-lg font-semibold text-slate-900">
                      {{ exam.name }}
                    </h3>
                    <span
                      class="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                    >
                      {{ exam.grades.length }} subjects
                    </span>
                  </div>
                  <p class="mt-2 text-sm text-slate-500">
                    Average score: <span class="font-semibold text-slate-700">{{ formatScore(exam.average) }}</span>
                  </p>
                </div>

                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <p class="text-xs uppercase tracking-wide text-slate-400">
                      Performance
                    </p>
                    <p class="text-sm font-semibold text-slate-700">
                      {{ performanceLabel(exam.average) }}
                    </p>
                  </div>

                  <div class="text-slate-400 text-lg">
                    {{ expandedExams.includes(exam.name) ? '▲' : '▼' }}
                  </div>
                </div>
              </div>
            </button>

            <transition name="expand">
              <div v-if="expandedExams.includes(exam.name)" class="border-t border-slate-200">
                <div class="p-5 sm:p-6">
                  <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                      <thead>
                        <tr class="border-b border-slate-200">
                          <th class="px-4 py-3 text-left font-semibold text-slate-600">Subject</th>
                          <th class="px-4 py-3 text-left font-semibold text-slate-600">Score (%)</th>
                          <th class="px-4 py-3 text-left font-semibold text-slate-600">Level</th>
                          <th class="px-4 py-3 text-left font-semibold text-slate-600">Remarks</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr
                          v-for="(grade, index) in exam.grades"
                          :key="`${exam.name}-${index}-${grade.subject}`"
                          class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition"
                        >
                          <td class="px-4 py-4 font-medium text-slate-800">
                            {{ grade.subject }}
                          </td>
                          <td class="px-4 py-4 text-slate-700">
                            {{ formatScore(grade.score) }}
                          </td>
                          <td class="px-4 py-4">
                            <span
                              class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                              :class="levelBadgeClass(grade.grade_letter)"
                            >
                              {{ grade.grade_letter || '—' }}
                            </span>
                          </td>
                          <td class="px-4 py-4 text-slate-600">
                            {{ grade.remarks || '—' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div class="mt-5 grid gap-4 md:grid-cols-3">
                    <div class="rounded-xl bg-slate-50 border border-slate-200 p-4">
                      <p class="text-xs uppercase tracking-wide text-slate-500">Average</p>
                      <p class="mt-2 text-lg font-bold text-slate-900">
                        {{ formatScore(exam.average) }}
                      </p>
                    </div>

                    <div class="rounded-xl bg-slate-50 border border-slate-200 p-4">
                      <p class="text-xs uppercase tracking-wide text-slate-500">Highest Subject Score</p>
                      <p class="mt-2 text-lg font-bold text-slate-900">
                        {{ formatScore(exam.highestScore) }}
                      </p>
                    </div>

                    <div class="rounded-xl bg-slate-50 border border-slate-200 p-4">
                      <p class="text-xs uppercase tracking-wide text-slate-500">Lowest Subject Score</p>
                      <p class="mt-2 text-lg font-bold text-slate-900">
                        {{ formatScore(exam.lowestScore) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getStudentGrades } from '../api/assessments'
import { getStudent } from '../api/Students'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
)

const groupedGrades = ref({})
const loading = ref(false)
const error = ref('')
const students = ref([])
const studentsLoading = ref(true)
const selectedStudentId = ref('')
const expandedExams = ref([])

const currentStudent = computed(() => {
  return students.value.find(student => String(student.id) === String(selectedStudentId.value)) || null
})

const currentStudentName = computed(() => {
  if (currentStudent.value?.full_name) return currentStudent.value.full_name

  if (students.value.length === 1) {
    return students.value[0].full_name || 'Student'
  }

  return 'Student'
})

const examEntries = computed(() => {
  return Object.entries(groupedGrades.value || {}).map(([name, grades]) => {
    const safeGrades = Array.isArray(grades) ? grades : []

    const numericScores = safeGrades
      .map(item => Number(item.score))
      .filter(score => !Number.isNaN(score))

    const average = numericScores.length
      ? numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length
      : 0

    const highestScore = numericScores.length ? Math.max(...numericScores) : 0
    const lowestScore = numericScores.length ? Math.min(...numericScores) : 0

    return {
      name,
      grades: safeGrades,
      average,
      highestScore,
      lowestScore,
    }
  })
})

const allScores = computed(() => {
  return examEntries.value.flatMap(exam =>
    exam.grades
      .map(grade => Number(grade.score))
      .filter(score => !Number.isNaN(score))
  )
})

const overallAverage = computed(() => {
  if (!allScores.value.length) return 0
  return allScores.value.reduce((sum, score) => sum + score, 0) / allScores.value.length
})

const overallAverageDisplay = computed(() => formatScore(overallAverage.value))

const bestExam = computed(() => {
  if (!examEntries.value.length) return null

  return [...examEntries.value].sort((a, b) => b.average - a.average)[0]
})

const bestExamName = computed(() => bestExam.value?.name || '—')
const bestExamAverageDisplay = computed(() => {
  if (!bestExam.value) return 'No results yet'
  return `${formatScore(bestExam.value.average)} average`
})

const allExpanded = computed(() => {
  return examEntries.value.length > 0 && expandedExams.value.length === examEntries.value.length
})

const chartData = computed(() => {
  const exams = examEntries.value

  if (!exams.length) {
    return {
      labels: [],
      datasets: [],
    }
  }

  const subjectSet = new Set()

  exams.forEach(exam => {
    exam.grades.forEach(grade => {
      if (grade.subject) {
        subjectSet.add(grade.subject)
      }
    })
  })

  const subjects = Array.from(subjectSet)

  const datasets = exams.map((exam, index) => {
    return {
      label: exam.name,
      data: subjects.map(subject => {
        const found = exam.grades.find(item => item.subject === subject)
        return found ? Number(found.score) : null
      }),
      borderWidth: index === exams.length - 1 ? 3 : 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.35,
      fill: false,
    }
  })

  return {
    labels: subjects,
    datasets,
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'nearest',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 14,
        boxHeight: 14,
        usePointStyle: true,
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label(context) {
          const value = context.raw
          if (value === null || value === undefined) {
            return `${context.dataset.label}: No score`
          }
          return `${context.dataset.label}: ${value}%`
        },
      },
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: {
        callback(value) {
          return `${value}%`
        },
      },
      title: {
        display: true,
        text: 'Score',
      },
      grid: {
        drawBorder: false,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}

const fetchGrades = async (studentId) => {
  if (!studentId) {
    groupedGrades.value = {}
    expandedExams.value = []
    return
  }

  loading.value = true
  error.value = ''

  try {
    const data = await getStudentGrades(studentId)
    groupedGrades.value = data && typeof data === 'object' ? data : {}

    const examNames = Object.keys(groupedGrades.value)
    expandedExams.value = examNames.length ? [examNames[0]] : []
  } catch (err) {
    console.error('Error fetching grades:', err)
    groupedGrades.value = {}
    expandedExams.value = []
    error.value = 'Failed to load student results. Please try again.'
  } finally {
    loading.value = false
  }
}

const onStudentChange = async () => {
  await fetchGrades(selectedStudentId.value)
}

const toggleExam = (examName) => {
  if (expandedExams.value.includes(examName)) {
    expandedExams.value = expandedExams.value.filter(name => name !== examName)
  } else {
    expandedExams.value = [...expandedExams.value, examName]
  }
}

const toggleAllExams = () => {
  if (allExpanded.value) {
    expandedExams.value = []
  } else {
    expandedExams.value = examEntries.value.map(exam => exam.name)
  }
}

const formatScore = (value) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '—'
  return `${numeric.toFixed(1)}%`
}

const performanceLabel = (score) => {
  const numeric = Number(score)

  if (Number.isNaN(numeric)) return 'No rating'
  if (numeric >= 90) return 'Excellent'
  if (numeric >= 75) return 'Very Good'
  if (numeric >= 58) return 'Good'
  if (numeric >= 41) return 'Fair'
  if (numeric >= 21) return 'Needs Support'
  return 'Below Expectation'
}

const levelBadgeClass = (level) => {
  switch (level) {
    case 'EE1':
    case 'EE2':
      return 'bg-emerald-100 text-emerald-700'
    case 'ME1':
    case 'ME2':
      return 'bg-blue-100 text-blue-700'
    case 'AE1':
    case 'AE2':
      return 'bg-amber-100 text-amber-700'
    case 'BE1':
    case 'BE2':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

const studentInitials = (name) => {
  if (!name) return 'S'

  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map(part => part.charAt(0).toUpperCase()).join('')
}

onMounted(async () => {
  studentsLoading.value = true
  error.value = ''

  try {
    const data = await getStudent()
    students.value = Array.isArray(data) ? data : []

    if (students.value.length === 1) {
      selectedStudentId.value = String(students.value[0].id)
      await fetchGrades(selectedStudentId.value)
    }
  } catch (err) {
    console.error('Error fetching students:', err)
    students.value = []
    error.value = 'Unable to load students linked to this parent account.'
  } finally {
    studentsLoading.value = false
  }
})
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.28s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>