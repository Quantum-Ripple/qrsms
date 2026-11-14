<template>
  <div class="space-y-5">
    <section class="rounded-3xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Fee Statement</h1>
         
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
      Loading statement...
    </div>

    <template v-if="!loading && finance">
      <section class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-3xl border border-blue-100 bg-blue-50/70 p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">Total Billed</p>
          <p class="mt-2 text-2xl font-bold text-slate-900">KES {{ money(finance.total_billed) }}</p>
        </div>
        <div class="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-emerald-600">Total Paid</p>
          <p class="mt-2 text-2xl font-bold text-slate-900">KES {{ money(finance.total_paid) }}</p>
        </div>
        <div class="rounded-3xl border border-orange-100 bg-orange-50/70 p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-orange-600">Balance</p>
          <p class="mt-2 text-2xl font-bold text-slate-900">KES {{ money(finance.balance) }}</p>
        </div>
      </section>

      <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-lg font-bold text-slate-900">{{ finance.student.full_name }}</h2>
            <p class="mt-1 text-sm text-slate-500">
              {{ finance.student.admission_number }} • {{ selectedTermLabel || 'All terms' }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <button @click="previewStatement" class="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
              View
            </button>
            <button @click="downloadStatement" class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Download PDF
            </button>
            <button @click="printStatementNow" class="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
              Print
            </button>
          </div>
        </div>
      </section>

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-4">
            <h3 class="text-lg font-bold text-slate-900">Recent Payments</h3>
            
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="border-b border-slate-100 text-left text-slate-500">
                  <th class="px-3 py-3 font-semibold">Date</th>
                  <th class="px-3 py-3 font-semibold">Reference</th>
                  <th class="px-3 py-3 font-semibold">Method</th>
                  <th class="px-3 py-3 font-semibold">Amount</th>
                  <th class="px-3 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in payments" :key="payment.id" class="border-b border-slate-50">
                  <td class="px-3 py-3">{{ payment.date }}</td>
                  <td class="px-3 py-3">{{ payment.reference || payment.id }}</td>
                  <td class="px-3 py-3">{{ payment.method }}</td>
                  <td class="px-3 py-3 font-semibold">KES {{ money(payment.amount) }}</td>
                  <td class="px-3 py-3">
                    <span
                      class="rounded-full px-2.5 py-1 text-xs font-semibold"
                      :class="payment.status === 'reversed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'"
                    >
                      {{ payment.status }}
                    </span>
                  </td>
                </tr>

                <tr v-if="!payments.length">
                  <td colspan="5" class="px-3 py-6 text-center text-slate-500">No payments found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <aside class="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-4 py-4">
            <h3 class="text-base font-bold text-slate-900">Preview</h3>
            <p class="mt-1 text-sm text-slate-500">View the statement PDF here.</p>
          </div>

          <div class="h-[700px]">
            <iframe v-if="previewUrl" :src="previewUrl" class="h-full w-full rounded-b-3xl" />
            <div v-else class="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
              Click View to preview.
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
const previewUrl = ref('')
const loading = ref(false)
const error = ref('')

const money = (value) => Number(value || 0).toLocaleString('en-KE')

const selectedTermLabel = computed(() => {
  if (!selectedTerm.value) return 'All terms'
  const term = terms.value.find((t) => String(t.id) === String(selectedTerm.value))
  return term ? `${term.name}, ${term.academic_year_name}` : 'Selected term'
})

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

  try {
    const [financeRes, paymentsRes] = await Promise.all([
      getStudentFinanceDetails(selectedStudentId.value, selectedTerm.value || undefined),
      getStudentPaymentHistory(selectedStudentId.value),
    ])

    finance.value = financeRes.data
    payments.value = paymentsRes.data?.payments || []
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to load statement.'
  } finally {
    loading.value = false
  }
}

async function previewStatement() {
  try {
    error.value = ''
    clearPreview()
    const blob = await getStudentStatementBlob(selectedStudentId.value, selectedTerm.value ? { term: selectedTerm.value } : {})
    previewUrl.value = blobToUrl(blob)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to preview statement.'
  }
}

async function downloadStatement() {
  try {
    error.value = ''
    const blob = await getStudentStatementBlob(selectedStudentId.value, {
      ...(selectedTerm.value ? { term: selectedTerm.value } : {}),
      download: 1,
    })
    triggerDownload(blob, `${finance.value?.student?.full_name || 'Student'}_Statement.pdf`)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to download statement.'
  }
}

async function printStatementNow() {
  try {
    error.value = ''
    const blob = await getStudentStatementBlob(selectedStudentId.value, selectedTerm.value ? { term: selectedTerm.value } : {})
    printBlob(blob)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to print statement.'
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