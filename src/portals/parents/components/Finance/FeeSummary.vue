<template>
  <div class="space-y-5">
    <!-- Header -->
    <section class="rounded-3xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Student Finance
          </h1>
         
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Select student
            </label>
            <select
              v-model="selectedStudentId"
              @change="loadAll"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option v-for="student in students" :key="student.id" :value="student.id">
                {{ student.full_name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Term
            </label>
            <select
              v-model="selectedTerm"
              @change="loadAll"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option v-for="term in terms" :key="term.id" :value="String(term.id)">
                {{ term.name }}, {{ term.academic_year_name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {{ error }}
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-slate-500">
      Loading finance details...
    </div>

    <template v-if="!loading && finance">
      <div class="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_420px]">
        <!-- LEFT -->
        <div class="space-y-5">
          <!-- Stats -->
          <section class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-3xl border border-blue-100 bg-blue-50/70 p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">Total Billed</p>
              <p class="mt-2 text-2xl font-bold text-slate-900">KES {{ money(finance.total_billed) }}</p>
            </div>

            <div class="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-wide text-emerald-600">Paid</p>
              <p class="mt-2 text-2xl font-bold text-slate-900">KES {{ money(finance.total_paid) }}</p>
            </div>

            <div class="rounded-3xl border border-orange-100 bg-orange-50/70 p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-wide text-orange-600">Balance</p>
              <p class="mt-2 text-2xl font-bold text-slate-900">KES {{ money(finance.balance) }}</p>
            </div>
          </section>

          <!-- Document cards -->
          <section class="grid gap-4 lg:grid-cols-2">
            <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-start gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <span class="text-2xl">📄</span>
                </div>
                <div class="min-w-0 flex-1">
                  <h2 class="text-xl font-bold text-blue-700">Fee Structure</h2>
                  <p class="mt-1 text-sm leading-6 text-slate-600">
                    View the approved fee structure for {{ studentName }} ({{ selectedTermLabel }}).
                  </p>
                </div>
              </div>

              <div class="mt-5 flex flex-wrap gap-2">
                <button @click="previewFeeBreakdown" class="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                  View
                </button>
                <button @click="downloadFeeBreakdown" class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Download PDF
                </button>
                <button @click="printFeeBreakdown" class="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                  Print
                </button>
              </div>
            </article>

            <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-start gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <span class="text-2xl">🧾</span>
                </div>
                <div class="min-w-0 flex-1">
                  <h2 class="text-xl font-bold text-blue-700">Fee Statement</h2>
                  <p class="mt-1 text-sm leading-6 text-slate-600">
                    View a detailed statement of charges, payments and balance.
                  </p>
                </div>
              </div>

              <div class="mt-5 flex flex-wrap gap-2">
                <button @click="previewStatement" class="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                  View
                </button>
                <button @click="downloadStatement" class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Download PDF
                </button>
                <button @click="printStatement" class="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                  Print
                </button>
              </div>
            </article>
          </section>

          <!-- Tables -->
          <section class="grid gap-4 lg:grid-cols-2">
            <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-bold text-slate-900">Invoices</h3>

                </div>
                <router-link
                  :to="{ name: 'ParentInvoices' }"
                  class="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  View all
                </router-link>
              </div>

              <div class="space-y-3">
                <div
                  v-for="invoice in invoiceRows.slice(0, 3)"
                  :key="invoice.key"
                  class="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-3 py-3"
                >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-slate-800">{{ invoice.title }}</p>
                    <p class="text-xs text-slate-500">{{ invoice.subtitle }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <p class="whitespace-nowrap text-sm font-bold text-slate-800">
                      KES {{ money(invoice.amount) }}
                    </p>
                    <button
                      @click="downloadInvoiceRow(invoice)"
                      class="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      ↓
                    </button>
                  </div>
                </div>

                <p v-if="!invoiceRows.length" class="text-sm text-slate-500">No invoices found.</p>
              </div>
            </article>

            <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-bold text-slate-900">Receipts</h3>
                  
                </div>
                <router-link
                  :to="{ name: 'ParentReceipts' }"
                  class="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  View all
                </router-link>
              </div>

              <div class="space-y-3">
                <div
                  v-for="payment in payments.slice(0, 3)"
                  :key="payment.id"
                  class="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-3 py-3"
                >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-slate-800">
                      {{ receiptTitle(payment) }}
                    </p>
                    <p class="text-xs text-slate-500">{{ payment.date }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <p class="whitespace-nowrap text-sm font-bold text-slate-800">
                      KES {{ money(payment.amount) }}
                    </p>
                    <button
                      @click="downloadReceipt(payment)"
                      class="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      ↓
                    </button>
                  </div>
                </div>

                <p v-if="!payments.length" class="text-sm text-slate-500">No receipts found.</p>
              </div>
            </article>
          </section>
        </div>

        <!-- RIGHT PREVIEW -->
        <aside class="rounded-3xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-6 xl:h-[780px]">
          <div class="border-b border-slate-100 px-4 py-4">
            <h3 class="text-base font-bold text-slate-900">{{ previewTitle || 'Preview' }}</h3>
            <p class="mt-1 text-sm text-slate-500">
              Select any document to preview.
            </p>
          </div>

          <div class="h-[640px] xl:h-[700px]">
            <iframe
              v-if="previewUrl"
              :src="previewUrl"
              class="h-full w-full rounded-b-3xl"
              title="Document preview"
            />
            <div v-else class="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
              No document selected yet.
            </div>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getStudent } from '../../api/Students'
import { getStudentFinanceDetails, getStudentPaymentHistory } from '../../api/Finance'
import { fetchTerms } from '../../api/terms'
import {
  getStudentStatementBlob,
  getStudentFeeBreakdownBlob,
  getInvoiceBlob,
  getTransportInvoiceBlob,
  getReceiptBlob,
  blobToUrl,
  triggerDownload,
  printBlob,
} from '../../api/financeDocuments'

const students = ref([])
const terms = ref([])
const selectedStudentId = ref('')
const selectedTerm = ref('')
const finance = ref(null)
const payments = ref([])
const loading = ref(false)
const error = ref('')
const previewUrl = ref('')
const previewTitle = ref('')

const studentName = computed(() => {
  const found = students.value.find((s) => String(s.id) === String(selectedStudentId.value))
  return found?.full_name || 'Student'
})

const selectedTermLabel = computed(() => {
  const found = terms.value.find((t) => String(t.id) === String(selectedTerm.value))
  return found ? `${found.name}, ${found.academic_year_name}` : 'Selected term'
})

const invoiceRows = computed(() => {
  if (!finance.value) return []

  const schoolInvoices = (finance.value.invoices || []).map((item) => ({
    key: `school-${item.id}`,
    type: 'school',
    id: item.id,
    title: `Invoice ${item.id}`,
    subtitle: `${item.term_name || 'School Fees'} • ${item.academic_year || ''}`,
    amount: item.amount_due || 0,
  }))

  const transportInvoices = (finance.value.transport_invoices || []).map((item) => ({
    key: `transport-${item.id}`,
    type: 'transport',
    id: item.id,
    title: `Transport Invoice ${item.id}`,
    subtitle: `${item.route_name_snapshot || 'Transport'} • ${item.term_name || ''}`,
    amount: item.amount_due || 0,
  }))

  return [...schoolInvoices, ...transportInvoices]
})

const money = (value) => Number(value || 0).toLocaleString('en-KE')

const receiptTitle = (payment) => payment.reference || payment.transaction_code || `Receipt ${payment.id}`

function cleanPreviewUrl() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}

async function setPreview(title, fetcher) {
  try {
    error.value = ''
    cleanPreviewUrl()
    const blob = await fetcher()
    previewTitle.value = title
    previewUrl.value = blobToUrl(blob)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to preview document.'
  }
}

async function downloadWith(fetcher, filename) {
  try {
    error.value = ''
    const blob = await fetcher()
    triggerDownload(blob, filename)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to download document.'
  }
}

async function printWith(fetcher) {
  try {
    error.value = ''
    const blob = await fetcher()
    printBlob(blob)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to print document.'
  }
}

function statementParams() {
  return selectedTerm.value ? { term: selectedTerm.value } : {}
}

async function previewStatement() {
  await setPreview(
    `${studentName.value} Fee Statement`,
    () => getStudentStatementBlob(selectedStudentId.value, statementParams())
  )
}

async function downloadStatement() {
  await downloadWith(
    () => getStudentStatementBlob(selectedStudentId.value, { ...statementParams(), download: 1 }),
    `${studentName.value}_Fee_Statement.pdf`
  )
}

async function printStatement() {
  await printWith(
    () => getStudentStatementBlob(selectedStudentId.value, statementParams())
  )
}

async function previewFeeBreakdown() {
  await setPreview(
    `${studentName.value} Fee Structure`,
    () => getStudentFeeBreakdownBlob(selectedStudentId.value, statementParams())
  )
}

async function downloadFeeBreakdown() {
  await downloadWith(
    () => getStudentFeeBreakdownBlob(selectedStudentId.value, { ...statementParams(), download: 1 }),
    `${studentName.value}_Fee_Breakdown.pdf`
  )
}

async function printFeeBreakdown() {
  await printWith(
    () => getStudentFeeBreakdownBlob(selectedStudentId.value, statementParams())
  )
}

async function downloadInvoiceRow(row) {
  const fetcher = row.type === 'transport'
    ? () => getTransportInvoiceBlob(row.id, { download: 1 })
    : () => getInvoiceBlob(row.id, { download: 1 })

  await downloadWith(fetcher, `${row.title.replace(/\s+/g, '_')}.pdf`)
}

async function downloadReceipt(payment) {
  await downloadWith(
    () => getReceiptBlob(payment.id, { download: 1 }),
    `${receiptTitle(payment).replace(/\s+/g, '_')}.pdf`
  )
}

async function loadAll() {
  if (!selectedStudentId.value) return
  loading.value = true
  error.value = ''

  try {
    const [financeRes, historyRes] = await Promise.all([
      getStudentFinanceDetails(selectedStudentId.value, selectedTerm.value || undefined),
      getStudentPaymentHistory(selectedStudentId.value),
    ])
    finance.value = financeRes.data
    payments.value = historyRes.data?.payments || []
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to load finance details.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const [studentRes, termsRes] = await Promise.all([
      getStudent(),
      fetchTerms(),
    ])

    students.value = studentRes || []
    terms.value = Array.isArray(termsRes) ? termsRes : termsRes?.results || []

    if (students.value.length) {
      selectedStudentId.value = students.value[0].id
    }

    if (terms.value.length) {
      selectedTerm.value = String(terms.value[0].id)
    }

    await loadAll()
  } catch (err) {
    console.error(err)
    error.value = 'Failed to initialise page.'
  }
})

onBeforeUnmount(() => {
  cleanPreviewUrl()
})
</script>