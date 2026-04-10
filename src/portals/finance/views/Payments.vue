<template>
  <div class="p-6">
    <div class="flex flex-wrap gap-4 mb-4">
      <input
        type="text"
        placeholder="Search by name or amount"
        v-model="searchQuery"
        class="border rounded px-3 py-2 w-64"
      />

      <select v-model="filterGrade" class="border rounded px-3 py-2">
        <option value="">All Classes</option>
        <option v-for="c in GRADES" :key="c.value" :value="c.value">
          {{ c.label }}
        </option>
      </select>

      <input
        type="date"
        v-model="filterDate"
        class="border rounded px-3 py-2"
      />

      <select v-model="filterMethod" class="border rounded px-3 py-2">
        <option value="">All Methods</option>
        <option v-for="method in PAYMENTS" :key="method.value" :value="method.value">
          {{ method.label }}
        </option>
      </select>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 text-left">Student</th>
            <th class="px-4 py-2 text-left">Grade</th>
            <th class="px-4 py-2 text-left">Amount</th>
            <th class="px-4 py-2 text-left">Payment Method</th>
            <th class="px-4 py-2 text-left">Date</th>
            <th class="px-4 py-2 text-left">Transaction Code</th>
            <th class="px-4 py-2">Download</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="payment in filteredPayments"
            :key="payment.id"
            class="border-t hover:bg-gray-50"
          >
            <td class="px-4 py-2">{{ payment.full_name }}</td>
            <td class="px-4 py-2">{{ payment.class_level }}</td>
            <td class="px-4 py-2">{{ payment.amount }}</td>
            <td class="px-4 py-2">{{ payment.payment_method }}</td>
            <td class="px-4 py-2">{{ payment.date }}</td>
            <td class="px-4 py-2">{{ payment.transaction_code || '-' }}</td>
            <td class="px-4 py-2">
              <button
                @click="downloadPayment(payment.id)"
                class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Download Receipt
              </button>
            </td>
          </tr>

          <tr v-if="!loading && filteredPayments.length === 0">
            <td colspan="7" class="px-4 py-4 text-center text-gray-500">
              No payments found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="loading" class="text-center mt-4">Loading payments...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getPayments } from '../api/fee.js'
import { GRADES } from '../../../constants/grades'
import { PAYMENTS } from '../../../constants/payment.js'

const router = useRouter()

const payments = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterGrade = ref('')
const filterDate = ref('')
const filterMethod = ref('')

const fetchPayments = async () => {
  loading.value = true
  try {
    payments.value = await getPayments()
  } catch (error) {
    console.error('Error fetching payments:', error)
  } finally {
    loading.value = false
  }
}

const normalizeMethod = (method) => {
  if (!method) return ''

  const value = method.toString().trim().toLowerCase()

  if (value === 'm-pesa' || value === 'mpesa') return 'mpesa'
  if (value === 'cash') return 'cash'
  if (value === 'bank transfer' || value === 'bank') return 'bank'
  if (value === 'cheque') return 'cheque'

  return value
}

const filteredPayments = computed(() => {
  return payments.value.filter((p) => {
    const fullName = (p.full_name || '').toLowerCase()
    const amount = p.amount != null ? p.amount.toString() : ''
    const classLevel = p.class_level || ''
    const paymentMethod = normalizeMethod(p.payment_method)

    const matchesSearch =
      !searchQuery.value ||
      fullName.includes(searchQuery.value.toLowerCase()) ||
      amount.includes(searchQuery.value)

    const matchesGrade =
      !filterGrade.value || classLevel === filterGrade.value

    const matchesDate =
      !filterDate.value || p.date === filterDate.value

    const matchesMethod =
      !filterMethod.value || paymentMethod === filterMethod.value

    return matchesSearch && matchesGrade && matchesDate && matchesMethod
  })
})

const downloadPayment = (id) => {
  router.push({ name: 'PaymentDetails', params: { id } })
}

onMounted(fetchPayments)
</script>

<style scoped>
table td,
table th {
  height: 48px;
}
</style>