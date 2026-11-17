<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getHowToPay } from '../api/Finance'
import { formatAccount, IN_APP_PAYMENT_MODE, paymentSteps } from '@/utils/PaymentSteps'
import { useChildStore } from '../store/childStore'
import ChildPicker from '../components/ChildPicker.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const store = useChildStore()
const student = computed(() => store.selected)

const modes = ref([])
const loading = ref(true)
const failed = ref(false)
const studentFailed = ref(false)
let requestId = 0

const mode = computed(() =>
  modes.value.find((m) => String(m.id) === String(route.params.id))
  || (String(route.params.id) === String(IN_APP_PAYMENT_MODE.id) ? IN_APP_PAYMENT_MODE : null)
)
const admission = computed(() => student.value?.admission_number || 'ADMISSION NO.')

// Details the parent needs to copy, depending on the type of mode.
const rows = computed(() => {
  const m = mode.value
  if (!m) return []
  if (m.kind === 'paybill') {
    return [
      { label: 'Business number', value: m.business_number },
      { label: 'Account number', value: formatAccount(m, admission.value) },
    ]
  }
  if (m.kind === 'bank') {
    return [
      { label: 'Bank', value: [m.bank_name, m.branch].filter(Boolean).join(', ') },
      { label: 'Account name', value: m.account_name, copy: true },
      { label: 'Account number', value: m.account_number, copy: true },
      { label: 'Reference', value: admission.value, copy: true },
    ]
  }
  return []
})

const steps = computed(() => (mode.value ? paymentSteps(mode.value, admission.value) : []))

async function load() {
  const currentRequest = ++requestId
  if (String(route.params.id) === String(IN_APP_PAYMENT_MODE.id)) {
    modes.value = [IN_APP_PAYMENT_MODE]
    loading.value = false
    failed.value = false
    return
  }

  loading.value = true
  failed.value = false
  try {
    const result = await getHowToPay(typeof route.query.for === 'string' ? route.query.for : '')
    if (!Array.isArray(result)) throw new TypeError('Payment options response must be a list.')
    if (currentRequest === requestId) modes.value = result
  } catch {
    if (currentRequest === requestId) failed.value = true
  } finally {
    if (currentRequest === requestId) loading.value = false
  }
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(String(text))
    toast.success('Copied')
  } catch {
    toast.error('Could not copy. Please type it in.')
  }
}

function payInApp() {
  router.push({ name: 'ParentOnlinePayment' })
}

onMounted(load)
watch(() => [route.params.id, route.query.for], load)
onMounted(() => {
  store.load().catch(() => {
    studentFailed.value = true
  })
})
</script>

<template>
  <div class="mx-auto w-full max-w-7xl space-y-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex min-w-0 items-center gap-3">
        <button
          type="button"
          class="shrink-0 p-2 text-slate-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          aria-label="Back to payment options"
          @click="router.push({ name: 'ParentHowToPay', query: route.query })"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div class="min-w-0">
          <h1 class="truncate text-2xl font-bold text-slate-900 sm:text-3xl">Payment instruction</h1>
        </div>
      </div>

      <div v-if="student" class="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:max-w-sm">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
          {{ (student.first_name || student.full_name || student.name || '?').charAt(0) }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-slate-900">{{ student.full_name || student.name || student.first_name }}</p>
          <p class="truncate text-xs text-slate-500">{{ student.admission_number || 'Admission number unavailable' }}</p>
        </div>
        <label v-if="store.children.length > 1" class="sr-only">
          Select student
          <ChildPicker aria-label="Select student" />
        </label>
      </div>
    </header>

    <div v-if="studentFailed" role="status" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Student details could not be loaded. Admission-specific payment references may need to be entered manually.
    </div>

    <div v-if="loading" class="grid gap-4 lg:grid-cols-2" aria-label="Loading payment instructions">
      <div class="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div class="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>

    <div v-else-if="failed" role="alert" class="rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
      <p class="text-sm text-slate-700">We could not load this payment option.</p>
      <button type="button" class="mt-4 min-h-11 rounded-xl border border-blue-600 px-5 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200" @click="load">
        Try again
      </button>
    </div>

    <div v-else-if="!mode" class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p class="text-sm text-slate-600">This payment option is no longer available.</p>
      <button
        type="button"
        class="mt-4 min-h-11 rounded-xl border border-blue-600 px-5 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        @click="router.push({ name: 'ParentHowToPay', query: route.query })"
      >
        See all options
      </button>
    </div>

    <template v-else>
      <!-- Numbers to copy -->
      <div v-if="rows.length" class="rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
        <div
          v-for="r in rows"
          :key="r.label"
          class="flex flex-col gap-3 border-t border-slate-200 py-4 first:border-t-0 sm:flex-row sm:items-center"
        >
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-slate-500">{{ r.label }}</p>
            <p class="mt-1 break-all text-base font-bold tracking-wide text-slate-900 sm:text-lg">{{ r.value || '—' }}</p>
          </div>
          <button
            v-if="r.value && (mode.kind === 'paybill' || r.copy)"
            type="button"
            class="min-h-11 shrink-0 rounded-xl border border-blue-600 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            @click="copy(r.value)"
          >
            Copy
          </button>
        </div>
      </div>

      <template v-if="mode.kind === 'app'">
        <ol v-if="steps.length" class="space-y-2">
          <li v-for="(s, i) in steps" :key="i" class="flex items-start gap-3">
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
              {{ i + 1 }}
            </span>
            <span class="pt-0.5 text-sm leading-relaxed text-slate-700">{{ s }}</span>
          </li>
        </ol>

        <button
          type="button"
          class="min-h-12 w-full rounded-xl px-5 text-base font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 sm:w-fit sm:px-8"
          style="background: linear-gradient(135deg, #1db954, #14a44d)"
          @click="payInApp"
        >
          Pay With Mpesa Now
        </button>
      </template>

      <div v-else-if="steps.length" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <ol class="space-y-4">
          <li v-for="(s, i) in steps" :key="i" class="flex items-start gap-3">
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {{ i + 1 }}
            </span>
            <span class="pt-0.5 text-sm leading-relaxed text-slate-700 sm:text-base">{{ s }}</span>
          </li>
        </ol>
      </div>
      <p v-else class="text-sm text-slate-600">
        Please contact the school office for instructions for this payment method.
      </p>
    </template>
  </div>
</template>