<template>
  <div class="mx-auto max-w-5xl space-y-4 p-3 sm:space-y-6 sm:p-6">
    <!-- Header -->
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="min-w-0">
        <button @click="router.back()" class="mb-1 text-sm text-blue-600 hover:underline">Back</button>
        <h1 class="break-words text-2xl font-semibold">{{ studentLabel || 'Student account' }}</h1>
        <p class="text-sm text-gray-500">
          {{ [admission, className].filter(Boolean).join(' · ') }}
        </p>
      </div>

      <div class="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
        <label class="sr-only" for="sa-term">Term</label>
        <select id="sa-term" v-model="selectedTerm" class="w-full rounded border px-3 py-2 sm:w-auto" @change="loadAll">
          <option value="">Current term</option>
          <option v-for="t in terms" :key="t.id" :value="t.id">{{ termLabel(t) }}</option>
        </select>
        <button @click="recordOpen = true" :disabled="!summary" class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto">
          Record Payment
        </button>
      </div>
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

    <p v-if="loading && !summary" class="rounded border bg-white p-6 text-center text-gray-500">Loading account...</p>

    <template v-if="summary">
      <!-- Totals -->
      <section>
        <p v-if="termName" class="mb-2 text-sm text-gray-500">Showing {{ termName }}</p>
        <dl class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded bg-white p-3 shadow">
            <dt class="text-sm text-gray-500">Billed</dt>
            <dd class="text-lg font-semibold">{{ formatCurrency(totals.billed) }}</dd>
          </div>
          <div class="rounded bg-white p-3 shadow">
            <dt class="text-sm text-gray-500">Paid</dt>
            <dd class="text-lg font-semibold">{{ formatCurrency(totals.paid) }}</dd>
          </div>
          <div class="rounded bg-white p-3 shadow">
            <dt class="text-sm text-gray-500">Balance</dt>
            <dd class="text-lg font-semibold">{{ formatCurrency(totals.balance) }}</dd>
          </div>
          <div class="rounded bg-white p-3 shadow">
            <dt class="text-sm text-gray-500">Credit</dt>
            <dd class="text-lg font-semibold" :class="credit > 0 ? 'text-green-700' : ''">{{ formatCurrency(credit) }}</dd>
          </div>
        </dl>
      </section>

      <!-- Invoices -->
      <section class="space-y-2">
        <h2 class="text-lg font-semibold">School fee invoices</h2>
        <StudentInvoiceList
          :invoices="feeInvoices"
          kind="fee"
          :credit="credit"
          empty-text="No school fee invoices for this term."
          @view="viewInvoice"
          @apply="openApply"
        />
      </section>

      <section v-if="transportInvoices.length" class="space-y-2">
        <h2 class="text-lg font-semibold">Transport invoices</h2>
        <StudentInvoiceList
          :invoices="transportInvoices"
          kind="transport"
          :credit="credit"
          @apply="openApply"
        />
      </section>

      <!-- Credit -->
      <section class="space-y-2">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-lg font-semibold">Credit</h2>
          <button
            v-if="credit > 0"
            @click="openApply('')"
            class="w-full rounded border border-green-200 px-4 py-2 font-medium text-green-700 hover:bg-green-50 sm:w-auto"
          >
            Apply credit
          </button>
        </div>

        <p v-if="creditError" class="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{{ creditError }}</p>

        <div class="rounded bg-white p-4 shadow">
          <p class="text-sm text-gray-600">
            Credit is money paid beyond what was billed. It can be applied to any open invoice.
          </p>
          <ul v-if="credit > 0 && creditSources.length" class="mt-3 divide-y rounded border text-sm">
            <li v-for="src in creditSources" :key="src.payment" class="flex items-start justify-between gap-3 p-3">
              <div class="min-w-0">
                <div class="font-medium">Payment #{{ src.payment }} · {{ methodLabel(src.method) }}</div>
                <div class="text-gray-500">
                  {{ formatDate(src.date) }}{{ src.reference ? ' · ' + src.reference : '' }} · paid {{ formatCurrency(src.amount) }}
                </div>
              </div>
              <div class="shrink-0 text-right">
                <div class="font-semibold text-green-700">{{ formatCurrency(src.available) }}</div>
                <div class="text-xs text-gray-500">available</div>
              </div>
            </li>
          </ul>
          <p v-else-if="!creditError" class="mt-3 text-sm text-gray-500">No unapplied credit.</p>
        </div>
      </section>

      <!-- Payment history -->
      <section class="space-y-2">
        <h2 class="text-lg font-semibold">Payment history</h2>
        <p v-if="paymentsError" class="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{{ paymentsError }}</p>

        <div class="hidden overflow-x-auto rounded border bg-white md:block">
          <table class="w-full border-collapse">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-3 text-left">Date</th>
                <th class="p-3 text-left">For</th>
                <th class="p-3 text-left">Method</th>
                <th class="p-3 text-left">Reference</th>
                <th class="p-3 text-right">Amount</th>
                <th class="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in payments"
                :key="p.id"
                class="border-t"
                :class="p.status === 'reversed' ? 'text-gray-500' : ''"
              >
                <td class="p-3 whitespace-nowrap">{{ formatDate(p.date) }}</td>
                <td class="p-3">
                  <div>{{ paymentFor(p) }}</div>
                  <div class="text-xs text-gray-500">{{ p.term ? [p.term, p.academic_year].filter(Boolean).join(' · ') : '' }}</div>
                </td>
                <td class="p-3">{{ methodLabel(p.method) }}</td>
                <td class="p-3">{{ p.reference || '—' }}</td>
                <td class="p-3 text-right font-medium">{{ formatCurrency(p.amount) }}</td>
                <td class="p-3">
                  <span class="rounded px-2 py-0.5 text-xs font-medium" :class="p.status === 'reversed' ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'">
                    {{ p.status === 'reversed' ? 'Reversed' : 'Posted' }}
                  </span>
                </td>
              </tr>
              <tr v-if="!payments.length">
                <td colspan="6" class="p-4 text-center text-gray-500">No payments recorded.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="space-y-3 md:hidden">
          <article v-for="p in payments" :key="p.id" class="rounded-lg border bg-white p-4 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <h3 class="font-semibold text-gray-900" :class="p.status === 'reversed' ? 'line-through' : ''">{{ formatCurrency(p.amount) }}</h3>
              <span class="shrink-0 rounded px-2 py-0.5 text-xs font-medium" :class="p.status === 'reversed' ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'">
                {{ p.status === 'reversed' ? 'Reversed' : 'Posted' }}
              </span>
            </div>
            <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-gray-500">Date</dt>
                <dd class="mt-0.5 font-medium text-gray-800">{{ formatDate(p.date) }}</dd>
              </div>
              <div>
                <dt class="text-gray-500">Method</dt>
                <dd class="mt-0.5 font-medium text-gray-800">{{ methodLabel(p.method) }}</dd>
              </div>
              <div>
                <dt class="text-gray-500">For</dt>
                <dd class="mt-0.5 break-words font-medium text-gray-800">{{ paymentFor(p) }}</dd>
              </div>
              <div>
                <dt class="text-gray-500">Reference</dt>
                <dd class="mt-0.5 break-words font-medium text-gray-800">{{ p.reference || '—' }}</dd>
              </div>
            </dl>
          </article>
          <div v-if="!payments.length" class="rounded-lg border bg-white p-6 text-center text-gray-500">No payments recorded.</div>
        </div>
      </section>
    </template>

    <RecordPaymentModal
      v-if="recordOpen"
      :students="[studentObj]"
      :student-id="studentId"
      @close="recordOpen = false"
      @saved="onRecorded"
    />

    <ApplyCreditModal
      v-if="applyOpen"
      :student-id="studentId"
      :student-label="studentLabel"
      :credit="credit"
      :targets="openTargets"
      :initial-target="applyTarget"
      @close="applyOpen = false"
      @done="onApplied"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getStudentFinance,
  getStudentPayments,
  getStudentCredit,
  extractInvoices,
  studentName,
  studentAdmission,
} from '../../api/payment'
import { unwrapList, errorMessage } from '../../api/charge'
import { listTerms } from '../../api/term'
import StudentInvoiceList from './StudentInvoiceList.vue'
import ApplyCreditModal from '../payments/ApplyCreditModal.vue'
import RecordPaymentModal from '../payments/RecordPaymentModal.vue'

