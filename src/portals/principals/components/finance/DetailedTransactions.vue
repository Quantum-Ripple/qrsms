<template>
  <div
    class="w-full max-w-full overflow-x-hidden bg-white rounded-lg shadow p-4 sm:p-6"
  >
    
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"
    >
      <h2 class="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
        Detailed Transactions
      </h2>

      <div class="flex flex-wrap gap-2">
        <button
          @click="viewAll"
          class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
        >
          View All
        </button>
        <button
          @click="exportToExcel"
          class="bg-green-500 text-white hover:bg-green-600 px-3 py-1 rounded text-sm"
        >
          Export Excel
        </button>
        <button
          @click="exportToPDF"
          class="bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded text-sm"
        >
          Export PDF
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name..."
        class="border rounded px-3 py-2 text-sm w-full"
      />

      <input
        v-model="dateRange.start"
        type="date"
        class="border rounded px-3 py-2 text-sm w-full"
      />

      <input
        v-model="dateRange.end"
        type="date"
        class="border rounded px-3 py-2 text-sm w-full"
      />

      <select
        v-model="filter.method"
        class="border rounded px-3 py-2 text-sm w-full"
      >
        <option value="">All Methods</option>
        <option value="Cash">Cash</option>
        <option value="M-Pesa">M-Pesa</option>
        <option value="Bank">Bank</option>
      </select>
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-6">
      Loading transactions...
    </div>

    <div v-else-if="error" class="text-center text-red-500 py-6">
      {{ error }}
    </div>

    <div v-else class="sm:hidden space-y-3">
      <div
        v-for="txn in filteredTransactions"
        :key="txn.id"
        class="border rounded-md p-3"
      >
        <div class="font-semibold text-gray-800">
          {{ txn.full_name }}
        </div>

        <div class="text-sm text-gray-600 mt-1">
          {{ formatDate(txn.date) }} · {{ txn.payment_method }}
        </div>

        <div class="mt-2 font-bold text-gray-900">
          {{ formatCurrency(txn.amount) }}
        </div>

        <button
          @click="goToInvoice(txn.id)"
          class="mt-3 bg-blue-500 text-white w-full py-1.5 rounded hover:bg-blue-600 text-sm"
        >
          Generate Invoice
        </button>
      </div>
    </div>

    
    <div
      v-if="filteredTransactions.length"
      class="hidden sm:block overflow-x-auto border rounded-md"
    >
      <table class="w-full table-auto text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-3 py-2 text-left">Date</th>
            <th class="border px-3 py-2 text-left">Full Name</th>
            <th class="border px-3 py-2 text-left hidden md:table-cell">
              Class Level
            </th>
            <th class="border px-3 py-2 text-left">
              Payment Method
            </th>
            <th class="border px-3 py-2 text-left">Amount</th>
            <th class="border px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="txn in filteredTransactions"
            :key="txn.id"
            class="hover:bg-gray-50"
          >
            <td class="border px-3 py-2 whitespace-nowrap">
              {{ formatDate(txn.date) }}
            </td>

            <td class="border px-3 py-2 break-words">
              {{ txn.full_name }}
            </td>

            <td
              class="border px-3 py-2 hidden md:table-cell whitespace-nowrap"
            >
              {{ txn.class_level }}
            </td>

            <td class="border px-3 py-2 whitespace-nowrap">
              {{ txn.payment_method }}
            </td>

            <td class="border px-3 py-2 whitespace-nowrap">
              {{ formatCurrency(txn.amount) }}
            </td>

            <td class="border px-3 py-2">
              <button
                @click="goToInvoice(txn.id)"
                class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
              >
                Invoice
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { getTransactions } from "../../api/finance"
import { useRouter } from "vue-router"

const transactions = ref([])
const searchQuery = ref("")
const filter = ref({ method: "" })
const dateRange = ref({ start: "", end: "" })
const loading = ref(false)
const error = ref(null)
const router = useRouter()

function goToInvoice(id) {
  router.push({ name: "GenerateInvoice", params: { id } })
}

async function fetchPayments() {
  loading.value = true
  try {
    transactions.value = await getTransactions()
  } catch {
    error.value = "Failed to load transactions."
  } finally {
    loading.value = false
  }
}

onMounted(fetchPayments)

const filteredTransactions = computed(() =>
  transactions.value.filter((txn) => {
    const matchesSearch = txn.full_name
      ?.toLowerCase()
      .includes(searchQuery.value.toLowerCase())
    const matchesMethod =
      !filter.value.method || txn.payment_method === filter.value.method
    const matchesDate =
      (!dateRange.value.start || txn.date >= dateRange.value.start) &&
      (!dateRange.value.end || txn.date <= dateRange.value.end)

    return matchesSearch && matchesMethod && matchesDate
  })
)

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB")
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(value)
}

function viewAll() {
  searchQuery.value = ""
  filter.value.method = ""
  dateRange.value = { start: "", end: "" }
}

function exportToExcel() {
  const ws = XLSX.utils.json_to_sheet(filteredTransactions.value)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Transactions")
  XLSX.writeFile(wb, "transactions.xlsx")
}

function exportToPDF() {
  const doc = new jsPDF()
  doc.text("Detailed Transactions", 14, 10)
  doc.autoTable({
    head: [["Date", "Full Name", "Class Level", "Method", "Amount"]],
    body: filteredTransactions.value.map((txn) => [
      formatDate(txn.date),
      txn.full_name,
      txn.class_level,
      txn.payment_method,
      formatCurrency(txn.amount),
    ]),
  })
  doc.save("transactions.pdf")
}
</script>

<style scoped>
button {
  transition: all 0.2s ease;
}
</style>
