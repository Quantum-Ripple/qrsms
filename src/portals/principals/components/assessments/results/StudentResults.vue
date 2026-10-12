<script setup>
import { computed, ref, watch } from 'vue'
import { getStudentResult } from '../../../api/Grades'
import LevelBadge from './LevelBadge.vue'
import StatCard from './StatCard.vue'
import { exportResultsCsv } from '../../../utils/resultsExport'

const props = defineProps({ examId: Number, studentId: Number, examName: String, gradeName: String })
const data = ref(null), loading = ref(false), error = ref('')
let req = 0

async function load() {
  if (!props.examId || !props.studentId) { data.value = null; return }
  const id = ++req
  loading.value = true; error.value = ''
  try {
    const d = await getStudentResult({ exam: props.examId, student: props.studentId })
    if (id === req) data.value = d
  } catch (e) {
    if (id === req) { data.value = null; error.value = e.response?.data?.detail || 'Could not load student results.' }
  } finally {
    if (id === req) loading.value = false
  }
}
watch(() => [props.examId, props.studentId], load, { immediate: true })

const fmt = (n) => (n == null ? '—' : Number(n).toFixed(2))

const canExport = computed(() => Boolean(data.value?.subjects?.length))

function exportResults() {
  if (!canExport.value) return

  const headers = ['Subject', 'Score', 'Position', 'Level', 'Teacher']
  const rows = data.value.subjects.map((subject) => [
    subject.subject_display,
    subject.missing ? '' : subject.score,
    `${subject.grade_position} / ${data.value.stats.grade_size}`,
    subject.level,
    subject.teachers.join(', '),
  ])
  exportResultsCsv(headers, rows, 'student-results.csv', [
    ['Exam', props.examName],
    ['Grade', props.gradeName],
  ])
}

defineExpose({ canExport, exportResults })
</script>

<template>
  <section class="print-area space-y-5">
    <div v-if="data" class="print-only">
      <h1 class="text-xl font-semibold">Student Results</h1>
      <p>Exam: {{ examName }} · Grade: {{ gradeName }}</p>
    </div>
    <p v-if="!studentId" class="no-print rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
      Open a student from the Class Result to see their results.
    </p>
    <p v-else-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
    <p v-else-if="loading && !data" class="text-sm text-gray-500">Loading…</p>

    <template v-else-if="data">
      <!-- student card -->
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h2 class="text-xl font-bold">{{ data.student.first_name }} {{ data.student.last_name }}</h2>
          <p class="text-sm text-gray-500">
            Adm No {{ data.student.admission_number }} ·
            {{ data.student.class_level_name }} {{ data.student.stream_name }}
          </p>
          <p class="text-sm text-gray-500">Class teacher: {{ data.student.class_teacher ?? 'Not assigned' }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs uppercase text-gray-500">Overall level</p>
          <LevelBadge :level="data.student.level" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Grade position" :value="`${data.stats.grade_position} / ${data.stats.grade_size}`" />
        <StatCard label="Stream position" :value="`${data.stats.stream_position} / ${data.stats.stream_size}`" />
        <StatCard label="Average" :value="fmt(data.stats.average_score)" />
        <StatCard label="Total marks" :value="fmt(data.stats.total_score)" />
      </div>

      <!-- subject performance -->
      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th class="px-3 py-2">Subject</th>
              <th class="px-3 py-2 text-right">Score</th>
              <th class="px-3 py-2 text-right">Position</th>
              <th class="px-3 py-2">Level</th>
              <th class="px-3 py-2">Teacher</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="s in data.subjects" :key="s.subject">
              <td class="px-3 py-2 font-medium">{{ s.subject_display }}</td>
              <td class="px-3 py-2 text-right tabular-nums">
                <span v-if="s.missing" class="text-gray-300">—</span>
                <span v-else>{{ s.score }}</span>
              </td>
              <td class="px-3 py-2 text-right tabular-nums">{{ s.grade_position }} / {{ data.stats.grade_size }}</td>
              <td class="px-3 py-2"><LevelBadge :level="s.level" /></td>
              <td class="px-3 py-2 text-gray-600">{{ s.teachers.join(', ') || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- trend -->
      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 class="mb-3 text-sm font-semibold text-gray-700">Trend across exams</h3>
        <table class="min-w-full text-sm">
          <thead class="text-left text-xs uppercase text-gray-500">
            <tr><th class="py-1">Exam</th><th class="py-1 text-right">Average</th><th class="py-1">Level</th><th class="py-1 text-right">Position</th></tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="t in data.trend" :key="t.exam_id" :class="{ 'font-semibold': t.exam_id === data.exam_id }">
              <td class="py-1.5">{{ t.exam_name }}</td>
              <td class="py-1.5 text-right tabular-nums">{{ fmt(t.average_score) }}</td>
              <td class="py-1.5"><LevelBadge :level="t.level" /></td>
              <td class="py-1.5 text-right tabular-nums">{{ t.grade_position }} / {{ t.grade_size }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- class teacher comment -->
      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 class="mb-2 text-sm font-semibold text-gray-700">Class teacher's comment</h3>
        <template v-if="data.teacher_comment">
          <p class="text-sm text-gray-800">{{ data.teacher_comment.comment }}</p>
          <p v-if="data.teacher_comment.author" class="mt-1 text-xs text-gray-500">— {{ data.teacher_comment.author }}</p>
        </template>
        <p v-else class="text-sm text-gray-400">No comment yet.</p>
      </div>
    </template>
  </section>
</template>