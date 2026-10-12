<script setup>

import { ref, computed, onMounted, watch } from 'vue'

import { useRoute, useRouter } from 'vue-router'



import {

  getExamDashboard, getReleaseReadiness, getReleaseHistory,

  previewRelease, releaseResults, withdrawResults,

} from '../api/Grades'



const route = useRoute()

const router = useRouter()



const exams = ref([])

const examId = ref(route.query.exam ? Number(route.query.exam) : null)

const readiness = ref(null)

const history = ref([])



const loading = ref(true)

const readinessLoading = ref(false)

const historyLoading = ref(false)

const releasing = ref(false)

const previewing = ref(false)



const audience = ref('all')

const threshold = ref('')

const previewCount = ref(null)

const message = ref({ type: '', text: '' })



const isLive = computed(() => !!readiness.value?.results_released)

const stats = computed(() => readiness.value?.stats ?? null)



const sendNotification = ref(true)



const notificationPreview = computed(() => {

  const name = readiness.value?.exam_name ?? 'this exam'

  let msg = `The results for ${name} are out.`

  if (audience.value === 'balance_below' && threshold.value !== '') {

    const amt = Number(threshold.value)

    msg += amt === 0

      ? ' To see them, make sure your school fees are fully paid.'

      : ` To see them, make sure your school fee balance is KES ${amt.toLocaleString('en-KE')} or below.`

  }

  return msg

})





const thresholdValid = computed(

  () => audience.value === 'all' || (threshold.value !== '' && Number(threshold.value) >= 0)

)



function payload(force = false) {

  const p = { exam: examId.value, audience: audience.value, send_notification: sendNotification.value }

  if (audience.value === 'balance_below') p.balance_threshold = Number(threshold.value)

  if (force) p.force = true

  return p

}



function flash(type, text) {

  message.value = { type, text }

  setTimeout(() => (message.value = { type: '', text: '' }), 5000)

}



function errText(e, fallback) {

  const d = e.response?.data

  return d?.detail || (d && typeof d === 'object' ? Object.values(d).flat().join(' ') : '') || fallback

}



async function loadReadiness() {

  if (!examId.value) return

  readinessLoading.value = true

  try {

    readiness.value = await getReleaseReadiness(examId.value)

  } catch (e) {

    readiness.value = null

    flash('error', errText(e, 'Could not load readiness.'))

  } finally {

    readinessLoading.value = false

  }

}



async function loadHistory() {

  historyLoading.value = true

  try {

    history.value = await getReleaseHistory()

  } catch (e) {

    history.value = []

  } finally {

    historyLoading.value = false

  }

}



async function preview() {

  previewing.value = true

  try {

    const res = await previewRelease(payload())

    previewCount.value = res.parents_reached ?? null

  } catch (e) {

    flash('error', errText(e, 'Could not preview recipients.'))

  } finally {

    previewing.value = false

  }

}



async function doRelease(force = false) {

  releasing.value = true

  try {

    const res = await releaseResults(payload(force))

    flash('success',

  `Results released. ${res.parents_reached ?? 0} parents can view them now.` +

  (res.notification_sent ? ' Parents have been notified.' : ''))

    await Promise.all([loadReadiness(), loadHistory()])

  } catch (e) {

    if (e.response?.status === 409 && !force) {

      releasing.value = false

      if (window.confirm('Some marks are still missing. Release anyway?')) {

        return doRelease(true)

      }

      return

    }

    flash('error', errText(e, 'Release failed.'))

  } finally {

    releasing.value = false

  }

}



async function doWithdraw() {

  if (!window.confirm('Withdraw these results? Parents will lose access immediately.')) return

  releasing.value = true

  try {

    await withdrawResults(examId.value)

    flash('success', 'Results withdrawn.')

    await Promise.all([loadReadiness(), loadHistory()])

  } catch (e) {

    flash('error', errText(e, 'Withdraw failed.'))

  } finally {

    releasing.value = false

  }

}



