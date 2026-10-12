<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { getRanking } from '../../../api/Grades'
import LevelBadge from './LevelBadge.vue'
import StatCard from './StatCard.vue'
import { exportResultsCsv } from '../../../utils/resultsExport'

const props = defineProps({ examId: Number, classLevelId: Number, examName: String, gradeName: String })
const data = ref(null), loading = ref(false), error = ref('')
const search = ref(''), page = ref(1)
let req = 0, timer

async function load() {
  if (!props.examId || !props.classLevelId) return
  const id = ++req
  loading.value = true; error.value = ''
  try {
    const d = await getRanking({ exam: props.examId, classLevel: props.classLevelId, search: search.value, page: page.value })
    if (id === req) data.value = d
  } catch (e) {
    if (id === req) { data.value = null; error.value = e.response?.data?.detail || 'Could not load rankings.' }
  } finally {
    if (id === req) loading.value = false
  }
}

watch(() => [props.examId, props.classLevelId], () => { page.value = 1; load() }, { immediate: true })
watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(() => { page.value = 1; load() }, 300)
})
onBeforeUnmount(() => clearTimeout(timer))

function go(p) { page.value = p; load() }
const fmt = (n) => (n == null ? '—' : Number(n).toFixed(2))
const medal = ['border-amber-300 bg-amber-50', 'border-gray-300 bg-gray-50', 'border-orange-300 bg-orange-50']
const canExport = computed(() => Boolean(data.value?.results?.length))

function exportResults() {
  if (!canExport.value) return

  const headers = ['Rank', 'Admission Number', 'Student', 'Class', 'Total', 'Average', 'Level']
  const rows = data.value.results.map((result) => [
    result.rank,
    result.admission_number,
    result.name,
    result.class_name,
    fmt(result.total_score),
    fmt(result.average_score),
    result.level,
  ])

  exportResultsCsv(headers, rows, 'student-rankings.csv', [
    ['Exam', props.examName],
    ['Grade', props.gradeName],
  ])
}

defineExpose({ canExport, exportResults })
</script>

<template>
  <section class="print-area space-y-5">
    <div class="print-only">
      <h1 class="text-xl font-semibold">Rankings</h1>
      <p>Exam: {{ examName }} · Grade: {{ gradeName }}</p>
    </div>
    <p v-if="error" class="no-print rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>
    <p v-else-if="loading && !data" class="text-sm text-gray-500">Loading…</p>
    <p v-else-if="!data" class="text-sm text-gray-500">Choose an exam and grade.</p>

    <template v-else>
      <!-- top 3 + class summary -->
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(t, i) in data.top" :key="t.student_id"
          class="rounded-xl border-2 p-4 shadow-sm" :class="medal[i]"
        >
          <p class="text-xs font-semibold uppercase text-gray-500">Rank {{ t.rank }}</p>
          <p class="mt-1 font-bold text-gray-900">{{ t.name }}</p>
          <p class="text-xs text-gray-500">{{ t.class_name }}</p>
          <p class="mt-2 flex items-center justify-between text-sm">
            <span class="font-semibold tabular-nums">{{ fmt(t.average_score) }}</span>
            <LevelBadge :level="t.level" />
          </p>
        </div>
        <StatCard label="Class average" :value="fmt(data.class_average)" :sub="`${data.student_count} students · ${data.class_level_name}`" />
      </div>

      <input
  v-model="search" 
  type="search" 
  placeholder="Search by name or admission number…"
  class="no-print w-full sm:w-80 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
/>


      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm" :class="{ 'opacity-60': loading }">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th class="px-3 py-2">Rank</th><th class="px-3 py-2">Adm No</th><th class="px-3 py-2">Student</th>
              <th class="px-3 py-2">Class</th><th class="px-3 py-2 text-right">Total</th>
              <th class="px-3 py-2 text-right">Average</th><th class="px-3 py-2">Level</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="r in data.results" :key="r.student_id" class="hover:bg-gray-50">
              <td class="px-3 py-2 font-semibold">{{ r.rank }}</td>
              <td class="px-3 py-2 text-gray-600">{{ r.admission_number }}</td>
              <td class="px-3 py-2">{{ r.name }}</td>
              <td class="px-3 py-2 text-gray-600">{{ r.class_name }}</td>
              <td class="px-3 py-2 text-right tabular-nums">{{ fmt(r.total_score) }}</td>
              <td class="px-3 py-2 text-right font-semibold tabular-nums">{{ fmt(r.average_score) }}</td>
              <td class="px-3 py-2"><LevelBadge :level="r.level" /></td>
            </tr>
            <tr v-if="!data.results.length">
              <td colspan="7" class="px-3 py-6 text-center text-gray-500">No students match.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="no-print flex items-center justify-between text-sm text-gray-600">
        <span>{{ data.pagination.total }} students · page {{ data.pagination.page }} of {{ data.pagination.total_pages }}</span>
        <div class="flex gap-2">
          <button class="rounded border px-3 py-1 disabled:opacity-40" :disabled="data.pagination.page <= 1" @click="go(data.pagination.page - 1)">Prev</button>
          <button class="rounded border px-3 py-1 disabled:opacity-40" :disabled="data.pagination.page >= data.pagination.total_pages" @click="go(data.pagination.page + 1)">Next</button>
        </div>
      </div>
    </template>
  </section>
</template>