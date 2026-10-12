
<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { getResultsFilters, getClassResults } from '../api/Grades'
import StudentResults from '../components/assessments/results/StudentResults.vue'
import SubjectResults from '../components/assessments/results/SubjectResults.vue'
import Rankings from '../components/assessments/results/Rankings.vue'
import LevelBadge from '../components/assessments/results/LevelBadge.vue'
import { exportResultsCsv } from '../utils/resultsExport'
import { useAuthStore } from '@/stores/authStore'

const tabs = [
  { key: 'class', label: 'Class Result' },
  { key: 'student', label: 'Student Results' },
  { key: 'subject', label: 'Subjects' },
  { key: 'ranking', label: 'Rankings' },
]

const activeTab = ref('class')
const activeResults = ref(null)
const auth = useAuthStore()

const exams = ref([])
const grades = ref([])
const streams = ref([])
const examId = ref(null)
const gradeId = ref(null)
const streamId = ref(null)
const studentId = ref(null)

const showGrade = computed(() => activeTab.value !== 'student')
const showStream = computed(() => ['class', 'subject'].includes(activeTab.value))
const selectedExamName = computed(() => {
  const exam = exams.value.find((item) => item.id === examId.value)
  return exam ? `${exam.name}${exam.term ? ` - ${exam.term}` : ''}` : ''
})
const selectedGradeName = computed(() =>
  grades.value.find((grade) => grade.id === gradeId.value)?.name ?? ''
)

onMounted(async () => {
  const f = await getResultsFilters()
  exams.value = f.exams
  examId.value = f.exams[0]?.id ?? null
})

watch(examId, async (id) => {
  grades.value = []
  gradeId.value = null

  if (!id) return

  const f = await getResultsFilters({ exam: id })
  grades.value = f.grades
  gradeId.value = f.grades[0]?.id ?? null
})

watch(gradeId, async (id) => {
  streams.value = []
  streamId.value = null

  if (!id) return

  const f = await getResultsFilters({
    exam: examId.value,
    grade: id,
  })

  streams.value = f.streams
})

// Class results
const data = ref(null)
const loading = ref(false)
const error = ref('')
let req = 0

async function loadClass() {
  if (activeTab.value !== 'class' || !examId.value || !gradeId.value) return

  const id = ++req
  loading.value = true
  error.value = ''

  try {
    const d = await getClassResults(examId.value, gradeId.value, {
      stream: streamId.value || undefined,
    })

    if (id === req) data.value = d
  } catch (e) {
    if (id === req) {
      data.value = null
      error.value = e.response?.data?.detail || 'Could not load class results.'
    }
  } finally {
    if (id === req) loading.value = false
  }
}

watch([examId, gradeId, streamId, activeTab], loadClass)

const maxLevel = computed(() =>
  Math.max(1, ...(data.value?.level_counts ?? []).map(l => l.count))
)

const fmt = (n) => (n == null ? '—' : Number(n).toFixed(2))
const canExport = computed(() => activeTab.value === 'class'
  ? Boolean(data.value?.results?.length)
  : Boolean(activeResults.value?.canExport))

function viewStudent(row) {
  studentId.value = row.student_id
  activeTab.value = 'student'
}

// Export the currently displayed class results
function exportResults() {
  if (activeTab.value !== 'class') {
    activeResults.value?.exportResults()
    return
  }
  if (!data.value?.results?.length) return

  const subjects = data.value.subjects

  const headers = [
    'Rank',
    'Admission Number',
    'Student Name',
    ...subjects.map(s => s.subject_display),
    'Average',
    'Level',
  ]

  const rows = data.value.results.map(r => [
    r.rank,
    r.admission_number,
    `${r.first_name} ${r.last_name}`,
    ...subjects.map(s => r.scores[s.subject] ?? ''),
    r.average_score ?? '',
    r.level ?? '',
  ])

  exportResultsCsv(headers, rows, 'class-results.csv', [
    ['Exam', selectedExamName.value],
    ['Grade', selectedGradeName.value],
  ])
}

function printResults() {
  const previousTitle = document.title
  document.title = auth.user?.school_name || previousTitle

  window.addEventListener('afterprint', () => {
    document.title = previousTitle
  }, { once: true })

  window.print()
}
</script>

<template>
  <div class="mx-auto min-w-0 max-w-7xl space-y-5 p-3 pb-24 sm:p-6 md:pb-6">

    <!-- Heading and actions -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl">Results</h1>
      <div class="no-print flex items-center gap-2">
        <button
          @click="exportResults"
          :disabled="!canExport"
          class="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          Export
        </button>

        <button
          @click="printResults"
          :disabled="!canExport"
          class="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          Print
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <nav
      class="no-print flex gap-5 overflow-x-auto border-b border-gray-200"
      aria-label="Results sections"
    >
      <button
        v-for="t in tabs"
        :key="t.key"
        @click="activeTab = t.key"
        class="shrink-0 border-b-2 py-3 text-sm font-medium"
        :class="activeTab === t.key
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-gray-500 hover:text-gray-800'"
      >
        {{ t.label }}
      </button>
    </nav>

    <!-- Filters: left aligned -->
   <!-- Filters: left aligned -->
