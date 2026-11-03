<template>
  <div class="space-y-4 p-3 sm:space-y-6 sm:p-6">
    <!-- Toolbar -->
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-4">
        <label class="sr-only" for="pr-search">Search payments</label>
        <input
          id="pr-search"
          v-model="search"
          type="search"
          placeholder="Search student or reference..."
          class="w-full rounded border px-3 py-2 sm:w-64"
        />

        <label class="sr-only" for="pr-term">Term</label>
        <select id="pr-term" v-model="selectedTerm" class="w-full rounded border px-3 py-2 sm:w-auto">
          <option value="">All terms</option>
          <option v-for="t in terms" :key="t.id" :value="t.id">{{ termLabel(t) }}</option>
        </select>

        <label class="sr-only" for="pr-method">Method</label>
        <select id="pr-method" v-model="methodFilter" class="w-full rounded border px-3 py-2 sm:w-auto">
          <option value="">All methods</option>
          <option v-for="m in methods" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>

        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="includeReversed" type="checkbox" class="rounded border" />
          Show reversed payments
        </label>
      </div>

      <button @click="recordOpen = true" class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto">
        Record Payment
      </button>
    </div>

    <p v-if="pageError" class="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ pageError }}</p>

    <div v-if="notice" class="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
      <div class="flex items-start justify-between gap-3">
        <p class="font-medium">{{ notice.title }}</p>
        <button @click="notice = null" class="shrink-0 text-gray-500 hover:text-gray-800" aria-label="Dismiss">Dismiss</button>
      </div>
      <ul v-if="notice.lines?.length" class="mt-1 list-disc space-y-0.5 pl-5">
        <li v-for="(line, i) in notice.lines" :key="i">{{ line }}</li>
      </ul>
    </div>

    <!-- Desktop table -->
    <div class="hidden overflow-x-auto rounded border md:block">
      <table class="w-full border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-left">Date</th>
            <th class="p-3 text-left">Student</th>
            <th class="p-3 text-left">Method</th>
            <th class="p-3 text-left">Reference</th>
            <th class="p-3 text-right">Amount</th>
            <th class="p-3 text-right">Credit</th>
            <th class="p-3 text-left">Status</th>
            <th class="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="8" class="p-4 text-center text-gray-500">Loading payments...</td></tr>

          <tr v-for="p in payments" :key="p.id" class="border-t hover:bg-gray-50" :class="p.status === 'reversed' ? 'text-gray-500' : ''">
            <td class="p-3 whitespace-nowrap">{{ formatDate(p.date) }}</td>
            <td class="p-3">
              <div class="font-medium" :class="p.status === 'reversed' ? 'line-through' : ''">{{ p.full_name }}</div>
              <div class="text-sm text-gray-500">{{ p.class_level }}</div>
            </td>
            <td class="p-3">{{ p.payment_method }}</td>
            <td class="p-3">{{ p.transaction_code || '—' }}</td>
            <td class="p-3 text-right font-medium">{{ formatCurrency(p.amount) }}</td>
            <td class="p-3 text-right">{{ Number(p.credit) > 0 ? formatCurrency(p.credit) : '—' }}</td>
            <td class="p-3">
              <span class="rounded px-2 py-0.5 text-xs font-medium" :class="p.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'">
                {{ p.status === 'posted' ? 'Posted' : 'Reversed' }}
              </span>
            </td>
            <td class="space-x-3 p-3 text-center whitespace-nowrap">
              <button @click="openReceipt(p)" class="text-blue-600 hover:underline">Receipt</button>
              <template v-if="p.status === 'posted'">
                <button @click="openAction('reallocate', p)" class="text-blue-600 hover:underline">Reallocate</button>
                <button @click="openAction('transfer', p)" class="text-blue-600 hover:underline">Transfer</button>
                <button @click="openAction('reverse', p)" class="text-red-600 hover:underline">Reverse</button>
              </template>
            </td>
          </tr>

          <tr v-if="!loading && !payments.length">
            <td colspan="8" class="p-4 text-center text-gray-500">No payments found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <div class="space-y-3 md:hidden">
      <p v-if="loading" class="rounded-lg border bg-white p-6 text-center text-gray-500">Loading payments...</p>

      <article v-for="p in payments" :key="p.id" class="rounded-lg border bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <h2 class="min-w-0 break-words font-semibold text-gray-900" :class="p.status === 'reversed' ? 'line-through' : ''">{{ p.full_name }}</h2>
          <span class="shrink-0 text-right font-semibold text-gray-900">{{ formatCurrency(p.amount) }}</span>
        </div>

        <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-gray-500">Date</dt>
            <dd class="mt-0.5 font-medium text-gray-800">{{ formatDate(p.date) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Method</dt>
            <dd class="mt-0.5 font-medium text-gray-800">{{ p.payment_method }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Reference</dt>
            <dd class="mt-0.5 break-words font-medium text-gray-800">{{ p.transaction_code || '—' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Status</dt>
            <dd class="mt-0.5 font-medium" :class="p.status === 'posted' ? 'text-green-700' : 'text-gray-600'">
              {{ p.status === 'posted' ? 'Posted' : 'Reversed' }}
            </dd>
          </div>
          <div v-if="Number(p.credit) > 0" class="col-span-2">
            <dt class="text-gray-500">Left as credit</dt>
            <dd class="mt-0.5 font-medium text-gray-800">{{ formatCurrency(p.credit) }}</dd>
          </div>
        </dl>

        <div class="mt-4 grid grid-cols-2 gap-2">
          <button @click="openReceipt(p)" class="rounded border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">Receipt</button>
          <template v-if="p.status === 'posted'">
            <button @click="openAction('reallocate', p)" class="rounded border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">Reallocate</button>
            <button @click="openAction('transfer', p)" class="rounded border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">Transfer</button>
            <button @click="openAction('reverse', p)" class="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">Reverse</button>
          </template>
        </div>
      </article>

      <div v-if="!loading && !payments.length" class="rounded-lg border bg-white p-6 text-center text-gray-500">
        No payments found.
      </div>
    </div>

    <!-- Server-side pagination controls -->
    <div class="flex flex-col gap-3 rounded border bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p class="text-gray-600" aria-live="polite">
        <template v-if="count">Showing {{ rangeStart }}–{{ rangeEnd }} of {{ count.toLocaleString('en-KE') }} payments</template>
        <template v-else>No matching payments</template>
      </p>
      <div class="flex flex-wrap items-center gap-2">
        <label for="pr-size">Rows</label>
        <select id="pr-size" v-model.number="pageSize" class="rounded border px-2 py-1.5">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
        <button type="button" :disabled="loading || page <= 1" @click="page = 1" class="rounded border px-3 py-1.5 disabled:opacity-40">First</button>
        <button type="button" :disabled="loading || page <= 1" @click="page--" class="rounded border px-3 py-1.5 disabled:opacity-40">Previous</button>
        <span class="px-2 whitespace-nowrap">Page {{ page }} of {{ totalPages }}</span>
        <button type="button" :disabled="loading || page >= totalPages" @click="page++" class="rounded border px-3 py-1.5 disabled:opacity-40">Next</button>
        <button type="button" :disabled="loading || page >= totalPages" @click="page = totalPages" class="rounded border px-3 py-1.5 disabled:opacity-40">Last</button>
      </div>
    </div>

    <RecordPaymentModal v-if="recordOpen" :students="students" @close="recordOpen = false" @saved="onRecorded" />

    <PaymentActionModal
      v-if="action"
      :mode="action.mode"
      :payment="action.payment"
      :students="students"
      @close="action = null"
      @done="onActionDone"
    />

    <!-- Receipt -->
    <div v-if="receipt" class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" @click.self="receipt = null">
      <div class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:max-w-md sm:rounded-lg sm:p-6">
        <div id="receipt-print">
          <div class="text-center">
            <p v-if="receiptView.school" class="font-semibold">{{ receiptView.school }}</p>
            <h2 class="text-lg font-semibold">Payment receipt</h2>
            <p class="text-sm text-gray-500">No. {{ receipt.row.id }} · {{ formatDate(receipt.row.date) }}</p>
          </div>

          <p v-if="receipt.loading" class="mt-4 text-center text-sm text-gray-500">Loading details...</p>

          <dl class="mt-4 divide-y rounded border text-sm">
            <div class="flex justify-between gap-3 p-3"><dt class="text-gray-600">Student</dt><dd class="text-right font-medium">{{ receiptView.student }}</dd></div>
            <div v-if="receiptView.admission" class="flex justify-between gap-3 p-3"><dt class="text-gray-600">Admission no.</dt><dd class="font-medium">{{ receiptView.admission }}</dd></div>
            <div class="flex justify-between gap-3 p-3"><dt class="text-gray-600">Class</dt><dd class="font-medium">{{ receipt.row.class_level }}</dd></div>
            <div class="flex justify-between gap-3 p-3"><dt class="text-gray-600">Method</dt><dd class="font-medium">{{ receipt.row.payment_method }}</dd></div>
            <div v-if="receipt.row.transaction_code" class="flex justify-between gap-3 p-3"><dt class="text-gray-600">Reference</dt><dd class="break-all font-medium">{{ receipt.row.transaction_code }}</dd></div>
            <div class="flex justify-between gap-3 p-3"><dt class="text-gray-600">Amount paid</dt><dd class="font-semibold">{{ formatCurrency(receipt.row.amount) }}</dd></div>
            <div class="flex justify-between gap-3 p-3"><dt class="text-gray-600">Applied to invoices</dt><dd class="font-medium">{{ formatCurrency(receipt.row.allocated) }}</dd></div>
            <div v-if="Number(receipt.row.credit) > 0" class="flex justify-between gap-3 p-3"><dt class="text-gray-600">Left as credit</dt><dd class="font-medium">{{ formatCurrency(receipt.row.credit) }}</dd></div>
            <div v-if="receipt.row.status === 'reversed'" class="p-3 text-center font-semibold text-red-700">This payment was reversed</div>
          </dl>

          <ul v-if="receiptView.allocations.length" class="mt-3 divide-y rounded border text-sm">
            <li v-for="(a, i) in receiptView.allocations" :key="i" class="flex justify-between gap-3 p-2.5">
              <span class="min-w-0 break-words text-gray-700">{{ a.label }}</span>
              <span class="shrink-0 font-medium">{{ formatCurrency(a.amount) }}</span>
            </li>
          </ul>
        </div>

        <p v-if="receipt.error" class="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{{ receipt.error }}</p>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" @click="receipt = null" class="w-full rounded border px-4 py-2 hover:bg-gray-50 sm:w-auto">Close</button>
          <button type="button" @click="printReceipt" class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto">Print receipt</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getPayments, getPaymentById, getPaymentMethods, studentName } from '../../api/payment'
import { unwrapList, errorMessage } from '../../api/charge'
import { listTerms } from '../../api/term'

import { getStudent } from '../../api/Students'
import RecordPaymentModal from './RecordPaymentModal.vue'
import PaymentActionModal from './PaymentActionModal.vue'

const payments = ref([])
const terms = ref([])
const students = ref([])
const loading = ref(false)
const pageError = ref('')
const notice = ref(null)

const search = ref('')
const selectedTerm = ref('')
const methodFilter = ref('')
const includeReversed = ref(false)

const recordOpen = ref(false)
const action = ref(null)
const receipt = ref(null)

// ---------- helpers ----------
const formatCurrency = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(Number(v || 0))

const formatDate = (d) =>
  d ? new Date(`${String(d).slice(0, 10)}T00:00:00`).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : ''

const termLabel = (t) => [t.name, t.academic_year_name ?? t.academic_year].filter(Boolean).join(' · ')

// Use server-provided method choices, not the values on the current page.
const methods = ref([])
const page = ref(1)
const pageSize = ref(25)
const count = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)))
const rangeStart = computed(() => count.value ? (page.value - 1) * pageSize.value + 1 : 0)
const rangeEnd = computed(() => Math.min(page.value * pageSize.value, count.value))

// Avoid stale responses replacing newer results during rapid filter/page changes.
let requestSequence = 0
const loadPayments = async () => {
  const sequence = ++requestSequence
  loading.value = true
  pageError.value = ''
  try {
    const params = { page: page.value, page_size: pageSize.value }
    if (selectedTerm.value) params.term = selectedTerm.value
    if (includeReversed.value) params.include_reversed = 1
    if (methodFilter.value) params.method = methodFilter.value
    if (search.value.trim()) params.search = search.value.trim()

    const response = await getPayments(params)
    if (sequence !== requestSequence) return
    if (!Array.isArray(response?.results)) throw new Error('Expected paginated payments response.')
    payments.value = response.results
    count.value = Number(response.count ?? 0)
    if (page.value > totalPages.value) {
      page.value = totalPages.value // Automatically refresh the last valid page.
    }
  } catch (err) {
    if (sequence !== requestSequence) return
    payments.value = []
    count.value = 0
    pageError.value = errorMessage(err)
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}

// Search is debounced. Other filters immediately reset to the first page.
let searchTimer
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (page.value === 1) loadPayments()
    else page.value = 1
  }, 350)
})
watch([selectedTerm, methodFilter, includeReversed, pageSize], () => {
  if (page.value === 1) loadPayments()
  else page.value = 1
})
watch(page, loadPayments)

