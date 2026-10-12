<script setup>
import { ref, computed, watch } from 'vue'
import { getSubjectResults } from '../../../api/Grades'
import LevelBadge from './LevelBadge.vue'
import StatCard from './StatCard.vue'
import { exportResultsCsv } from '../../../utils/resultsExport'

const props = defineProps({ examId: Number, classLevelId: Number, streamId: Number, examName: String, gradeName: String })
const subject = ref(null)
const data = ref(null), loading = ref(false), error = ref('')
let req = 0

async function load() {
  if (!props.examId || !props.classLevelId) return
  const id = ++req
  loading.value = true; error.value = ''
  try {
    const d = await getSubjectResults({
      exam: props.examId, classLevel: props.classLevelId,
      stream: props.streamId, subject: subject.value,
    })
    if (id !== req) return
    data.value = d
    subject.value = d.selected_subject?.subject ?? null
  } catch (e) {
    if (id === req) { data.value = null; error.value = e.response?.data?.subject || e.response?.data?.detail || 'Could not load subject results.' }
  } finally {
    if (id === req) loading.value = false
  }
}

// filters changed: go back to the first available subject
watch(() => [props.examId, props.classLevelId, props.streamId], () => { subject.value = null; load() }, { immediate: true })
function pick(code) { subject.value = code; load() }

const maxBucket = computed(() => Math.max(1, ...(data.value?.distribution ?? []).map(b => b.count)))
const maxLevel = computed(() => Math.max(1, ...(data.value?.level_counts ?? []).map(l => l.count)))
const fmt = (n) => (n == null ? '—' : Number(n).toFixed(2))
const canExport = computed(() => Boolean(data.value?.selected_subject && data.value?.by_stream?.length))

function exportResults() {
  if (!canExport.value) return

  const headers = ['Stream', 'Teacher', 'Students', 'Mean', 'Pass Rate']
  const rows = data.value.by_stream.map((stream) => [
    `${data.value.class_level_name} ${stream.stream_name}`,
    stream.teachers.join(', '),
    stream.student_count,
    fmt(stream.mean),
    stream.pass_rate == null ? '' : `${stream.pass_rate}%`,
  ])
  exportResultsCsv(headers, rows, 'subject-results.csv', [
    ['Exam', props.examName],
    ['Grade', props.gradeName],
  ])
}

defineExpose({ canExport, exportResults })
</script>

<template>
  <section class="print-area space-y-5">
    <div class="print-only">
      <h1 class="text-xl font-semibold">Subject Results</h1>
      <p>Exam: {{ examName }} · Grade: {{ gradeName }}</p>
    </div>
    <p v-if="error" class="no-print rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
    <p v-else-if="loading && !data" class="text-sm text-gray-500">Loading…</p>
    <p v-else-if="!data" class="text-sm text-gray-500">Choose an exam and grade.</p>
    <p v-else-if="!data.selected_subject" class="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
      No subjects have teachers assigned for this class.
    </p>

    <template v-else>
      <!-- subject bar -->
      <div class="no-print flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="s in data.subjects" :key="s.subject" @click="pick(s.subject)"
          class="whitespace-nowrap rounded-lg border px-4 py-1.5 text-sm font-medium transition"
          :class="s.subject === data.selected_subject.subject
            ? 'border-indigo-600 bg-indigo-600 text-white'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
        >{{ s.subject_display }}</button>
      </div>

      <div :class="{ 'opacity-60': loading }" class="space-y-5">
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Subject average" :value="fmt(data.stats.average)" />
          <StatCard label="Pass rate" :value="`${data.stats.pass_rate}%`" sub="score ≥ 50" />
          <StatCard label="Highest score" :value="data.stats.highest" />
          <StatCard label="Lowest score" :value="data.stats.lowest" :sub="data.stats.missing_marks ? `${data.stats.missing_marks} marks not entered` : ''" />
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <!-- score distribution -->
          <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 class="mb-3 text-sm font-semibold text-gray-700">Score distribution</h3>
            <div class="flex h-44 items-end gap-3">
              <div v-for="b in data.distribution" :key="b.range" class="flex h-full flex-1 flex-col justify-end text-center">
                <span class="text-xs font-semibold">{{ b.count }}</span>
                <div class="rounded-t bg-indigo-500" :style="{ height: (b.count / maxBucket * 100) + '%' }" />
                <span class="mt-1 text-xs text-gray-500">{{ b.range }}</span>
              </div>
            </div>
          </div>

          <!-- performance levels -->
          <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 class="mb-3 text-sm font-semibold text-gray-700">Performance levels</h3>
            <div class="space-y-2">
              <div v-for="l in data.level_counts" :key="l.level" class="flex items-center gap-2">
                <div class="w-10"><LevelBadge :level="l.level" /></div>
                <div class="h-3 flex-1 rounded-full bg-gray-100">
                  <div class="h-3 rounded-full bg-indigo-500" :style="{ width: (l.count / maxLevel * 100) + '%' }" />
                </div>
                <span class="w-8 text-right text-sm font-semibold tabular-nums">{{ l.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- by stream -->
        <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th class="px-3 py-2">Stream</th><th class="px-3 py-2">Teacher</th>
                <th class="px-3 py-2 text-right">Students</th><th class="px-3 py-2 text-right">Mean</th><th class="px-3 py-2 text-right">Pass rate</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="s in data.by_stream" :key="s.stream_id">
                <td class="px-3 py-2 font-medium">{{ data.class_level_name }} {{ s.stream_name }}</td>
                <td class="px-3 py-2 text-gray-600">{{ s.teachers.join(', ') || '—' }}</td>
                <td class="px-3 py-2 text-right tabular-nums">{{ s.student_count }}</td>
                <td class="px-3 py-2 text-right tabular-nums">{{ fmt(s.mean) }}</td>
                <td class="px-3 py-2 text-right tabular-nums">{{ s.pass_rate == null ? '—' : s.pass_rate + '%' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </section>
</template>