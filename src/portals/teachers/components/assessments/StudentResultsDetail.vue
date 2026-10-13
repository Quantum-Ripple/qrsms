<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getTeacherStudentResult, saveStudentComment } from '../../api/assessments'
import { levelClass } from '../../utils/levelStyle'

const props = defineProps({ studentId: Number, examId: Number })
const router = useRouter()

const data = ref(null)
const loading = ref(false)
const error = ref('')

const draft = ref('')
const saving = ref(false)
const saveMsg = ref('')
let requestId = 0

const fmt = (n) => (n == null ? '-' : Number(n).toFixed(2))

async function load() {
  if (!props.studentId || !props.examId) return
  const id = ++requestId
  loading.value = true
  error.value = ''
  try {
    const d = await getTeacherStudentResult({ exam: props.examId, student: props.studentId })
    if (id !== requestId) return
    data.value = d
    draft.value = d.teacher_comment?.comment ?? ''
  } catch (e) {
    if (id === requestId) {
      data.value = null
      error.value = e.response?.data?.detail || 'Could not load this student.'
    }
  } finally {
    if (id === requestId) loading.value = false
  }
}
watch(() => [props.studentId, props.examId], load, { immediate: true })

async function saveComment() {
  saving.value = true
  saveMsg.value = ''
  try {
    const res = await saveStudentComment({ exam: props.examId, student: props.studentId, comment: draft.value })
    data.value.teacher_comment = res.teacher_comment
    saveMsg.value = res.teacher_comment ? 'Comment saved.' : 'Comment removed.'
  } catch (e) {
    saveMsg.value = e.response?.data?.comment || e.response?.data?.detail || 'Could not save the comment.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <button class="text-sm text-blue-600 hover:underline" @click="router.back()">← Back to class results</button>

    <p v-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
    <p v-else-if="loading && !data" class="text-sm text-slate-500">Loading…</p>

    <template v-else-if="data">
      <!-- student card -->
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5 shadow-sm">
        <div>
          <h2 class="text-xl font-bold text-slate-800">{{ data.student.first_name }} {{ data.student.last_name }}</h2>
          <p class="text-sm text-slate-500">
            Adm No {{ data.student.admission_number }} · {{ data.student.class_level_name }} {{ data.student.stream_name }}
          </p>
          <p class="text-sm text-slate-500">{{ data.exam_name }}</p>
        </div>
        <span class="rounded-full px-3 py-1 text-sm font-semibold" :class="levelClass(data.student.level)">{{ data.student.level }}</span>
      </div>

      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="rounded-xl border bg-white p-4 shadow-sm">
          <p class="text-xs uppercase text-slate-500">Class position</p>
          <p class="mt-1 text-2xl font-bold">{{ data.stats.stream_position }} / {{ data.stats.stream_size }}</p>
        </div>
        <div class="rounded-xl border bg-white p-4 shadow-sm">
          <p class="text-xs uppercase text-slate-500">Grade position</p>
          <p class="mt-1 text-2xl font-bold">{{ data.stats.grade_position }} / {{ data.stats.grade_size }}</p>
        </div>
        <div class="rounded-xl border bg-white p-4 shadow-sm">
          <p class="text-xs uppercase text-slate-500">Average</p>
          <p class="mt-1 text-2xl font-bold">{{ fmt(data.stats.average_score) }}</p>
        </div>
        <div class="rounded-xl border bg-white p-4 shadow-sm">
          <p class="text-xs uppercase text-slate-500">Total marks</p>
          <p class="mt-1 text-2xl font-bold">{{ fmt(data.stats.total_score) }}</p>
        </div>
      </div>

      <!-- subjects -->
      <div class="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-100 text-left text-xs uppercase text-slate-500">
            <tr>
              <th class="px-4 py-2">Subject</th><th class="px-4 py-2 text-right">Score</th>
              <th class="px-4 py-2 text-right">Position</th><th class="px-4 py-2">Level</th><th class="px-4 py-2">Teacher</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="s in data.subjects" :key="s.subject">
              <td class="px-4 py-2 font-medium">{{ s.subject_display }}</td>
              <td class="px-4 py-2 text-right">{{ s.missing ? '-' : s.score }}</td>
              <td class="px-4 py-2 text-right">{{ s.stream_position }} / {{ data.stats.stream_size }}</td>
              <td class="px-4 py-2">
                <span v-if="s.level" class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="levelClass(s.level)">{{ s.level }}</span>
                <span v-else class="text-slate-300">-</span>
              </td>
              <td class="px-4 py-2 text-slate-600">{{ s.teachers.join(', ') || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- trend -->
      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <h3 class="mb-2 text-sm font-semibold text-slate-700">Trend across exams</h3>
        <table class="min-w-full text-sm">
          <thead class="text-left text-xs uppercase text-slate-500">
            <tr><th class="py-1">Exam</th><th class="py-1 text-right">Average</th><th class="py-1">Level</th><th class="py-1 text-right">Position</th></tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="t in data.trend" :key="t.exam_id" :class="{ 'font-semibold': t.exam_id === data.exam_id }">
              <td class="py-1.5">{{ t.exam_name }}</td>
              <td class="py-1.5 text-right">{{ fmt(t.average_score) }}</td>
              <td class="py-1.5"><span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="levelClass(t.level)">{{ t.level }}</span></td>
              <td class="py-1.5 text-right">{{ t.grade_position }} / {{ t.grade_size }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- class teacher comment -->
      <div class="rounded-xl border bg-white p-4 shadow-sm">
        <h3 class="mb-2 text-sm font-semibold text-slate-700">Class teacher's comment</h3>
        <textarea
          v-model="draft" rows="4" maxlength="1000"
          placeholder="Write a comment on this student's performance…"
          class="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
        />
        <div class="mt-2 flex items-center justify-between">
          <span class="text-xs text-slate-400">
            {{ draft.length }}/1000
            <template v-if="data.teacher_comment?.updated_at">
              · last saved {{ new Date(data.teacher_comment.updated_at).toLocaleString() }}
            </template>
          </span>
          <div class="flex items-center gap-3">
            <span v-if="saveMsg" class="text-sm text-slate-600">{{ saveMsg }}</span>
            <button
              @click="saveComment" :disabled="saving"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >{{ saving ? 'Saving…' : 'Save comment' }}</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>