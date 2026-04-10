<template>
  <div class="p-4 md:p-6">
    <h1 class="text-xl md:text-2xl font-semibold mb-4"></h1>

    <div class="flex flex-wrap gap-4 mb-4 items-center justify-between">
      <div class="flex flex-wrap gap-2 md:gap-4">
        <input
          v-model="search"
          type="text"
          placeholder="Search by student or amount..."
          class="border rounded px-2 md:px-3 py-1 md:py-2 w-48 md:w-64 text-sm md:text-base"
        />

        <select
          v-model="selectedClassLevel"
          class="border rounded px-2 md:px-3 py-1 md:py-2 text-sm md:text-base"
        >
          <option value="">All Classes</option>
          <option v-for="grade in GRADES" :key="grade.value" :value="grade.value">
            {{ grade.label }}
          </option>
        </select>

        <select
          v-model="selectedTerm"
          class="border rounded px-2 md:px-3 py-1 md:py-2 text-sm md:text-base"
        >
          <option value="">All Terms</option>
          <option v-for="term in terms" :key="term" :value="term">{{ term }}</option>
        </select>
      </div>

      <button
        @click="goToCreateInvoice"
        class="bg-blue-600 text-white px-3 md:px-4 py-1 md:py-2 rounded hover:bg-blue-700 text-sm md:text-base"
      >
        Generate Invoices
      </button>
    </div>

    <div class="hidden md:block overflow-x-auto bg-white shadow rounded">
      <table class="w-full min-w-[760px] border-collapse text-sm md:text-base">
        <thead class="bg-gray-100 text-left">
          <tr>
            <th class="p-2 md:p-3">Student</th>
            <th class="p-2 md:p-3">Grade</th>
            <th class="p-2 md:p-3">Term</th>
            <th class="p-2 md:p-3">Amount Due</th>
            <th class="p-2 md:p-3">Paid</th>
            <th class="p-2 md:p-3">Balance</th>
            <th class="p-2 md:p-3 text-green-600 font-medium">Overpayment</th>
            <th class="p-2 md:p-3">Status</th>
            <th class="p-2 md:p-3 text-right sticky right-0 bg-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in filteredInvoices" :key="invoice.id" class="border-t">
            <td class="p-2 md:p-3">{{ invoice.student_name }}</td>
            <td class="p-2 md:p-3">{{ invoice.class_level || '-' }}</td>
            <td class="p-2 md:p-3">{{ invoice.term }}</td>
            <td class="p-2 md:p-3">{{ invoice.amount_due.toFixed(2) }}</td>
            <td class="p-2 md:p-3">{{ invoice.amount_paid.toFixed(2) }}</td>
            <td class="p-2 md:p-3 font-medium">
              {{ Math.max(invoice.amount_due - invoice.amount_paid, 0).toFixed(2) }}
            </td>
            <td class="p-2 md:p-3 text-green-600 font-medium">
              {{ Math.max(invoice.amount_paid - invoice.amount_due, 0).toFixed(2) }}
            </td>
            <td class="p-2 md:p-3">
              <span
                class="px-2 py-1 rounded text-sm"
                :class="invoice.amount_paid >= invoice.amount_due ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
              >
                {{ invoice.amount_paid >= invoice.amount_due ? 'Paid' : 'Pending' }}
              </span>
            </td>
            <td class="p-2 md:p-3 text-right">
              <button
                class="text-green-600 hover:underline"
                @click="openRecordPayment(invoice.id)"
              >
                Record Payment
              </button>
            </td>
          </tr>

          <tr v-if="filteredInvoices.length === 0">
            <td colspan="9" class="p-4 text-center text-gray-500">
              No invoices found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="md:hidden flex flex-col gap-3">
      <div
        v-for="invoice in filteredInvoices"
        :key="invoice.id"
        class="bg-white shadow rounded p-3 space-y-1"
      >
        <div class="flex justify-between items-center">
          <span class="font-medium">{{ invoice.student_name }}</span>
          <span
            class="px-2 py-1 rounded text-xs"
            :class="invoice.amount_paid >= invoice.amount_due ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
          >
            {{ invoice.amount_paid >= invoice.amount_due ? 'Paid' : 'Pending' }}
          </span>
        </div>

        <div class="text-sm">Grade: {{ invoice.class_level || '-' }}</div>

        <div class="flex justify-between text-sm">
          <span>Term: {{ invoice.term }}</span>
          <span>Due: {{ invoice.amount_due.toFixed(2) }}</span>
        </div>

        <div class="flex justify-between text-sm">
          <span>Paid: {{ invoice.amount_paid.toFixed(2) }}</span>
          <span>Balance: {{ Math.max(invoice.amount_due - invoice.amount_paid, 0).toFixed(2) }}</span>
        </div>

        <div class="flex justify-between text-sm text-green-600">
          <span>Overpayment: {{ Math.max(invoice.amount_paid - invoice.amount_due, 0).toFixed(2) }}</span>
          <button
            class="bg-blue-600 text-white px-3 md:px-4 py-1 md:py-2 rounded hover:bg-blue-700 text-sm md:text-base"
            @click="openRecordPayment(invoice.id)"
          >
            Record Payment
          </button>
        </div>
      </div>
    </div>

    <RecordPayment
      v-if="showRecordPaymentModal"
      :invoice-id="selectedInvoiceId"
      @close="closeRecordPayment"
      @paymentRecorded="refreshInvoices"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getInvoices } from '../api/fee'
import { useRouter } from 'vue-router'
import RecordPayment from '../components/Invoices/RecordPayment.vue'
import { GRADES } from '../../../constants/grades'

const router = useRouter()

const invoices = ref([])
const search = ref('')
const selectedTerm = ref('')
const selectedClassLevel = ref('')
const showRecordPaymentModal = ref(false)
const selectedInvoiceId = ref(null)

const terms = ['Term 1', 'Term 2', 'Term 3']

const openRecordPayment = (invoiceId) => {
  selectedInvoiceId.value = invoiceId
  showRecordPaymentModal.value = true
}

const closeRecordPayment = () => {
  showRecordPaymentModal.value = false
  selectedInvoiceId.value = null
}

const goToCreateInvoice = () => {
  router.push({ name: 'InvoiceCreate' })
}

const refreshInvoices = async () => {
  const raw = await getInvoices()
  invoices.value = raw.map((i) => ({
    ...i,
    amount_due: Number(i.amount_due || 0),
    amount_paid: Number(i.amount_paid || 0),
    class_level: i.class_level || i.class_level_name || ''
  }))
}

onMounted(refreshInvoices)

const filteredInvoices = computed(() => {
  const q = search.value.trim().toLowerCase()

  return invoices.value.filter((i) => {
    const studentName = (i.student_name || '').toLowerCase()
    const amountDue = String(i.amount_due ?? '')
    const amountPaid = String(i.amount_paid ?? '')
    const balance = String(Math.max((i.amount_due || 0) - (i.amount_paid || 0), 0))
    const classLevel = i.class_level || ''

    const matchesSearch =
      !q ||
      studentName.includes(q) ||
      amountDue.includes(q) ||
      amountPaid.includes(q) ||
      balance.includes(q)

    const matchesClassLevel =
      !selectedClassLevel.value || classLevel === selectedClassLevel.value

    const matchesTerm =
      !selectedTerm.value || i.term === selectedTerm.value

    return matchesSearch && matchesClassLevel && matchesTerm
  })
})
</script>