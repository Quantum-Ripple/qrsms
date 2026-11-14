<template>
  <div class="space-y-5">
    <section class="rounded-3xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Receipts</h1>
         
        </div>

        <div class="w-full sm:w-[280px]">
          <select
            v-model="selectedStudentId"
            @change="loadPage"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.full_name }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {{ error }}
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-slate-500">
      Loading receipts...
    </div>

    <div v-if="!loading" class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4">
          <h2 class="text-lg font-bold text-slate-900">Payment receipts</h2>

        </div>

        <div class="space-y-3">
          <div
            v-for="payment in payments"
            :key="payment.id"
            class="rounded-2xl border border-slate-100 px-4 py-4"
          >
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-base font-bold text-slate-900">
                    {{ payment.reference || payment.transaction_code || `Receipt ${payment.id}` }}
                  </p>
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="payment.status === 'reversed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'"
                  >
                    {{ payment.status }}
                  </span>
                </div>

                <p class="mt-1 text-sm text-slate-500">
                  {{ payment.date }} • {{ payment.method }}
                </p>

                <p class="mt-1 text-sm text-slate-600">
                  Amount: <span class="font-semibold">KES {{ money(payment.amount) }}</span>
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <button @click="previewReceipt(payment)" class="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                  View
                </button>
                <button @click="downloadReceipt(payment)" class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Download
                </button>
                <button @click="printReceiptNow(payment)" class="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                  Print
                </button>
              </div>
            </div>
          </div>

          <p v-if="!payments.length" class="text-sm text-slate-500">No receipts found.</p>
        </div>
      </section>

      <aside class="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-4">
          <h3 class="text-base font-bold text-slate-900">{{ previewTitle || 'Preview' }}</h3>
          <p class="mt-1 text-sm text-slate-500">The selected receipt opens here.</p>
        </div>

        <div class="h-[700px]">
          <iframe v-if="previewUrl" :src="previewUrl" class="h-full w-full rounded-b-3xl" />
          <div v-else class="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
            Choose a receipt to preview it.
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getStudent } from '../../api/Students'
import { getStudentPaymentHistory } from '../../api/Finance'
import {
  getReceiptBlob,
  blobToUrl,
  triggerDownload,
  printBlob,
} from '../../api/financeDocuments'

const students = ref([])
const selectedStudentId = ref('')
const payments = ref([])
const loading = ref(false)
const error = ref('')
const previewUrl = ref('')
const previewTitle = ref('')

const money = (value) => Number(value || 0).toLocaleString('en-KE')

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
    const res = await getStudentPaymentHistory(selectedStudentId.value)
    payments.value = res.data?.payments || []
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to load receipts.'
  } finally {
    loading.value = false
  }
}

function receiptName(payment) {
  return payment.reference || payment.transaction_code || `Receipt_${payment.id}`
}

async function previewReceipt(payment) {
  try {
    error.value = ''
    clearPreview()
    const blob = await getReceiptBlob(payment.id)
    previewUrl.value = blobToUrl(blob)
    previewTitle.value = receiptName(payment)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to preview receipt.'
  }
}

async function downloadReceipt(payment) {
  try {
    error.value = ''
    const blob = await getReceiptBlob(payment.id, { download: 1 })
    triggerDownload(blob, `${receiptName(payment).replace(/\s+/g, '_')}.pdf`)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to download receipt.'
  }
}

async function printReceiptNow(payment) {
  try {
    error.value = ''
    const blob = await getReceiptBlob(payment.id)
    printBlob(blob)
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.detail || 'Failed to print receipt.'
  }
}

onMounted(async () => {
  try {
    students.value = await getStudent()
    if (students.value.length) {
      selectedStudentId.value = students.value[0].id
      await loadPage()
    }
  } catch (err) {
    console.error(err)
    error.value = 'Failed to initialise page.'
  }
})

onBeforeUnmount(clearPreview)
</script>