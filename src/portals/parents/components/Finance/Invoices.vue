<template>
  <div class="space-y-5">
    <section class="rounded-3xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Invoices</h1>
         
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            v-model="selectedStudentId"
            @change="loadPage"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.full_name }}
            </option>
          </select>

          <select
            v-model="selectedTerm"
            @change="loadPage"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="">All terms</option>
            <option v-for="term in terms" :key="term.id" :value="String(term.id)">
              {{ term.name }}, {{ term.academic_year_name }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {{ error }}
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-slate-500">
      Loading invoices...
    </div>

    <div v-if="!loading" class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4">
          <h2 class="text-lg font-bold text-slate-900">Available invoices</h2>
        </div>

        <div class="space-y-3">
          <div
            v-for="invoice in invoiceRows"
            :key="invoice.key"
            class="rounded-2xl border border-slate-100 px-4 py-4"
          >
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="text-base font-bold text-slate-900">{{ invoice.title }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ invoice.subtitle }}</p>
                <p class="mt-1 text-sm text-slate-600">
                  Paid: KES {{ money(invoice.paid) }} • Balance: KES {{ money(invoice.balance) }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <button @click="previewInvoice(invoice)" class="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                  View
                </button>
                <button @click="downloadInvoice(invoice)" class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Download
                </button>
                <button @click="printInvoiceNow(invoice)" class="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                  Print
                </button>
              </div>
            </div>
          </div>

          <p v-if="!invoiceRows.length" class="text-sm text-slate-500">No invoices found.</p>
        </div>
      </section>

      <aside class="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-4">
          <h3 class="text-base font-bold text-slate-900">{{ previewTitle || 'Preview' }}</h3>
          <p class="mt-1 text-sm text-slate-500">The selected invoice opens here.</p>
        </div>

        <div class="h-[700px]">
          <iframe v-if="previewUrl" :src="previewUrl" class="h-full w-full rounded-b-3xl" />
          <div v-else class="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
            Choose an invoice to preview it.
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getStudent } from '../../api/Students'
import { getStudentFinanceDetails } from '../../api/Finance'
import { fetchTerms } from '../../api/terms'
import {
  getInvoiceBlob,
  getTransportInvoiceBlob,
  blobToUrl,
  triggerDownload,
  printBlob,
} from '../../api/financeDocuments'

const students = ref([])
const terms = ref([])
const selectedStudentId = ref('')
const selectedTerm = ref('')
const finance = ref(null)
const loading = ref(false)
const error = ref('')
const previewUrl = ref('')
const previewTitle = ref('')

const money = (value) => Number(value || 0).toLocaleString('en-KE')

const invoiceRows = computed(() => {
  if (!finance.value) return []

  const schoolRows = (finance.value.invoices || []).map((item) => ({
    key: `school-${item.id}`,
    id: item.id,
    type: 'school',
    title: `Invoice ${item.id}`,
    subtitle: `${item.term_name || 'School Fees'} • ${item.academic_year || ''}`,
    amount: item.amount_due || 0,
    paid: item.amount_paid || 0,
    balance: item.balance_due ?? (Number(item.amount_due || 0) - Number(item.amount_paid || 0)),
  }))

  const transportRows = (finance.value.transport_invoices || []).map((item) => ({
    key: `transport-${item.id}`,
    id: item.id,
    type: 'transport',
    title: `Transport Invoice ${item.id}`,
    subtitle: `${item.route_name_snapshot || 'Transport'} • ${item.term_name || ''}`,
    amount: item.amount_due || 0,
    paid: item.amount_paid || 0,
    balance: item.balance_due ?? (Number(item.amount_due || 0) - Number(item.amount_paid || 0)),
  }))

  return [...schoolRows, ...transportRows]
})

function clearPreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}

function invoiceFetcher(invoice, params = {}) {
  return invoice.type === 'transport'
    ? getTransportInvoiceBlob(invoice.id, params)
    : getInvoiceBlob(invoice.id, params)
}

async function loadPage() {
  if (!selectedStudentId.value) return
  loading.value = true
  error.value = ''

  try {
    const res = await getStudentFinanceDetails(selectedStudentId.value, selectedTerm.value || undefined)
    finance.value = res.data
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to load invoices.'
  } finally {
    loading.value = false
  }
}

async function previewInvoice(invoice) {
  try {
    error.value = ''
    clearPreview()
    const blob = await invoiceFetcher(invoice)
    previewUrl.value = blobToUrl(blob)
    previewTitle.value = invoice.title
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to preview invoice.'
  }
}

async function downloadInvoice(invoice) {
  try {
    error.value = ''
    const blob = await invoiceFetcher(invoice, { download: 1 })
    triggerDownload(blob, `${invoice.title.replace(/\s+/g, '_')}.pdf`)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to download invoice.'
  }
}

async function printInvoiceNow(invoice) {
  try {
    error.value = ''
    const blob = await invoiceFetcher(invoice)
    printBlob(blob)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to print invoice.'
  }
}

onMounted(async () => {
  try {
    const [studentRes, termsRes] = await Promise.all([getStudent(), fetchTerms()])
    students.value = studentRes || []
    terms.value = Array.isArray(termsRes) ? termsRes : termsRes?.results || []

    if (students.value.length) selectedStudentId.value = students.value[0].id
    if (terms.value.length) selectedTerm.value = String(terms.value[0].id)

    await loadPage()
  } catch (err) {
    console.error(err)
    error.value = 'Failed to initialise page.'
  }
})

onBeforeUnmount(clearPreview)
</script>