function goMissing() {

  router.push({ name: 'results-missing-marks', query: { exam: examId.value } })

}



const fmtDate = (d) =>

  d ? new Date(d).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }) : '—'



watch(examId, (id) => {

  previewCount.value = null

  router.replace({ query: id ? { exam: id } : {} })

  loadReadiness()

})

watch([audience, threshold], () => (previewCount.value = null))



onMounted(async () => {

  try {

    const dash = await getExamDashboard()

    exams.value = dash.exams

    if (!examId.value && exams.value.length) examId.value = exams.value[0].id

    else await loadReadiness()

  } catch (e) {

    flash('error', 'Could not load exams.')

  } finally {

    loading.value = false

  }

  loadHistory()

})

</script>

<template>
  <div class="mx-auto min-w-0 max-w-6xl space-y-4 p-3 pb-24 sm:space-y-6 sm:p-6 md:pb-6">
    <!-- Header and exam selector -->
    <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl">Release Results</h1>
       
      </div>

      <div class="w-full min-w-0 sm:w-72 sm:flex-shrink-0">
        <label for="exam-select" class="mb-1 block text-xs font-medium text-gray-500">Selected exam</label>
        <select
          id="exam-select"
          v-model="examId"
          class="min-h-11 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option v-for="e in exams" :key="e.id" :value="e.id">
            {{ e.name }}{{ e.term ? ` - ${e.term}` : '' }}
          </option>
        </select>
      </div>
    </div>

    <!-- Flash message -->
    <div
      v-if="message.text"
      role="status"
      :class="[
        'break-words rounded-lg border px-3 py-3 text-sm sm:px-4',
        message.type === 'success'
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-red-200 bg-red-50 text-red-800',
      ]"
    >
      {{ message.text }}
    </div>

    <div v-if="loading" class="py-12 text-center text-sm text-gray-500">Loading…</div>

    <div
      v-else-if="!exams.length"
      class="rounded-xl border border-dashed border-gray-300 px-4 py-12 text-center text-sm text-gray-500"
    >
      No exams yet.
    </div>

    <template v-else>
      <!-- Main cards: stack on mobile, two columns on large screens -->
      <div class="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-6">
        <!-- Card 1: Readiness -->
        <section class="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <div class="mb-4 flex min-w-0 items-start justify-between gap-3">
            <h2 class="text-base font-semibold text-gray-900 sm:text-lg">1. Readiness</h2>
            <span
              v-if="readiness"
              :class="[
                'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                readiness.all_ready
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700',
              ]"
            >
              {{ readiness.all_ready ? 'All marks in' : 'Marks missing' }}
            </span>
          </div>

          <div v-if="readinessLoading" class="py-8 text-center text-sm text-gray-500">
            Checking marks…
          </div>

          <template v-else-if="stats">
            <div class="grid grid-cols-2 gap-2 sm:gap-3">
              <div class="min-w-0 rounded-lg bg-gray-50 p-3">
                <p class="text-2xl font-semibold leading-tight text-gray-900">{{ stats.missing_marks }}</p>
                <p class="mt-1 text-xs leading-4 text-gray-500">Marks missing</p>
              </div>
              <div class="min-w-0 rounded-lg bg-gray-50 p-3">
                <p class="text-2xl font-semibold leading-tight text-gray-900">{{ stats.classes_affected }}</p>
                <p class="mt-1 text-xs leading-4 text-gray-500">Classes affected</p>
              </div>
              <div class="min-w-0 rounded-lg bg-gray-50 p-3">
                <p class="text-2xl font-semibold leading-tight text-gray-900">{{ stats.subjects_affected }}</p>
                <p class="mt-1 text-xs leading-4 text-gray-500">Subjects affected</p>
              </div>
              <div class="min-w-0 rounded-lg bg-gray-50 p-3">
                <p class="text-2xl font-semibold leading-tight text-gray-900">{{ stats.teachers_affected }}</p>
                <p class="mt-1 text-xs leading-4 text-gray-500">Teachers affected</p>
              </div>
            </div>

            <div class="mt-5">
              <div class="mb-2 flex items-center justify-between gap-3 text-xs text-gray-500">
                <span>Marks entered</span>
                <span class="shrink-0 font-medium text-gray-700">{{ stats.percent_entered }}%</span>
              </div>
              <div
                class="h-2 overflow-hidden rounded-full bg-gray-100"
                role="progressbar"
                aria-label="Marks entered"
                :aria-valuenow="stats.percent_entered"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  class="h-full rounded-full bg-indigo-600 transition-all"
                  :style="{ width: `${stats.percent_entered}%` }"
                ></div>
              </div>
            </div>

            <button
              @click="goMissing"
              :disabled="!stats.missing_marks"
              class="mt-5 min-h-11 w-full rounded-lg border border-indigo-600 px-4 py-2.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
            >
              View missing marks
            </button>
          </template>

          <div v-else class="py-6 text-sm text-gray-500">
            Readiness information is not available.
          </div>
        </section>

        <!-- Card 2: Release -->
        <section class="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <div class="mb-4 flex min-w-0 items-start justify-between gap-3">
            <h2 class="text-base font-semibold text-gray-900 sm:text-lg">2. Release</h2>
            <span
              v-if="readiness"
              :class="[
                'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
              ]"
            >
              {{ isLive ? 'Live' : 'Not released' }}
            </span>
          </div>

          <!-- Already live -->
          <div v-if="isLive" class="space-y-4">
            <p class="break-words text-sm leading-6 text-gray-600">
              Results released on {{ fmtDate(readiness.results_released_at) }}.
            </p>
            <button
              @click="doWithdraw"
              :disabled="releasing"
              class="min-h-11 w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              {{ releasing ? 'Working…' : 'Withdraw results' }}
            </button>
          </div>

          <!-- Not live -->
          <div v-else class="space-y-4">
            <fieldset class="space-y-2">
              <legend class="mb-2 text-xs font-medium text-gray-500">Who receives results?</legend>

              <label
                class="flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm leading-5 transition"
                :class="audience === 'all' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'"
              >
                <input
                  type="radio"
                  value="all"
                  v-model="audience"
                  class="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 focus:ring-indigo-500"
                />
                <span>All parents</span>
              </label>

              <label
                class="flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm leading-5 transition"
                :class="audience === 'balance_below' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'"
              >
                <input
                  type="radio"
                  value="balance_below"
                  v-model="audience"
                  class="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Parents whose fee balance is at or below an amount</span>
              </label>
            </fieldset>

            <div v-if="audience === 'balance_below'" class="min-w-0">
              <label for="balance-threshold" class="mb-1 block text-xs font-medium text-gray-500">
                Balance up to (KES)
              </label>
              <input
                id="balance-threshold"
                v-model="threshold"
                type="number"
                min="0"
                step="1"
                inputmode="numeric"
                placeholder="e.g. 5000 (0 = fully paid)"
                class="min-h-11 w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p class="mt-1 text-xs leading-5 text-gray-500">
                Parents with a higher balance will not receive access under this release.
              </p>
            </div>

            <div class="space-y-3 rounded-lg bg-gray-50 p-3">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p class="min-w-0 text-sm leading-5 text-gray-600">
                  <template v-if="previewCount !== null">
                    <strong class="text-gray-900">{{ previewCount }}</strong>
                    parents would receive results
                  </template>
                  <template v-else>Recipients not previewed</template>
                </p>
                <button
                  @click="preview"
                  :disabled="!thresholdValid || previewing"
                  class="min-h-10 self-start text-sm font-medium text-indigo-600 hover:underline disabled:text-gray-400 disabled:no-underline sm:self-auto"
                >
                  {{ previewing ? 'Counting…' : 'Preview recipients' }}
                </button>
              </div>
            </div>

            <div class="min-w-0 rounded-lg border border-gray-200 p-3">
              <label class="flex cursor-pointer items-start gap-3 text-sm font-medium text-gray-800">
                <input
                  type="checkbox"
                  v-model="sendNotification"
                  class="mt-0.5 h-4 w-4 shrink-0 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Notify parents</span>
              </label>
              <p
                v-if="sendNotification"
                class="mt-3 break-words rounded-md bg-gray-50 p-3 text-xs leading-5 text-gray-600"
              >
                {{ notificationPreview }}
              </p>
            </div>

            <button
              @click="doRelease(false)"
              :disabled="!thresholdValid || releasing || !readiness"
              class="min-h-11 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ releasing ? 'Releasing…' : 'Release Now' }}
            </button>
          </div>
        </section>
      </div>

      <!-- Card 3: Release history -->
      <section class="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div class="border-b border-gray-200 px-4 py-4 sm:px-5">
          <h2 class="text-base font-semibold text-gray-900 sm:text-lg">3. Released exams</h2>
        </div>

        <div v-if="historyLoading" class="py-10 text-center text-sm text-gray-500">
          Loading…
        </div>
        <div v-else-if="!history.length" class="px-4 py-10 text-center text-sm text-gray-500">
          Nothing released yet.
        </div>

        <template v-else>
          <!-- Mobile layout: readable stacked records, no horizontal scrolling -->
          <div class="divide-y divide-gray-200 sm:hidden">
            <article v-for="r in history" :key="`mobile-${r.id}`" class="space-y-3 p-4">
              <div class="flex min-w-0 items-start justify-between gap-3">
                <p class="min-w-0 break-words text-sm font-medium text-gray-900">{{ r.exam_name }}</p>
                <span
                  :class="[
                    'shrink-0 rounded-full px-2 py-1 text-xs font-medium',
                    r.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ r.status === 'live' ? 'Live' : 'Withdrawn' }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                <div class="min-w-0">
                  <p class="text-xs text-gray-500">Released</p>
                  <p class="mt-1 break-words text-gray-800">{{ fmtDate(r.released_at) }}</p>
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-gray-500">Parents reached</p>
                  <p class="mt-1 font-medium text-gray-900">{{ r.parents_reached }}</p>
                </div>
                <div class="col-span-2 min-w-0">
                  <p class="text-xs text-gray-500">Audience</p>
                  <p class="mt-1 break-words text-gray-800">{{ r.audience_label }}</p>
                </div>
              </div>
            </article>
          </div>

          <!-- Tablet/desktop layout: full table -->
          <div class="hidden overflow-x-auto sm:block">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="whitespace-nowrap px-4 py-3 sm:px-5">Exam</th>
                  <th class="whitespace-nowrap px-4 py-3 sm:px-5">Released</th>
                  <th class="px-4 py-3 sm:px-5">Audience</th>
                  <th class="whitespace-nowrap px-4 py-3 text-right sm:px-5">Parents</th>
                  <th class="whitespace-nowrap px-4 py-3 sm:px-5">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="r in history" :key="r.id">
                  <td class="max-w-56 break-words px-4 py-3 font-medium text-gray-900 sm:px-5">{{ r.exam_name }}</td>
                  <td class="whitespace-nowrap px-4 py-3 text-gray-600 sm:px-5">{{ fmtDate(r.released_at) }}</td>
                  <td class="max-w-64 break-words px-4 py-3 text-gray-600 sm:px-5">{{ r.audience_label }}</td>
                  <td class="whitespace-nowrap px-4 py-3 text-right text-gray-900 sm:px-5">{{ r.parents_reached }}</td>
                  <td class="whitespace-nowrap px-4 py-3 sm:px-5">
                    <span
                      :class="[
                        'rounded-full px-2.5 py-1 text-xs font-medium',
                        r.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                      ]"
                    >
                      {{ r.status === 'live' ? 'Live' : 'Withdrawn' }}
                    </span>
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