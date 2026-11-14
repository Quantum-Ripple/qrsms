<template>
  <div class="space-y-5">
    <section class="rounded-3xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Fee Structure</h1>
        
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
      Loading fee structure...
    </div>

    <template v-if="!loading && finance">
      <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900">{{ finance.student.full_name }}</h2>
            <p class="mt-1 text-sm text-slate-500">
              {{ finance.student.admission_number }} • {{ finance.student.current_class_level }} • {{ termLabel }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <button @click="previewPdf" class="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
              View
            </button>
            <button @click="downloadPdf" class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Download PDF
            </button>
            <button @click="printPdfNow" class="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
              Print
            </button>
          </div>
        </div>
      </section>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div class="space-y-4">
          <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-slate-900">School Fees</h3>
                
              </div>
              <p class="text-lg font-bold text-blue-700">
                KES {{ money(schoolFeesTotal) }}
              </p>
            </div>

            <div v-if="invoiceLines.length" class="space-y-3">
              <div
                v-for="line in invoiceLines"
                :key="line.id"
                class="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 px-4 py-3"
              >
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-slate-800">{{ line.description }}</p>
                  <p class="mt-1 text-xs uppercase tracking-wide text-slate-400">
                    {{ line.line_type }}
                  </p>
                </div>
                <p
                  class="shrink-0 text-sm font-bold"
                  :class="Number(line.amount) < 0 ? 'text-emerald-600' : 'text-slate-900'"
                >
                  {{ Number(line.amount) < 0 ? '-' : '' }}KES {{ money(Math.abs(Number(line.amount))) }}
                </p>
              </div>
            </div>

            <p v-else class="text-sm text-slate-500">No fee invoice lines found for this term.</p>
          </section>

          <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-slate-900">Transport</h3>
          
              </div>
              <p class="text-lg font-bold text-blue-700">
                KES {{ money(transportInvoice?.amount_due || 0) }}
              </p>
            </div>

            <div v-if="transportInvoice" class="rounded-2xl border border-slate-100 px-4 py-4">
              <p class="text-sm font-semibold text-slate-800">
                {{ transportInvoice.route_name_snapshot }}
              </p>
              <p class="mt-1 text-sm text-slate-500">
                {{ formatTripType(transportInvoice.trip_type_snapshot) }}
              </p>
            </div>

            <p v-else class="text-sm text-slate-500">No transport billed for this term.</p>
          </section>
        </div>

        <aside class="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-4 py-4">
            <h3 class="text-base font-bold text-slate-900">Preview</h3>
            <p class="mt-1 text-sm text-slate-500">Preview the fee breakdown.</p>
          </div>

          <div class="h-[680px]">
            <iframe v-if="previewUrl" :src="previewUrl" class="h-full w-full rounded-b-3xl" />
            <div v-else class="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
              Click View to preview the PDF here.
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
import { getStudentFinanceDetails, getInvoiceById } from '../../api/Finance'
import { fetchTerms } from '../../api/terms'
import {
  getStudentFeeBreakdownBlob,
  blobToUrl,
  triggerDownload,
  printBlob,
} from '../../api/financeDocuments'

const students = ref([])
const terms = ref([])
const selectedStudentId = ref('')
const selectedTerm = ref('')
const finance = ref(null)
const invoiceLines = ref([])
const transportInvoice = ref(null)
const loading = ref(false)
const error = ref('')
const previewUrl = ref('')

const termLabel = computed(() => {
  const found = terms.value.find((t) => String(t.id) === String(selectedTerm.value))
  return found ? `${found.name}, ${found.academic_year_name}` : ''
})

const schoolFeesTotal = computed(() =>
  invoiceLines.value.reduce((sum, line) => sum + Number(line.amount || 0), 0)
)

const money = (value) => Number(value || 0).toLocaleString('en-KE')

const formatTripType = (type) => {
  if (type === 'ROUND_TRIP') return 'Round Trip'
  if (type === 'ONE_WAY') return 'One Way'
  return type || '—'
}

function clearPreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}

async function loadPage() {
  if (!selectedStudentId.value) return
  loading.value = true
  error.value = ''
  invoiceLines.value = []
  transportInvoice.value = null

  try {
    const financeRes = await getStudentFinanceDetails(selectedStudentId.value, selectedTerm.value || undefined)
    finance.value = financeRes.data

    const invoice = finance.value?.invoices?.[0]
    if (invoice?.id) {
      const detail = await getInvoiceById(invoice.id)
      invoiceLines.value = detail.data?.lines || []
    }

    transportInvoice.value = finance.value?.transport_invoices?.[0] || null
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to load fee structure.'
  } finally {
    loading.value = false
  }
}

async function previewPdf() {
  try {
    error.value = ''
    clearPreview()
    const blob = await getStudentFeeBreakdownBlob(selectedStudentId.value, selectedTerm.value ? { term: selectedTerm.value } : {})
    previewUrl.value = blobToUrl(blob)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to preview document.'
  }
}

async function downloadPdf() {
  try {
    error.value = ''
    const blob = await getStudentFeeBreakdownBlob(selectedStudentId.value, {
      ...(selectedTerm.value ? { term: selectedTerm.value } : {}),
      download: 1,
    })
    triggerDownload(blob, `${finance.value?.student?.full_name || 'Student'}_Fee_Breakdown.pdf`)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to download document.'
  }
}

async function printPdfNow() {
  try {
    error.value = ''
    const blob = await getStudentFeeBreakdownBlob(selectedStudentId.value, selectedTerm.value ? { term: selectedTerm.value } : {})
    printBlob(blob)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to print document.'
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