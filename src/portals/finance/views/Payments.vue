
<template>
  <div class="p-4 sm:p-6 bg-gray-50 min-h-screen pb-24 md:pb-6">

    <!-- Filters -->
    <div class="mb-6 flex flex-col sm:flex-row sm:flex-wrap gap-3">

      <!-- Search -->
      <input
        type="text"
        placeholder="Search by name or amount"
        v-model="searchQuery"
        class="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2
               focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <!-- Grade -->
      <select
        v-model="filterGrade"
        class="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2
               bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Classes</option>

        <option
          v-for="cls in classLevels"
          :key="cls.id"
          :value="cls.name"
        >
          {{ cls.name }}
        </option>
      </select>

      <!-- Date -->
      <input
        type="date"
        v-model="filterDate"
        class="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2
               focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <!-- Payment Method -->
      <select
        v-model="filterMethod"
        class="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2
               bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Methods</option>

        <option
          v-for="method in PAYMENTS"
          :key="method.value"
          :value="method.value"
        >
          {{ method.label }}
        </option>
      </select>

    </div>


    <!-- ========================= -->
    <!-- DESKTOP TABLE              -->
    <!-- ========================= -->

    <div class="hidden sm:block overflow-x-auto bg-white rounded-lg shadow-md">

      <table class="w-full text-left border-collapse min-w-[800px]">

        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-3 text-gray-700 font-medium border-b">
              Student
            </th>

            <th class="px-4 py-3 text-gray-700 font-medium border-b">
              Grade
            </th>

            <th class="px-4 py-3 text-gray-700 font-medium border-b">
              Amount
            </th>

            <th class="px-4 py-3 text-gray-700 font-medium border-b">
              Payment Method
            </th>

            <th class="px-4 py-3 text-gray-700 font-medium border-b">
              Date
            </th>

            <th class="px-4 py-3 text-gray-700 font-medium border-b">
              Transaction Code
            </th>

            <th class="px-4 py-3 text-gray-700 font-medium border-b text-center">
              Download
            </th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="payment in filteredPayments"
            :key="payment.id"
            class="border-b hover:bg-gray-50 transition"
          >

            <td class="px-4 py-3">
              {{ payment.full_name }}
            </td>

            <td class="px-4 py-3">
              {{ payment.class_level }}
            </td>

            <td class="px-4 py-3">
              {{ payment.amount }}
            </td>

            <td class="px-4 py-3">
              {{ payment.payment_method }}
            </td>

            <td class="px-4 py-3">
              {{ payment.date }}
            </td>

            <td class="px-4 py-3">
              {{ payment.transaction_code || '-' }}
            </td>

            <td class="px-4 py-3 text-center">
              <button
                @click="downloadPayment(payment.id)"
                class="bg-green-500 hover:bg-green-600 text-white
                       text-sm px-3 py-1.5 rounded transition"
              >
                Download Receipt
              </button>
            </td>

          </tr>

          <tr
            v-if="!loading && filteredPayments.length === 0"
          >
            <td
              colspan="7"
              class="px-4 py-8 text-center text-gray-500"
            >
              No payments found.
            </td>
          </tr>

        </tbody>

      </table>

    </div>


    <!-- ========================= -->
    <!-- MOBILE PAYMENT CARDS       -->
    <!-- ========================= -->

    <div class="sm:hidden space-y-4">

      <div
        v-for="payment in filteredPayments"
        :key="payment.id"
        class="bg-white rounded-lg shadow border p-4"
      >

        <!-- Student + Amount -->
        <div class="flex justify-between items-start gap-3">

          <div>
            <h3 class="font-semibold text-gray-800">
              {{ payment.full_name }}
            </h3>

            <p class="text-sm text-gray-500 mt-0.5">
              {{ payment.class_level }}
            </p>
          </div>

          <span class="font-semibold text-gray-800 whitespace-nowrap">
            {{ payment.amount }}
          </span>

        </div>


        <!-- Payment Details -->
        <div class="mt-3 text-sm text-gray-600 space-y-1">

          <p>
            <strong>Method:</strong>
            {{ payment.payment_method }}
          </p>

          <p>
            <strong>Date:</strong>
            {{ payment.date }}
          </p>

          <p>
            <strong>Transaction:</strong>
            {{ payment.transaction_code || '-' }}
          </p>

        </div>


        <!-- Receipt -->
        <button
          @click="downloadPayment(payment.id)"
          class="mt-4 w-full bg-green-500 hover:bg-green-600
                 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          Download Receipt
        </button>

      </div>


      <!-- Empty State -->
      <div
        v-if="!loading && filteredPayments.length === 0"
        class="text-center text-gray-500 py-8"
      >
        No payments found.
      </div>

    </div>


    <!-- Loading -->
    <div
      v-if="loading"
      class="text-center mt-6 text-gray-500"
    >
      Loading payments...
    </div>

  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getPayments } from '../api/fee.js'

import { PAYMENTS } from '../../../constants/payment.js'
import { getClassLevels } from '@/api/classes'

const classLevels = ref([])

const loadClassLevels = async () => {
  try {
    const data = await getClassLevels()

    console.log("Class Levels:", data)
    console.log("Is Array?", Array.isArray(data))

    classLevels.value = data
  } catch (err) {
    console.error("Failed to load class levels:", err)
  }
}

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

  const value = method
    .toString()
    .trim()
    .toLowerCase()

  if (value === 'm-pesa' || value === 'mpesa') return 'mpesa'
  if (value === 'cash') return 'cash'
  if (value === 'bank transfer' || value === 'bank') return 'bank'
  if (value === 'cheque') return 'cheque'

  return value
}


const filteredPayments = computed(() => {
  return payments.value.filter((p) => {

    const fullName = (p.full_name || '').toLowerCase()

    const amount =
      p.amount != null
        ? p.amount.toString()
        : ''

    const classLevel =
      p.class_level || ''

    const paymentMethod =
      normalizeMethod(p.payment_method)


    const matchesSearch =
      !searchQuery.value ||
      fullName.includes(searchQuery.value.toLowerCase()) ||
      amount.includes(searchQuery.value)


    const matchesGrade =
      !filterGrade.value ||
      classLevel === filterGrade.value


    const matchesDate =
      !filterDate.value ||
      p.date === filterDate.value


    const matchesMethod =
      !filterMethod.value ||
      paymentMethod === filterMethod.value


    return (
      matchesSearch &&
      matchesGrade &&
      matchesDate &&
      matchesMethod
    )
  })
})


const downloadPayment = (id) => {
  router.push({
    name: 'PaymentDetails',
    params: { id }
  })
}


onMounted(async () => {
  await loadClassLevels()
  await fetchPayments()
})
</script>
