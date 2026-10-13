<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useClassStore } from '@/stores/classStore'
import * as XLSX from 'xlsx'
import { getTeacherClassResults } from '../../api/assessments'
import { levelClass } from '../../utils/levelStyle'

const router = useRouter()
const classStore = useClassStore()

const data = ref(null)
const selectedExam = ref(null)
const loading = ref(false)
const message = ref('')
let requestId = 0

const cls = computed(() => classStore.activeClass)
const exams = computed(() => data.value?.exams ?? [])
const rows = computed(() => data.value?.results ?? [])
const subjects = computed(() => data.value?.subjects ?? [])
const stats = computed(() => data.value?.stats ?? null)
const fmt = (n) => (n == null ? '-' : Number(n).toFixed(2))

async function load(examId = null) {
  const c = cls.value
  if (!c) return
  const id = ++requestId
  loading.value = true
  message.value = ''
  try {
    const d = await getTeacherClassResults({ classLevel: c.class_level, stream: c.stream, exam: examId })
    if (id !== requestId) return
    data.value = d
    selectedExam.value = d.exam_id ?? null
  } catch (e) {
    if (id !== requestId) return
    data.value = null
    selectedExam.value = null
    message.value = e.response?.data?.detail || 'Failed to load results.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

// fires on mount and whenever the teacher switches class
watch(cls, () => { data.value = null; load() }, { immediate: true })

function viewStudent(row) {
  router.push({
    name: 'TeacherStudentResult',
    params: { studentId: row.student_id },
    query: { exam: selectedExam.value },
  })
}

function exportToExcel() {
  if (!rows.value.length) return
  const sheet = rows.value.map((r) => {
    const o = { Rank: r.rank, 'Adm No': r.admission_number, Student: `${r.first_name} ${r.last_name}` }
    subjects.value.forEach((s) => { o[s.subject_display] = r.scores[s.subject] ?? '' })
    o.Average = r.average_score
    o.Level = r.level
    return o
  })
  const summary = { Rank: '', 'Adm No': '', Student: 'CLASS AVERAGE' }
  subjects.value.forEach((s) => { summary[s.subject_display] = data.value.subject_averages[s.subject] ?? '' })
  summary.Average = stats.value.class_average
  summary.Level = stats.value.class_level

  const ws = XLSX.utils.json_to_sheet([...sheet, {}, summary])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Results')
  XLSX.writeFile(wb, `Results_${data.value.exam_name || 'Exam'}.xlsx`)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h2 class="text-2xl font-bold text-slate-800">
        {{ cls?.class_level_name }} {{ cls?.stream_name }} Results
      </h2>
      <button
        @click="exportToExcel" :disabled="!rows.length"
        class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >Export to Excel</button>
    </div>

<div class="rounded-xl border bg-white p-4 shadow-sm">
  <label class="mb-2 block text-sm font-semibold text-slate-700">Select Assessment</label>
  <select
    v-model="selectedExam" @change="load(selectedExam)" :disabled="!exams.length"
    class="w-full sm:w-72 rounded-lg border border-slate-300 px-4 py-2 text-sm text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
  >
    <option :value="null" disabled>Select exam</option>
    <option v-for="e in exams" :key="e.id" :value="e.id">{{ e.name }} - {{ e.term }}</option>
  </select>
</div>


    <div v-if="message" class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{{ message }}</div>

    <!-- statistics -->
    <div v-if="stats" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-slate-500">Class average</p>
        <p class="mt-1 text-2xl font-bold text-slate-800">{{ fmt(stats.class_average) }}</p>
        <p class="text-xs text-slate-500">{{ stats.student_count }} students</p>
      </div>
      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-slate-500">Highest average</p>
        <p class="mt-1 text-2xl font-bold text-slate-800">{{ fmt(stats.highest_average) }}</p>
      </div>
      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-slate-500">Lowest average</p>
        <p class="mt-1 text-2xl font-bold text-slate-800">{{ fmt(stats.lowest_average) }}</p>
      </div>
      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-slate-500">Pass rate</p>
        <p class="mt-1 text-2xl font-bold text-slate-800">{{ stats.pass_rate }}%</p>
        <p class="text-xs text-slate-500">average ≥ 50</p>
      </div>
    </div>

    <div class="rounded-xl border bg-white shadow-sm" :class="{ 'opacity-60': loading && data }">
      <div v-if="loading && !data" class="p-8 text-center text-sm text-slate-500">Loading results...</div>
      <div v-else-if="!exams.length" class="p-8 text-center text-sm text-slate-500">No exams with marks for this class yet.</div>
      <div v-else-if="!rows.length" class="p-8 text-center text-sm text-slate-500">No students found for this class.</div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-100">
            <tr>
              <th class="px-3 py-3 text-center font-semibold text-slate-700">Rank</th>
              <th class="sticky left-0 bg-slate-100 px-4 py-3 text-left font-semibold text-slate-700">Student</th>
              <th v-for="s in subjects" :key="s.subject" class="px-4 py-3 text-center font-semibold text-slate-700">{{ s.subject_display }}</th>
              <th class="px-4 py-3 text-center font-semibold text-slate-700">Average</th>
              <th class="px-4 py-3 text-center font-semibold text-slate-700">Level</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.student_id" class="border-t hover:bg-slate-50">
              <td class="px-3 py-3 text-center font-semibold text-slate-700">{{ r.rank }}</td>
              <td class="sticky left-0 bg-white px-4 py-3 font-medium text-slate-800">
                {{ r.first_name }} {{ r.last_name }}
                <span class="block text-xs font-normal text-slate-400">{{ r.admission_number }}</span>
              </td>
              <td v-for="s in subjects" :key="s.subject" class="px-4 py-3 text-center">{{ r.scores[s.subject] ?? '-' }}</td>
              <td class="px-4 py-3 text-center font-semibold text-blue-700">{{ fmt(r.average_score) }}</td>
              <td class="px-4 py-3 text-center">
                <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="levelClass(r.level)">{{ r.level }}</span>
              </td>
              <td class="px-4 py-3 text-right">
                <button class="text-sm font-medium text-blue-600 hover:underline" @click="viewStudent(r)">View</button>
              </td>
            </tr>
          </tbody>
          <tfoot class="border-t-2 border-slate-300 bg-slate-50 font-semibold">
            <tr>
              <td></td>
              <td class="sticky left-0 bg-slate-50 px-4 py-3 text-slate-800">Class Average</td>
              <td v-for="s in subjects" :key="s.subject" class="px-4 py-3 text-center text-slate-700">{{ fmt(data.subject_averages[s.subject]) }}</td>
              <td class="px-4 py-3 text-center text-blue-800">{{ fmt(stats.class_average) }}</td>
              <td class="px-4 py-3 text-center text-emerald-800">{{ stats.class_level }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>