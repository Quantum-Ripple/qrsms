<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <h1 class="text-3xl font-bold text-slate-900">Student Performance</h1>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-4 min-w-[280px]">
          <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Select Student</label>

          <div v-if="studentsLoading" class="text-sm text-slate-500">Loading students...</div>
          <div v-else-if="students.length === 0" class="text-sm text-amber-600">No students linked to this parent account.</div>

          <div v-else-if="students.length === 1" class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm text-slate-500">Student</p>
              <p class="font-semibold text-slate-800">{{ currentStudentName }}</p>
            </div>
            <div class="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              {{ studentInitials(currentStudentName) }}
            </div>
          </div>

          <select
            v-else v-model="selectedStudentId" @change="onStudentChange"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled>Select a student</option>
            <option v-for="s in students" :key="s.id" :value="String(s.id)">{{ s.full_name }}</option>
          </select>
        </div>
      </div>

      <!-- loading skeleton -->
      <div v-if="studentsLoading || (loading && !data)" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <div v-for="n in 4" :key="n" class="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="h-4 w-24 bg-slate-200 rounded mb-4"></div>
          <div class="h-8 w-20 bg-slate-300 rounded mb-2"></div>
          <div class="h-3 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>

      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
        <p class="font-semibold">Unable to load results</p>
        <p class="text-sm mt-1">{{ error }}</p>
      </div>

      <div v-else-if="!selectedStudentId && students.length > 1" class="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
        <div class="mx-auto mb-4 h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">🎓</div>
        <h2 class="text-lg font-semibold text-slate-800">Select a student to view performance</h2>
      </div>

      <div v-else-if="data && !data.exams.length" class="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
        <div class="mx-auto mb-4 h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">📄</div>
        <h2 class="text-lg font-semibold text-slate-800">No results available yet</h2>
        <p class="mt-2 text-sm text-slate-500">
          Results for <span class="font-medium text-slate-700">{{ currentStudentName }}</span> will appear here once the school releases them.
        </p>
      </div>

      <div v-else-if="data" class="space-y-8" :class="{ 'opacity-60': loading }">
        <!-- exam picker -->
        <div class="flex flex-wrap items-center gap-3">
          <label class="text-sm font-semibold text-slate-600">Assessment</label>
          <select
            v-model="selectedExamId" @change="load"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option v-for="e in data.exams" :key="e.id" :value="e.id">{{ e.name }} - {{ e.term }}</option>
          </select>
        </div>

        <!-- overview -->
        <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">Student</p>
            <p class="mt-2 text-xl font-bold text-slate-900">{{ data.student.name }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ data.student.class_name }} · Adm {{ data.student.admission_number }}</p>
            <p v-if="data.student.class_teacher" class="text-sm text-slate-500">Class teacher: {{ data.student.class_teacher }}</p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">Average score</p>
            <p class="mt-2 text-3xl font-bold text-slate-900">{{ formatScore(data.stats.average_score) }}</p>
            <p class="mt-1 text-sm text-slate-500">Total marks {{ data.stats.total_score }}</p>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">Performance level</p>
            <p class="mt-2">
              <span class="inline-flex rounded-full px-3 py-1 text-lg font-bold" :class="levelBadgeClass(data.stats.level)">{{ data.stats.level }}</span>
            </p>
            <p class="mt-1 text-sm text-slate-500">{{ levelLabel(data.stats.level) }}</p>
          </div>

          <div v-if="data.stats.stream_position" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">Class position</p>
            <p class="mt-2 text-3xl font-bold text-slate-900">
              {{ data.stats.stream_position }}<span class="text-lg text-slate-400"> / {{ data.stats.stream_size }}</span>
            </p>
            <p class="mt-1 text-sm text-slate-500">Grade: {{ data.stats.grade_position }} of {{ data.stats.grade_size }}</p>
          </div>
          <div v-else class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">Assessment</p>
            <p class="mt-2 text-xl font-bold text-slate-900 truncate">{{ data.exam_name }}</p>
          </div>
        </section>

        <!-- subjects -->
        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="px-5 py-4 border-b border-slate-200">
            <h2 class="text-lg font-semibold text-slate-900">{{ data.exam_name }} - Subject results</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 text-left text-slate-600">
                  <th class="px-4 py-3 font-semibold">Subject</th>
                  <th class="px-4 py-3 font-semibold">Score</th>
                  <th class="px-4 py-3 font-semibold">Class average</th>
                  <th class="px-4 py-3 font-semibold">Level</th>
                  <th class="px-4 py-3 font-semibold">Teacher</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in data.subjects" :key="s.subject" class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                  <td class="px-4 py-3 font-medium text-slate-800">{{ s.subject_display }}</td>
                  <td class="px-4 py-3 text-slate-700">
                    <span v-if="s.missing" class="text-slate-300">—</span>
                    <template v-else>
                      {{ formatScore(s.score) }}
                      <span class="ml-1 text-xs font-semibold" :class="s.score >= s.class_average ? 'text-emerald-600' : 'text-red-500'">
                        {{ s.score >= s.class_average ? '+' : '' }}{{ (s.score - s.class_average).toFixed(1) }}
                      </span>
                    </template>
                  </td>
                  <td class="px-4 py-3 text-slate-500">{{ formatScore(s.class_average) }}</td>
                  <td class="px-4 py-3">
                    <span v-if="s.level" class="inline-flex rounded-full px-3 py-1 text-xs font-semibold" :class="levelBadgeClass(s.level)">{{ s.level }}</span>
                    <span v-else class="text-slate-300">—</span>
                  </td>
                  <td class="px-4 py-3 text-slate-600">{{ s.teachers.join(', ') || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- teacher comment -->
        <section v-if="data.teacher_comment" class="rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-blue-700">Class teacher's comment</h2>
          <p class="mt-2 text-slate-800">{{ data.teacher_comment.comment }}</p>
          <p v-if="data.teacher_comment.author" class="mt-2 text-sm text-slate-500">— {{ data.teacher_comment.author }}</p>
        </section>

        <!-- trend -->
        <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-semibold text-slate-900">Progress across assessments</h2>
            <select
              v-model="trendMetric"
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="overall">Overall average</option>
              <option v-for="s in data.trend_subjects" :key="s.subject" :value="s.subject">{{ s.subject_display }}</option>
            </select>
          </div>

          <div v-if="data.trend.length > 1" class="h-[320px]">
            <Line :data="chartData" :options="chartOptions" />
          </div>
          <div v-else class="rounded-xl bg-slate-50 border border-slate-200 p-6 text-sm text-slate-500">
            The progress chart appears once there are results from two or more assessments.
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getParentStudentResult } from '../api/assessments'
import { getStudent } from '../api/Students'

import {
  Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

const students = ref([])
const studentsLoading = ref(true)
const selectedStudentId = ref('')
const selectedExamId = ref(null)
const trendMetric = ref('overall')

const data = ref(null)
const loading = ref(false)
const error = ref('')
let requestId = 0

const currentStudentName = computed(() => {
  if (data.value?.student?.name) return data.value.student.name
  const s = students.value.find(x => String(x.id) === String(selectedStudentId.value)) ?? students.value[0]
  return s?.full_name || 'Student'
})

async function load() {
  if (!selectedStudentId.value) { data.value = null; return }
  const id = ++requestId
  loading.value = true
  error.value = ''
  try {
    const d = await getParentStudentResult({ student: selectedStudentId.value, exam: selectedExamId.value })
    if (id !== requestId) return
    data.value = d
    selectedExamId.value = d.exam_id
  } catch (err) {
    console.error('Error fetching results:', err)
    if (id === requestId) {
      data.value = null
      error.value = err.response?.data?.detail || 'Failed to load student results. Please try again.'
    }
  } finally {
    if (id === requestId) loading.value = false
  }
}

const onStudentChange = () => {
  selectedExamId.value = null
  trendMetric.value = 'overall'
  data.value = null
  load()
}

/* ---------- chart ---------- */
const subjectName = (code) =>
  data.value?.trend_subjects?.find(s => s.subject === code)?.subject_display ?? code

const chartData = computed(() => {
  const points = data.value?.trend ?? []
  const key = trendMetric.value
  return {
    labels: points.map(p => p.exam_name),
    datasets: [{
      label: key === 'overall' ? 'Average' : subjectName(key),
      data: points.map(p => (key === 'overall' ? p.average_score : p.subject_scores?.[key] ?? null)),
      borderWidth: 3, pointRadius: 5, pointHoverRadius: 7, tension: 0.35, fill: false, spanGaps: true,
    }],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (c) => (c.raw == null ? 'No score' : `${c.raw}%`) } },
  },
  scales: {
    y: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } },
    x: { grid: { display: false } },
  },
}

/* ---------- helpers ---------- */
const formatScore = (value) => {
  const n = Number(value)
  return Number.isNaN(n) ? '—' : `${n.toFixed(1)}%`
}

const levelLabel = (level) =>
  ({ EE: 'Exceeding expectation', ME: 'Meeting expectation', AE: 'Approaching expectation', BE: 'Below expectation' })[level?.slice(0, 2)] ?? ''

const levelBadgeClass = (level) => ({
  EE: 'bg-emerald-100 text-emerald-700',
  ME: 'bg-blue-100 text-blue-700',
  AE: 'bg-amber-100 text-amber-700',
  BE: 'bg-red-100 text-red-700',
}[level?.slice(0, 2)] ?? 'bg-slate-100 text-slate-600')

const studentInitials = (name) =>
  (name || 'S').trim().split(/\s+/).slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('')

onMounted(async () => {
  try {
    const list = await getStudent()
    students.value = Array.isArray(list) ? list : []
    if (students.value.length === 1) {
      selectedStudentId.value = String(students.value[0].id)
      await load()
    }
  } catch (err) {
    console.error('Error fetching students:', err)
    error.value = 'Unable to load students linked to this parent account.'
  } finally {
    studentsLoading.value = false
  }
})
</script>