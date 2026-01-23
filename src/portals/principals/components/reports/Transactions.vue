
<!--

Purpose:
This page provides school principals with a detailed view of all financial
transactions within the institution. It allows for efficient monitoring,
filtering, analysis, and reporting of payments made by students or guardians.

Key Features:
1. Filtering:
   - Users can filter transactions based on:
     • Student Name (searchable)
     • Payment Method (Cash, M-Pesa, Bank)
     • Date Range (Start Date and End Date)
   - Filters are reactive and update the displayed transactions instantly.

2. Summary / Overview:
   - Can be extended to include:
     • Total Amount collected
     • Breakdown by payment method or class
   - Summary cards automatically reflect the filtered transaction data.

3. Transaction Table / List:
   - Displays transactions in a responsive table format.
   - Columns include Date, Student Name, Class Level, Payment Method, Amount.
   - Action column includes buttons to generate an invoice for individual
     transactions.

4. Export & Print Functionality:
   - Buttons at the top allow the principal to:
     • Export the currently filtered transactions to Excel
     • Export the currently filtered transactions to PDF
     • Reset filters (View All)
   - Ensures the exported or printed report matches exactly what is displayed
     on the screen.

5. User Interaction:
   - Users can quickly search for specific transactions or filter by
     criteria without reloading the page.
   - Clicking "Generate Invoice" navigates to the invoice page for that
     transaction using Vue Router.

Data Flow / Interaction with the Program:
- The component fetches transactions from the `getTransactions()` API call on
  mount.
- Filtering is performed reactively on the frontend for speed and responsiveness.
- Computed properties are used to calculate filtered transactions and any
  aggregate totals.
- Export functionality uses `XLSX` for Excel exports and `jsPDF` with
  `autotable` for PDF exports.
- Currency formatting is handled via `Intl.NumberFormat` for consistent KES
  representation.

Usage Context:
- Intended for principals and financial administrators to monitor all
  student-related transactions.
- Designed to be intuitive and quick, allowing for easy export of reports for
  audits, meetings, or further analysis.
- Can serve as a template for other financial reporting modules, such as
  expenditures or staff payments.

-->

<template>
  <div class="w-full max-w-full overflow-x-hidden p-4 sm:p-6 bg-gray-50 min-h-screen">
 
    <div class="flex flex-wrap gap-3 mb-6">
      <button
        @click="exportPDF"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
      >
        Export PDF
      </button>

      <button
        @click="exportExcel"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
      >
        Export Excel
      </button>

      <button
        @click="printReport"
        class="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm"
      >
        Print
      </button>
    </div>

    <div class="bg-white p-4 rounded-lg shadow-md mb-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by student name..."
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
    </div>

  
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
      <div class="bg-white p-4 rounded-lg shadow text-center">
        <h3 class="text-gray-500 text-sm">Total Transactions</h3>
        <p class="text-2xl font-bold">{{ filteredTransactions.length }}</p>
      </div>

      <div class="bg-white p-4 rounded-lg shadow text-center">
        <h3 class="text-gray-500 text-sm">Total Amount</h3>
        <p class="text-2xl font-bold text-green-600">{{ totalAmount }}</p>
      </div>

      <div class="bg-white p-4 rounded-lg shadow text-center">
        <h3 class="text-gray-500 text-sm">Cash Payments</h3>
        <p class="text-2xl font-bold text-blue-600">{{ cashPayments }}</p>
      </div>
    </div>

    <div class="sm:hidden space-y-3">
      <div
        v-for="txn in filteredTransactions"
        :key="txn.id"
        class="bg-white rounded-lg shadow p-3"
      >
        <div class="font-semibold text-gray-800">
          {{ txn.full_name }}
        </div>

        <div class="text-sm text-gray-600 mt-1">
          {{ formatDate(txn.date) }} · {{ txn.class_level }}
        </div>

        <div class="mt-2 text-sm">
          Method: {{ txn.payment_method }}
        </div>

        <div class="mt-2 font-bold">
          {{ formatCurrency(txn.amount) }}
        </div>

        <button
          @click="goToInvoice(txn.id)"
          class="mt-3 bg-blue-500 text-white w-full py-1.5 rounded text-sm hover:bg-blue-600"
        >
          Generate Invoice
        </button>
      </div>

      <div
        v-if="filteredTransactions.length === 0"
        class="text-center text-gray-500 py-6"
      >
        No transactions found.
      </div>
    </div>

    
    <div
      v-if="filteredTransactions.length"
      class="hidden sm:block overflow-x-auto bg-white rounded-lg shadow"
    >
      <table id="transactionsTable" class="w-full table-auto text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="py-3 px-4 border-b text-left">Date</th>
            <th class="py-3 px-4 border-b text-left">Full Name</th>
            <th class="py-3 px-4 border-b text-left">Class</th>
            <th class="py-3 px-4 border-b text-left">Method</th>
            <th class="py-3 px-4 border-b text-left">Amount</th>
            <th class="py-3 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="txn in filteredTransactions"
            :key="txn.id"
            class="hover:bg-gray-50"
          >
            <td class="py-3 px-4 border-b whitespace-nowrap">
              {{ formatDate(txn.date) }}
            </td>

            <td class="py-3 px-4 border-b break-words">
              {{ txn.full_name }}
            </td>

            <td class="py-3 px-4 border-b whitespace-nowrap">
              {{ txn.class_level }}
            </td>

            <td class="py-3 px-4 border-b whitespace-nowrap">
              {{ txn.payment_method }}
            </td>

            <td class="py-3 px-4 border-b whitespace-nowrap">
              {{ formatCurrency(txn.amount) }}
            </td>

            <td class="py-3 px-4 border-b">
              <button
                @click="goToInvoice(txn.id)"
                class="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
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
const router = useRouter()

onMounted(fetchTransactions)

async function fetchTransactions() {
  transactions.value = await getTransactions()
}

const filteredTransactions = computed(() =>
  transactions.value.filter(txn => {
    const matchesSearch =
      txn.full_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesMethod =
      !filter.value.method || txn.payment_method === filter.value.method
    const matchesDate =
      (!dateRange.value.start || txn.date >= dateRange.value.start) &&
      (!dateRange.value.end || txn.date <= dateRange.value.end)
    return matchesSearch && matchesMethod && matchesDate
  })
)

const totalAmount = computed(() =>
  filteredTransactions.value.reduce((sum, txn) => sum + Number(txn.amount), 0)
)

const cashPayments = computed(() =>
  filteredTransactions.value.filter(txn => txn.payment_method === "Cash").length
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

function goToInvoice(id) {
  router.push({ name: "GenerateInvoice", params: { id } })
}

function exportExcel() {
  const ws = XLSX.utils.json_to_sheet(filteredTransactions.value)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Transactions")
  XLSX.writeFile(wb, "transactions.xlsx")
}

function exportPDF() {
  const doc = new jsPDF()
  doc.autoTable({
    head: [["Date", "Full Name", "Class", "Method", "Amount"]],
    body: filteredTransactions.value.map(txn => [
      formatDate(txn.date),
      txn.full_name,
      txn.class_level,
      txn.payment_method,
      formatCurrency(txn.amount),
    ]),
  })
  doc.save("transactions.pdf")
}

function printReport() {
  const content = document.getElementById("transactionsTable").outerHTML
  const win = window.open("", "", "width=900,height=600")
  win.document.write(`<html><body>${content}</body></html>`)
  win.document.close()
  win.print()
}
</script>