onMounted(async () => {
  loadPayments()
  try {
    const [t, s] = await Promise.all([listTerms(), getStudent()])
    terms.value = unwrapList(t)
    students.value = unwrapList(s)
  } catch (err) {
    pageError.value = errorMessage(err)
  }
  try {
    const choices = await getPaymentMethods()
    methods.value = choices
  } catch (err) {
    // Payments can still load even if method choices are unavailable.
    console.error('Could not load payment methods', err)
  }
})

// ---------- record ----------
const onRecorded = async (p) => {
  recordOpen.value = false
  const lines = [`Applied to invoices: ${formatCurrency(p.allocated)}`]
  if (Number(p.credit) > 0) lines.push(`Kept as credit: ${formatCurrency(p.credit)}`)
  notice.value = {
    title: `Payment of ${formatCurrency(p.amount)} recorded for ${p.full_name ?? studentName(students.value.find((s) => s.id === p.student_id))}`,
    lines,
  }
  if (page.value === 1) await loadPayments()
  else page.value = 1
}

// ---------- reverse / reallocate / transfer ----------
const openAction = (mode, payment) => {
  action.value = { mode, payment }
}

const onActionDone = async (message) => {
  action.value = null
  notice.value = { title: message, lines: [] }
  await loadPayments()
}