<div class="no-print flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
  
  <!-- Exam Select -->
  <select
    v-model="examId"
    class="w-full sm:w-56 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
  >
    <option :value="null" disabled>Select exam</option>
    <option v-for="e in exams" :key="e.id" :value="e.id">
      {{ e.name }} - {{ e.term }}
    </option>
  </select>

  <!-- Grade Select -->
  <select
    v-if="showGrade"
    v-model="gradeId"
    :disabled="!grades.length"
    class="w-full sm:w-56 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200"
  >
    <option :value="null" disabled>Select grade</option>
    <option v-for="g in grades" :key="g.id" :value="g.id">
      {{ g.name }}
    </option>
  </select>

  <!-- Stream Select -->
  <select
    v-if="showStream"
    v-model="streamId"
    :disabled="!streams.length"
    class="w-full sm:w-56 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200"
  >
    <option :value="null">All streams</option>
    <option v-for="s in streams" :key="s.id" :value="s.id">
      {{ s.name }}
    </option>
  </select>
  
</div>

    <!-- Class Results -->
    <section v-if="activeTab === 'class'" class="print-area space-y-5">
      <div class="print-only">
        <h1 class="text-xl font-semibold">Class Results</h1>
        <p>Exam: {{ selectedExamName }} · Grade: {{ selectedGradeName }}</p>
      </div>
      <p
        v-if="error"
        class="no-print rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
      >
        {{ error }}
      </p>

      <p
        v-else-if="loading && !data"
        class="py-8 text-center text-sm text-gray-500"
      >
        Loading results…
      </p>

      <p
        v-else-if="!data"
        class="no-print py-8 text-center text-sm text-gray-500"
      >
        Choose an exam and grade to view results.
      </p>

      <template v-else>
        <!-- Summary -->
        <div
          class="grid grid-cols-2 divide-x divide-y divide-gray-200 rounded border border-gray-200 bg-white sm:grid-cols-4 sm:divide-y-0"
          :class="{ 'opacity-60': loading }"
        >
          <div class="p-3">
            <p class="text-sm text-gray-500">Class average</p>
            <p class="mt-1 text-xl font-semibold text-gray-900">
              {{ fmt(data.stats.class_average) }}
            </p>
            <p class="mt-1 text-xs text-gray-500">
              {{ data.stats.student_count }} students
            </p>
          </div>

          <div class="p-3">
            <p class="text-sm text-gray-500">Highest average</p>
            <p class="mt-1 text-xl font-semibold text-gray-900">
              {{ fmt(data.stats.highest_average) }}
            </p>
          </div>

          <div class="p-3">
            <p class="text-sm text-gray-500">Lowest average</p>
            <p class="mt-1 text-xl font-semibold text-gray-900">
              {{ fmt(data.stats.lowest_average) }}
            </p>
          </div>

          <div class="p-3">
            <p class="text-sm text-gray-500">Pass rate</p>
            <p class="mt-1 text-xl font-semibold text-gray-900">
              {{ data.stats.pass_rate }}%
            </p>
            <p class="mt-1 text-xs text-gray-500">Average ≥ 50</p>
          </div>
        </div>

        <!-- Mobile results -->
        <div
          class="overflow-hidden rounded border border-gray-200 bg-white sm:hidden"
          :class="{ 'opacity-60': loading }"
        >
          <div
            v-if="!data.results.length"
            class="p-6 text-center text-sm text-gray-500"
          >
            No students found.
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="r in data.results"
              :key="r.student_id"
              class="space-y-3 p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium text-gray-900">
                    {{ r.first_name }} {{ r.last_name }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500">
                    {{ r.admission_number }} · Rank {{ r.rank }}
                  </p>
                </div>

                <div class="shrink-0 text-right">
                  <p class="text-lg font-semibold tabular-nums text-gray-900">
                    {{ fmt(r.average_score) }}
                  </p>
                  <LevelBadge :level="r.level" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-100 pt-3">
                <div
                  v-for="s in data.subjects"
                  :key="s.subject"
                  class="flex min-w-0 items-center justify-between gap-2 text-sm"
                >
                  <span class="truncate text-gray-500">{{ s.subject_display }}</span>
                  <span class="shrink-0 font-medium tabular-nums text-gray-900">
                    {{ r.scores[s.subject] ?? '—' }}
                  </span>
                </div>
              </div>

              <button
                @click="viewStudent(r)"
                class="no-print min-h-10 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                View student results →
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop results table -->
        <div
          class="desktop-results hidden overflow-x-auto rounded border border-gray-200 bg-white sm:block"
          :class="{ 'opacity-60': loading }"
        >
          <table class="min-w-full text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-4 py-3">Rank</th>
                <th class="px-4 py-3">Adm No</th>
                <th class="px-4 py-3">Student</th>

                <th
                  v-for="s in data.subjects"
                  :key="s.subject"
                  class="whitespace-nowrap px-4 py-3 text-right"
                >
                  {{ s.subject_display }}
                </th>

                <th class="px-4 py-3 text-right">Average</th>
                <th class="px-4 py-3">Level</th>
                <th class="no-print px-4 py-3"></th>
                
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="r in data.results"
                :key="r.student_id"
                class="hover:bg-gray-50"
              >
                <td class="px-4 py-3 font-medium text-gray-900">{{ r.rank }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-500">
                  {{ r.admission_number }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                  {{ r.first_name }} {{ r.last_name }}
                </td>

                <td
                  v-for="s in data.subjects"
                  :key="s.subject"
                  class="px-4 py-3 text-right tabular-nums"
                >
                  <span :class="r.scores[s.subject] == null ? 'text-gray-300' : 'text-gray-700'">
                    {{ r.scores[s.subject] ?? '—' }}
                  </span>
                </td>

                <td class="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                  {{ fmt(r.average_score) }}
                </td>

                <td class="px-4 py-3">
                  <LevelBadge :level="r.level" />
                </td>

                <td class="no-print px-4 py-3 text-right">
                  <button
                    @click="viewStudent(r)"
                    class="font-medium text-indigo-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>

              <tr v-if="!data.results.length">
                <td
                  :colspan="6 + data.subjects.length"
                  class="px-4 py-8 text-center text-gray-500"
                >
                  No students found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

                <!-- Performance distribution -->
            <div class="w-full lg:w-1/2">
            <div class="rounded border border-gray-200 bg-white p-4">
                <h2 class="mb-4 text-sm font-semibold text-gray-900">
                Performance distribution
                </h2>

                <div class="space-y-4">
                <div
                    v-for="l in data.level_counts"
                    :key="l.level"
                    class="grid grid-cols-[44px_minmax(0,1fr)_36px] items-center gap-3"
                >
                    <span class="text-sm font-medium text-gray-700">
                    {{ l.level }}
                    </span>

                    <div class="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                        class="h-full rounded-full bg-indigo-600"
                        :style="{ width: (l.count / maxLevel * 100) + '%' }"
                    ></div>
                    </div>

                    <span class="text-right text-sm tabular-nums text-gray-700">
                    {{ l.count }}
                    </span>
                </div>
                </div>
            </div>

        </div>
      </template>
    </section>

    <StudentResults
      v-else-if="activeTab === 'student'"
      ref="activeResults"
      :exam-id="examId"
      :student-id="studentId"
      :exam-name="selectedExamName"
      :grade-name="selectedGradeName"
    />

    <SubjectResults
      v-else-if="activeTab === 'subject'"
      ref="activeResults"
      :exam-id="examId"
      :class-level-id="gradeId"
      :stream-id="streamId"
      :exam-name="selectedExamName"
      :grade-name="selectedGradeName"
    />

    <Rankings
      v-else-if="activeTab === 'ranking'"
      ref="activeResults"
      :exam-id="examId"
      :class-level-id="gradeId"
      :exam-name="selectedExamName"
      :grade-name="selectedGradeName"
    />
  </div>
</template>

<style>
@media print {
  html,
  body,
  #app,
  main {
    height: auto !important;
    overflow: visible !important;
  }

  body * {
    visibility: hidden;
  }

  .print-area,
  .print-area * {
    visibility: visible;
  }

  .print-area {
    position: absolute;
    inset: 0;
    width: 100%;
    padding: 0;
    opacity: 1 !important;
  }

  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  .print-area .sm\:hidden {
    display: none !important;
  }

  .print-area .desktop-results {
    display: block !important;
    overflow: visible !important;
  }

  .print-area .overflow-x-auto {
    overflow: visible !important;
  }

  .print-area .no-print {
    display: none !important;
  }

  .print-area table {
    width: 100%;
    font-size: 10px;
    border-collapse: collapse;
  }

  .print-area th,
  .print-area td {
    padding: 5px;
    border-bottom: 1px solid #ddd;
  }

  .print-area tr {
    break-inside: avoid;
  }

  .print-area .rounded,
  .print-area .rounded-lg {
    border-radius: 0;
  }

  .print-area .bg-indigo-600 {
    background-color: #4f46e5 !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}

.print-only {
  display: none;
}
</style>
