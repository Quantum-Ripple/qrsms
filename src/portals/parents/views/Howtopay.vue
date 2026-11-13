<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getHowToPay } from '../api/Finance'
import { IN_APP_PAYMENT_MODE } from '@/utils/PaymentSteps'

const route = useRoute()
const router = useRouter()

const items = [
  { code: '', label: 'All' },
  { code: 'fees', label: 'School fees' },
  { code: 'transport', label: 'Transport' },
  { code: 'uniform', label: 'Uniform' },
  { code: 'other', label: 'Other' },
]

const modes = ref([])
const loading = ref(true)
const failed = ref(false)
const item = ref(typeof route.query.for === 'string' ? route.query.for : '')
let requestId = 0

function includeInAppMode(availableModes) {
  const appMode = availableModes.find((mode) => mode.kind === 'app')
  return [
    appMode || IN_APP_PAYMENT_MODE,
    ...availableModes.filter((mode) => mode.kind !== 'app'),
  ]
}

async function load() {
  const currentRequest = ++requestId
  loading.value = true
  failed.value = false
  try {
    const result = await getHowToPay(item.value)
    if (!Array.isArray(result)) throw new TypeError('Payment options response must be a list.')
    if (currentRequest === requestId) modes.value = includeInAppMode(result)
  } catch {
    if (currentRequest === requestId) {
      modes.value = [IN_APP_PAYMENT_MODE]
      failed.value = true
    }
  } finally {
    if (currentRequest === requestId) loading.value = false
  }
}

function pick(code) {
  const query = { ...route.query }
  if (code) query.for = code
  else delete query.for
  router.replace({ query })
}

function open(mode) {
  router.push({
    name: 'ParentHowToPayDetail',
    params: { id: mode.id },
    query: item.value ? { for: item.value } : {},
  })
}

watch(
  () => route.query.for,
  (value) => {
    item.value = typeof value === 'string' ? value : ''
    load()
  }
)

onMounted(load)
</script>

<template>
  <div class="mx-auto w-full max-w-5xl">
    <h1 class="mb-5 text-2xl font-bold text-slate-900">How to pay</h1>

    <nav class="mb-4 flex gap-5 overflow-x-auto border-b border-slate-200" aria-label="Payment category">
      <button
        v-for="option in items"
        :key="option.code"
        type="button"
        :aria-pressed="item === option.code"
        class="min-h-11 shrink-0 border-b-2 px-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        :class="item === option.code ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'"
        @click="pick(option.code)"
      >
        {{ option.label }}
      </button>
    </nav>

    <div v-if="loading" class="divide-y divide-slate-200 border-y border-slate-200" aria-label="Loading payment options">
      <div v-for="n in 3" :key="n" class="flex h-14 items-center justify-between">
        <div class="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div class="h-4 w-4 animate-pulse rounded bg-slate-100" />
      </div>
    </div>

    <div v-else-if="failed" role="alert" class="border-y border-slate-200 py-4">
      <p class="text-sm text-slate-600">Could not load other payment options.</p>
      <button
        type="button"
        class="mt-2 min-h-10 text-sm font-semibold text-blue-700 hover:text-blue-900 focus:outline-none focus-visible:underline"
        @click="load"
      >
        Try again
      </button>
      <ul class="mt-2 divide-y divide-slate-200 border-y border-slate-200">
        <li>
          <button
            type="button"
            class="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            @click="open(IN_APP_PAYMENT_MODE)"
          >
            <span class="min-w-0 truncate text-sm font-medium text-slate-800">{{ IN_APP_PAYMENT_MODE.name }}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-slate-400" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </li>
      </ul>
    </div>

    <div v-else-if="!modes.length" class="border-y border-slate-200 py-6 text-sm text-slate-500">
      No payment options available.
    </div>

    <ul v-else class="divide-y divide-slate-200 border-y border-slate-200">
      <li v-for="mode in modes" :key="mode.id">
        <button
          type="button"
          class="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left transition-colors hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          @click="open(mode)"
        >
          <span class="min-w-0 truncate text-sm font-medium text-slate-800">{{ mode.name }}</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="shrink-0 text-slate-400"
            aria-hidden="true"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>