// ---------- receipt ----------
const openReceipt = async (row) => {
  receipt.value = { row, detail: null, loading: true, error: '' }
  try {
    const detail = await getPaymentById(row.id, { include_reversed: 1 })
    receipt.value = { row: { ...row, ...pickKnown(detail) }, detail, loading: false, error: '' }
  } catch (err) {
    receipt.value = { row, detail: null, loading: false, error: `Some details could not load. ${errorMessage(err)}` }
  }
}

// Only let the detail override fields the list row already shows
const pickKnown = (d) => {
  const out = {}
  ;['amount', 'allocated', 'credit', 'status', 'date', 'transaction_code'].forEach((k) => {
    if (d[k] != null) out[k] = d[k]
  })
  return out
}

const receiptView = computed(() => {
  const r = receipt.value
  if (!r) return { allocations: [] }
  const d = r.detail ?? {}
  const allocations = (d.allocations ?? []).map((a) => ({
    label:
      a.label ??
      [a.invoice_term ?? a.term_name ?? a.term, a.transport_invoice ? 'Transport' : 'School fees', `#${a.invoice ?? a.transport_invoice ?? a.invoice_id ?? ''}`]
        .filter(Boolean)
        .join(' · '),
    amount: a.amount,
  }))
  return {
    school: d.school_name ?? d.school?.name ?? '',
    student: r.row.full_name ?? d.student_name ?? d.student?.full_name ?? '',
    admission: d.admission_number ?? d.student?.admission_number ?? '',
    allocations,
  }
})

const printReceipt = () => window.print()
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #receipt-print,
  #receipt-print * {
    visibility: visible;
  }
  #receipt-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 1rem;
  }
}
</style>