const route = useRoute()
const router = useRouter()
const studentId = computed(() => Number(route.params.id))

const terms = ref([])
const selectedTerm = ref('')

const summary = ref(null)
const paymentsData = ref(null)
const creditData = ref(null)
const loading = ref(false)
const pageError = ref('')
const paymentsError = ref('')
const creditError = ref('')
const notice = ref(null)

const recordOpen = ref(false)
const applyOpen = ref(false)
const applyTarget = ref('')

// ---------- helpers ----------
const formatCurrency = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(Number(v || 0))

const formatDate = (d) =>
  d ? new Date(`${String(d).slice(0, 10)}T00:00:00`).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : ''

const termLabel = (t) => [t.name, t.academic_year_name ?? t.academic_year].filter(Boolean).join(' · ')
const methodLabel = (m) => ({ mpesa: 'M-Pesa', cash: 'Cash', bank: 'Bank', cheque: 'Cheque' }[String(m).toLowerCase()] ?? m)

const balanceOf = (inv) =>
  Number(inv.balance_due ?? inv.balance ?? Number(inv.amount_due || 0) - Number(inv.amount_paid || 0))

// ---------- derived from the summary ----------
const student = computed(() => summary.value?.student ?? {})
const studentLabel = computed(() => studentName(student.value) || summary.value?.student_name || '')
const admission = computed(() => studentAdmission(student.value))
const className = computed(() => student.value.class_level_name ?? student.value.class_level ?? summary.value?.class_level ?? '')
const termName = computed(() => {
  const t = summary.value?.term
  return typeof t === 'string' ? t : t?.name ?? summary.value?.term_name ?? ''
})
const studentObj = computed(() => ({
  id: studentId.value,
  full_name: studentLabel.value,
  admission_number: admission.value,
}))

