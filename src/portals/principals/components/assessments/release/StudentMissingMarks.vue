<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMissingStudents } from '../../../api/Grades' // TODO: adjust path

const route = useRoute()
const router = useRouter()
const q = route.query

const data = ref(null)
const loading = ref(true)
const error = ref('')
const search = ref('')

const classLabel = computed(() => {
  if (!data.value) return ''
  const { class_level_name: l, stream_name: s } = data.value
  return s ? `${l} ${s}` : l
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  const list = data.value?.students ?? []
  if (!term) return list
  return list.filter(
    (s) => s.name.toLowerCase().includes(term) || String(s.admission_number).toLowerCase().includes(term)
  )
})

function back() {
  router.push({ name: 'results-missing-marks', query: { exam: q.exam } })
}

onMounted(async () => {
  if (!q.exam || !q.class_level || !q.subject) {
    error.value = 'Missing exam, class or subject.'
    loading.value = false
    return
  }
  try {
    data.value = await getMissingStudents({
      exam: q.exam,
      classLevel: q.class_level,
      stream: q.stream,
      subject: q.subject,
    })
  } catch (e) {
    error.value = e.response?.data?.detail || 'Could not load students.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
    <div>
      <button @click="back" class="mb-2 text-sm text-indigo-600 hover:underline">← Back to missing marks</button>
      <h1 class="text-2xl font-semibold text-gray-900">Students without marks</h1>
    </div>

    <div v-if="loading" class="py-16 text-center text-sm text-gray-500">Loading…</div>
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ error }}</div>

    <template v-else>
      <!-- Basic data -->
      <section class="grid gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <div>
          <p class="text-xs text-gray-500">Exam</p>
          <p class="font-medium text-gray-900">{{ data.exam.name }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Class</p>
          <p class="font-medium text-gray-900">{{ classLabel }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Subject</p>
          <p class="font-medium text-gray-900">{{ data.subject_display }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Teacher</p>
          <p class="font-medium text-gray-900">{{ data.teachers.join(', ') || '—' }}</p>
        </div>
      </section>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p class="text-2xl font-semibold text-amber-700">
            {{ data.stats.missing }}<span class="text-sm font-normal text-gray-500"> of {{ data.stats.of }}</span>
          </p>
          <p class="text-xs text-gray-500">Students missing marks</p>
        </div>
        <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p class="text-2xl font-semibold text-gray-900">{{ data.stats.entered }}</p>
          <p class="text-xs text-gray-500">Marks entered so far</p>
        </div>
      </div>

      <!-- Table -->
      <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-200 p-4">
          <input v-model="search" type="search" placeholder="Search name or admission number"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>

        <div v-if="!data.students.length" class="py-12 text-center text-sm text-gray-500">
          Every student in this class has a mark.
        </div>
        <div v-else-if="!filtered.length" class="py-12 text-center text-sm text-gray-500">No matches.</div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-5 py-3">Student</th>
                <th class="px-5 py-3">Admission no.</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="s in filtered" :key="s.student_id">
                <td class="px-5 py-3 font-medium text-gray-900">{{ s.name }}</td>
                <td class="px-5 py-3 text-gray-600">{{ s.admission_number }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>