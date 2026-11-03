<template>
  <div class="p-3 sm:p-6 max-w-3xl mx-auto">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-semibold">Invoice Details</h1>
      <div class="grid grid-cols-2 gap-2 sm:flex">
        <button
          @click="adjustOpen = true"
          class="rounded border border-blue-200 px-4 py-2 font-medium text-blue-700 hover:bg-blue-50"
        >
          Adjust invoice
        </button>
        <button
          @click="discountOpen = true"
          class="rounded border border-blue-200 px-4 py-2 font-medium text-blue-700 hover:bg-blue-50"
        >
          Add discount
        </button>
      </div>
    </div>

    <div v-if="notice" class="mb-6 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
      <div class="flex items-start justify-between gap-3">
        <p class="font-medium">{{ notice.title }}</p>
        <button @click="notice = null" class="shrink-0 text-gray-500 hover:text-gray-800" aria-label="Dismiss">Dismiss</button>
      </div>
      <ul class="mt-1 list-disc space-y-0.5 pl-5">
        <li v-for="(line, i) in notice.lines" :key="i">{{ line }}</li>
      </ul>
    </div>

    <div class="bg-white shadow rounded p-4 mb-6">
      <h2 class="text-lg font-semibold mb-2">Invoice Summary</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><strong>Student:</strong> {{ invoice.student_name }}</div>
        <div><strong>Class:</strong> {{ invoice.class_level }}</div>
        <div><strong>Term:</strong> {{ invoice.term_name ?? invoice.term }}</div>
        <div><strong>Year:</strong> {{ invoice.academic_year ?? invoice.year }}</div>
        <div><strong>Amount Due:</strong> {{ formatCurrency(invoice.amount_due) }}</div>
        <div><strong>Amount Paid:</strong> {{ formatCurrency(invoice.amount_paid) }}</div>
        <div>
          <strong>Balance:</strong>
          <span v-if="isOverpaid" class="text-blue-700">+{{ formatCurrency(invoice.overpaid_amount) }} over</span>
          <span v-else>{{ formatCurrency(balance) }}</span>
        </div>
        <div>
          <strong>Status:</strong>
          <span class="px-2 py-1 rounded" :class="statusClass">
            {{ statusLabel }}
          </span>
        </div>
      </div>
    </div>

    <!-- Only shown if the detail response includes invoice lines -->
    <div v-if="lines.length" class="bg-white shadow rounded p-4 mb-6">
      <h2 class="text-lg font-semibold mb-2">Invoice Lines</h2>
      <ul class="divide-y">
        <li v-for="(line, i) in lines" :key="line.id ?? i" class="flex items-start justify-between gap-3 py-2">
          <span class="min-w-0 break-words">{{ line.description }}</span>
          <span class="shrink-0 font-medium" :class="Number(line.amount) < 0 ? 'text-green-700' : ''">
            {{ formatCurrency(line.amount) }}
          </span>
        </li>
      </ul>
    </div>

    <div class="bg-white shadow rounded p-4 mb-6">
      <h2 class="text-lg font-semibold mb-2">Payments</h2>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead class="bg-gray-100 text-left">
            <tr>
              <th class="p-2">Date</th>
              <th class="p-2">Amount</th>
              <th class="p-2">Method</th>
              <th class="p-2">Transaction Code</th>
              <th class="p-2">Received By</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id" class="border-t">
              <td class="p-2 whitespace-nowrap">{{ payment.date }}</td>
              <td class="p-2">{{ formatCurrency(payment.amount) }}</td>
              <td class="p-2">{{ payment.method }}</td>
              <td class="p-2">{{ payment.transaction_code }}</td>
              <td class="p-2">{{ payment.received_by_name }}</td>
            </tr>
            <tr v-if="!payments.length">
              <td colspan="5" class="p-4 text-center text-gray-500">No payments recorded</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="!invoice.is_fully_paid">
      <RecordPayment
        :invoice-id="invoice.id"
        @paymentRecorded="fetchInvoice"
      />
    </div>

    <InvoiceAdjustModal
      v-if="adjustOpen"
      :invoice="invoice"
      @close="adjustOpen = false"
      @done="(res) => onChanged(res, 'Invoice adjusted')"
    />

    <InvoiceDiscountModal
      v-if="discountOpen"
      :invoice="invoice"
      @close="discountOpen = false"
      @done="(res) => onChanged(res, 'Discount added')"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInvoiceById } from '../../api/fee'
import RecordPayment from './RecordPayment.vue'
import InvoiceAdjustModal from './InvoiceAdjustModal.vue'
import InvoiceDiscountModal from './InvoiceDiscountModal.vue'

const route = useRoute()
const router = useRouter()
const invoice = ref({
  student_name: '',
  class_level: '',
  term: '',
  year: '',
  amount_due: 0,
  amount_paid: 0,
  is_fully_paid: false,
  payments: []
})

const adjustOpen = ref(false)
const discountOpen = ref(false)
const notice = ref(null)

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(Number(v || 0))

const balance = computed(
  () =>
    invoice.value.balance_due ??
    invoice.value.balance ??
    Number(invoice.value.amount_due) - Number(invoice.value.amount_paid),
)
const isOverpaid = computed(() => !!invoice.value.is_overpaid)
const statusLabel = computed(() => {
  if (isOverpaid.value) return 'Overpaid'
  return invoice.value.is_fully_paid ? 'Paid' : 'Pending'
})
const statusClass = computed(() => {
  if (isOverpaid.value) return 'bg-blue-100 text-blue-700'
  return invoice.value.is_fully_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
})
const payments = computed(() => invoice.value.payments ?? invoice.value.allocations ?? [])
const lines = computed(() => invoice.value.lines ?? invoice.value.items ?? [])

const fetchInvoice = async () => {
  try {
    const data = await getInvoiceById(route.params.id)
    invoice.value = data
  } catch (err) {
    console.error(err)
    alert('Failed to load invoice')
    router.back()
  }
}

// Adjust and discount return the new totals and the created line, not the full invoice,
// so build the notice from the response, then reload the invoice.
const onChanged = async (res, title) => {
  const releasedToCredit = Number(invoice.value.amount_paid) - Number(res.amount_paid)
  const lines = [
    `New amount due: ${formatCurrency(res.amount_due)} · balance: ${formatCurrency(res.balance)}`,
  ]
  if (res.line) lines.unshift(`${res.line.description}: ${formatCurrency(res.line.amount)}`)
  if (releasedToCredit > 0) {
    lines.push(`${formatCurrency(releasedToCredit)} of the paid amount was released to the student's credit.`)
  }
  adjustOpen.value = false
  discountOpen.value = false
  notice.value = { title, lines }
  await fetchInvoice()
}

onMounted(fetchInvoice)
</script>