const feeInvoices = computed(() => extractInvoices(summary.value ?? {}).fee)
const transportInvoices = computed(() => extractInvoices(summary.value ?? {}).transport)

// Use the summary's combined totals when present, otherwise add up the invoices
const totals = computed(() => {
  const t = summary.value?.totals ?? summary.value?.combined ?? {}
  const all = [...feeInvoices.value, ...transportInvoices.value]
  const sum = (fn) => all.reduce((n, i) => n + fn(i), 0)
  return {
    billed: t.billed ?? t.amount_due ?? sum((i) => Number(i.amount_due || 0)),
    paid: t.paid ?? t.amount_paid ?? sum((i) => Number(i.amount_paid || 0)),
    balance: t.balance ?? t.balance_due ?? sum((i) => Math.max(balanceOf(i), 0)),
  }
})

// ---------- credit and payments ----------
const credit = computed(() => Number(creditData.value?.credit ?? paymentsData.value?.totals?.credit ?? 0))
const creditSources = computed(() => creditData.value?.sources ?? [])

const payments = computed(() => {
  const d = paymentsData.value
  if (Array.isArray(d)) return d
  return d?.payments ?? d?.results ?? []
})

const paymentFor = (p) => p.recorded_for ?? (p.kind === 'transport' ? 'Transport' : 'School fees')

// Open invoices a credit payment can be applied to
const openTargets = computed(() => {
  const make = (kind, inv) => ({
    key: `${kind}:${inv.id}`,
    balance: balanceOf(inv),
    label: [
      kind === 'transport' ? 'Transport' : 'School fees',
      inv.term_name ?? inv.term,
      `balance ${balanceOf(inv).toLocaleString('en-KE')}`,
    ]
      .filter(Boolean)
      .join(' · '),
  })
  return [
    ...feeInvoices.value.map((i) => make('fee', i)),
    ...transportInvoices.value.map((i) => make('transport', i)),
  ].filter((t) => t.balance > 0)
})

// ---------- loading ----------
const loadAll = async () => {
  loading.value = true
  pageError.value = ''
  paymentsError.value = ''
  creditError.value = ''

  const params = selectedTerm.value ? { term: selectedTerm.value } : {}
  const [s, p, c] = await Promise.allSettled([
    getStudentFinance(studentId.value, params),
    getStudentPayments(studentId.value),
    getStudentCredit(studentId.value),
  ])

  if (s.status === 'fulfilled') summary.value = s.value
  else {
    summary.value = null
    pageError.value = errorMessage(s.reason)
  }

  if (p.status === 'fulfilled') paymentsData.value = p.value
  else paymentsError.value = `Payment history could not load. ${errorMessage(p.reason)}`

  if (c.status === 'fulfilled') creditData.value = c.value
  else creditError.value = `Credit could not load. ${errorMessage(c.reason)}`

  loading.value = false
}

onMounted(async () => {
  try {
    terms.value = unwrapList(await listTerms())
  } catch {
    terms.value = []
  }
  loadAll()
})

// ---------- actions ----------
const viewInvoice = (id) => router.push({ name: 'InvoiceDetails', params: { id } })

const openApply = (key) => {
  applyTarget.value = key
  applyOpen.value = true
}

const onRecorded = async (p) => {
  recordOpen.value = false
  const lines = [`Applied to invoices: ${formatCurrency(p.allocated)}`]
  if (Number(p.credit) > 0) lines.push(`Kept as credit: ${formatCurrency(p.credit)}`)
  notice.value = { title: `Payment of ${formatCurrency(p.amount)} recorded`, lines }
  await loadAll()
}

const onApplied = async (res) => {
  applyOpen.value = false
  notice.value = {
    title: `${formatCurrency(res.applied)} of credit applied`,
    lines: [`Credit left: ${formatCurrency(res.credit_left)}`],
  }
  await loadAll()
}
</script>