
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getReleaseReadiness } from '../../../api/Grades'

const route = useRoute()
const router = useRouter()
const examId = route.query.exam

const data = ref(null)
const loading = ref(true)
const error = ref('')

const stats = computed(() => data.value?.stats ?? null)
const rows = computed(() => data.value?.rows ?? [])

const classLabel = (r) => (r.stream_name && r.stream_name !== 'No stream' ? `${r.class_level_name} ${r.stream_name}` : r.class_level_name)

function back() {
  router.push({ name: 'results-release', query: { exam: examId } })
}

function viewStudents(r) {
  const query = { exam: examId, class_level: r.class_level_id, subject: r.subject }
  if (r.stream_id) query.stream = r.stream_id
  router.push({ name: 'results-missing-students', query })
}

onMounted(async () => {
  if (!examId) {
    error.value = 'No exam selected.'
    loading.value = false
    return
  }
  try {
    data.value = await getReleaseReadiness(examId)
  } catch (e) {
    error.value = e.response?.data?.detail || 'Could not load missing marks.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto min-w-0 max-w-6xl space-y-4 p-3 pb-24 sm:space-y-6 sm:p-6 md:pb-6">
    <div class="min-w-0">
      <button @click="back" class="mb-3 min-h-10 text-sm text-indigo-600 hover:underline">
        ← Back to Release Results
      </button>
      <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl">Missing marks</h1>
      <p v-if="data" class="mt-1 break-words text-sm text-gray-500">{{ data.exam_name }}</p>
    </div>

    <div v-if="loading" class="py-12 text-center text-sm text-gray-500">
      Loading…
    </div>

    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ error }}
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div class="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p class="text-xl font-semibold text-gray-900 sm:text-2xl">{{ stats.missing_marks }}</p>
          <p class="mt-1 text-xs text-gray-500">Marks missing</p>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p class="text-xl font-semibold text-gray-900 sm:text-2xl">{{ stats.classes_affected }}</p>
          <p class="mt-1 text-xs text-gray-500">Classes affected</p>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p class="text-xl font-semibold text-gray-900 sm:text-2xl">{{ stats.subjects_affected }}</p>
          <p class="mt-1 text-xs text-gray-500">Subjects affected</p>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p class="text-xl font-semibold text-gray-900 sm:text-2xl">{{ stats.teachers_affected }}</p>
          <p class="mt-1 text-xs text-gray-500">Teachers</p>
        </div>

        <div class="col-span-2 rounded-lg border border-gray-200 bg-white p-3 sm:col-span-1 sm:p-4">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xl font-semibold text-gray-900 sm:text-2xl">{{ stats.percent_entered }}%</p>
            <p class="text-xs text-gray-500">Marks entered</p>
          </div>
          <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              class="h-full rounded-full bg-indigo-600"
              :style="{ width: stats.percent_entered + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Missing marks -->
      <section class="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div v-if="!rows.length" class="px-4 py-10 text-center text-sm text-gray-500">
          No marks are missing. This exam is ready to release.
        </div>

        <template v-else>
          <!-- Mobile cards -->
          <div class="divide-y divide-gray-100 sm:hidden">
            <div
              v-for="r in rows"
              :key="`${r.class_level_id}-${r.stream_id}-${r.subject}`"
              class="space-y-3 p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium text-gray-900">{{ classLabel(r) }}</p>
                  <p class="mt-1 text-sm text-gray-600">{{ r.subject_display }}</p>
                </div>
                <p class="shrink-0 text-sm font-semibold text-amber-700">
                  {{ r.missing }} of {{ r.of }}
                </p>
              </div>

              <p class="break-words text-sm text-gray-500">
                {{ r.teachers.join(', ') || 'No teacher assigned' }}
              </p>

              <button
                @click="viewStudents(r)"
                class="min-h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                View students
              </button>
            </div>
          </div>

          <!-- Desktop table -->
          <div class="hidden overflow-x-auto sm:block">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3 lg:px-5">Class</th>
                  <th class="px-4 py-3 lg:px-5">Subject</th>
                  <th class="px-4 py-3 lg:px-5">Teacher</th>
                  <th class="px-4 py-3 lg:px-5">Missing</th>
                  <th class="px-4 py-3 lg:px-5"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="r in rows"
                  :key="`${r.class_level_id}-${r.stream_id}-${r.subject}`"
                >
                  <td class="px-4 py-3 font-medium text-gray-900 lg:px-5">
                    {{ classLabel(r) }}
                  </td>
                  <td class="px-4 py-3 text-gray-700 lg:px-5">{{ r.subject_display }}</td>
                  <td class="px-4 py-3 text-gray-600 lg:px-5">
                    {{ r.teachers.join(', ') || '—' }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-gray-900 lg:px-5">
                    <span class="font-semibold text-amber-700">{{ r.missing }}</span>
                    of {{ r.of }}
                  </td>
                  <td class="px-4 py-3 text-right lg:px-5">
                    <button
                      @click="viewStudents(r)"
                      class="min-h-9 whitespace-nowrap rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View students
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </section>
    </template>
  </div>
</template>
