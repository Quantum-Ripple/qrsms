
<template>
  <div class="min-h-screen w-full max-w-full overflow-x-hidden bg-gray-50 px-3 py-4 sm:px-6 sm:py-6">
 
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <button
        @click="exportPDF"
        class="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
      >
        Export PDF
      </button>

      <button
        @click="exportExcel"
        class="inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 sm:w-auto"
      >
        Export Excel
      </button>

      <button
        @click="printReport"
        class="inline-flex w-full items-center justify-center rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 sm:w-auto"
      >
        Print
      </button>
    </div>

    <div class="mb-6 rounded-xl bg-white p-4 shadow-md sm:p-5">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by student name..."
          class="w-full rounded border px-3 py-2.5 text-sm"
        />

        <input
          v-model="dateRange.start"
          type="date"
          class="w-full rounded border px-3 py-2.5 text-sm"
        />

        <input
          v-model="dateRange.end"
          type="date"
          class="w-full rounded border px-3 py-2.5 text-sm"
        />

        <select
          v-model="filter.method"
          class="w-full rounded border px-3 py-2.5 text-sm"
        >
          <option value="">All Methods</option>
          <option value="Cash">Cash</option>
          <option value="M-Pesa">M-Pesa</option>
          <option value="Bank">Bank</option>
        </select>
      </div>
    </div>

  
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div class="rounded-xl bg-white p-4 text-center shadow sm:p-5">
        <h3 class="text-gray-500 text-sm">Total Transactions</h3>
        <p class="text-2xl font-bold">{{ filteredTransactions.length }}</p>
      </div>

      <div class="rounded-xl bg-white p-4 text-center shadow sm:p-5">
        <h3 class="text-gray-500 text-sm">Total Amount</h3>
        <p class="text-2xl font-bold text-green-600">{{ totalAmount }}</p>
      </div>

      <div class="rounded-xl bg-white p-4 text-center shadow sm:p-5">
        <h3 class="text-gray-500 text-sm">Cash Payments</h3>
        <p class="text-2xl font-bold text-blue-600">{{ cashPayments }}</p>
      </div>
    </div>

    <div class="space-y-3 md:hidden">
      <div
        v-for="txn in filteredTransactions"
        :key="txn.id"
        class="rounded-xl bg-white p-4 shadow"
      >
        <div class="break-words text-base font-semibold text-gray-800">
          {{ txn.full_name }}
        </div>

        <div class="mt-1 text-sm text-gray-600">
          {{ formatDate(txn.date) }}
        </div>

        <div class="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
          <div class="min-w-0">
            <span class="block text-xs font-medium uppercase tracking-wide text-gray-400">Class</span>
            <span class="break-words">{{ txn.class_level }}</span>
          </div>
          <div class="min-w-0">
            <span class="block text-xs font-medium uppercase tracking-wide text-gray-400">Method</span>
            <span class="break-words">{{ txn.payment_method }}</span>
          </div>
        </div>

        <div class="mt-3 font-bold text-gray-900">
          {{ formatCurrency(txn.amount) }}
        </div>

        <button
          @click="goToInvoice(txn.id)"
          class="mt-4 w-full rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600"
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
      class="hidden min-w-0 overflow-hidden rounded-xl bg-white shadow md:block"
    >
      <div class="overflow-x-auto">
        <table id="transactionsTable" class="min-w-[860px] w-full table-auto text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="border-b px-4 py-3 text-left">Date</th>
              <th class="border-b px-4 py-3 text-left">Full Name</th>
              <th class="border-b px-4 py-3 text-left">Class</th>
              <th class="border-b px-4 py-3 text-left">Method</th>
              <th class="border-b px-4 py-3 text-left">Amount</th>
              <th class="border-b px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="txn in filteredTransactions"
              :key="txn.id"
              class="hover:bg-gray-50"
            >
              <td class="border-b px-4 py-3 align-top whitespace-nowrap">
                {{ formatDate(txn.date) }}
              </td>

              <td class="border-b px-4 py-3 align-top break-words">
                {{ txn.full_name }}
              </td>

              <td class="border-b px-4 py-3 align-top whitespace-nowrap">
                {{ txn.class_level }}
              </td>

              <td class="border-b px-4 py-3 align-top whitespace-nowrap">
                {{ txn.payment_method }}
              </td>

              <td class="border-b px-4 py-3 align-top whitespace-nowrap">
                {{ formatCurrency(txn.amount) }}
              </td>

              <td class="border-b px-4 py-3 align-top">
                <button
                  @click="goToInvoice(txn.id)"
                  class="rounded bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
                >
                  Invoice
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-else
      class="hidden rounded-xl bg-white px-4 py-10 text-center text-gray-500 shadow md:block"
    >
      No transactions found.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useQuery } from "@tanstack/vue-query"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { getTransactions } from "../../api/finance"
import { useRouter } from "vue-router"

import { useAuthStore } from "@/stores/authStore.js"


const router = useRouter()


// --------------------------------------------------
// SCHOOL
// --------------------------------------------------

const user = useAuthStore().user || {}
const school_id = user.school?.id || user.school_id


// --------------------------------------------------
// FILTERS
// --------------------------------------------------

const searchQuery = ref("")

const filter = ref({
  method: ""
})

const dateRange = ref({
  start: "",
  end: ""
})


// --------------------------------------------------
// TRANSACTIONS QUERY
// --------------------------------------------------

const {
  data: transactionsData,
  isFetching: transactionsFetching,
} = useQuery({
  queryKey: ["transactions-report", school_id],

  queryFn: async () => {
    const response = await getTransactions()

    return Array.isArray(response?.results)
      ? response.results
      : Array.isArray(response)
        ? response
        : []
  },

  // Financial data should have a shorter freshness window.
  staleTime: 10*60 * 1000,

  // Always check the server when returning to this page,
  // while keeping cached data visible.
  refetchOnMount: "always",
})


const transactions = computed(
  () => transactionsData.value || []
)


// --------------------------------------------------
// FILTERED TRANSACTIONS
// --------------------------------------------------

const filteredTransactions = computed(() =>
  transactions.value.filter(txn => {

    const matchesSearch =
      txn.full_name
        ?.toLowerCase()
        .includes(
          searchQuery.value.toLowerCase()
        )


    const matchesMethod =
      !filter.value.method ||
      txn.payment_method === filter.value.method


    const matchesDate =
      (!dateRange.value.start ||
        txn.date >= dateRange.value.start) &&

      (!dateRange.value.end ||
        txn.date <= dateRange.value.end)


    return (
      matchesSearch &&
      matchesMethod &&
      matchesDate
    )
  })
)


// --------------------------------------------------
// TOTAL AMOUNT
// --------------------------------------------------

const totalAmount = computed(() =>
  filteredTransactions.value.reduce(
    (sum, txn) =>
      sum + Number(txn.amount),
    0
  )
)


// --------------------------------------------------
// CASH PAYMENTS
// --------------------------------------------------

const cashPayments = computed(() =>
  filteredTransactions.value.filter(
    txn => txn.payment_method === "Cash"
  ).length
)


// --------------------------------------------------
// DATE FORMATTING
// --------------------------------------------------

function formatDate(dateStr) {

  return new Date(
    dateStr
  ).toLocaleDateString("en-GB")
}


// --------------------------------------------------
// CURRENCY FORMATTING
// --------------------------------------------------

function formatCurrency(value) {

  return new Intl.NumberFormat(
    "en-KE",
    {
      style: "currency",
      currency: "KES",
    }
  ).format(value)
}


// --------------------------------------------------
// INVOICE
// --------------------------------------------------

function goToInvoice(id) {

  router.push({
    name: "GenerateInvoice",
    params: { id }
  })
}


// --------------------------------------------------
// EXCEL
// --------------------------------------------------

function exportExcel() {

  const ws =
    XLSX.utils.json_to_sheet(
      filteredTransactions.value
    )

  const wb =
    XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Transactions"
  )

  XLSX.writeFile(
    wb,
    "transactions.xlsx"
  )
}


// --------------------------------------------------
// PDF
// --------------------------------------------------

function exportPDF() {

  const doc = new jsPDF()

  doc.text(
    "Transactions Reports",
    14,
    10
  )

  autoTable(doc, {

    head: [
      [
        "Date",
        "Full Name",
        "Class",
        "Method",
        "Amount"
      ]
    ],

    body:
      filteredTransactions.value.map(txn => [

        formatDate(txn.date),

        txn.full_name,

        txn.class_level,

        txn.payment_method,

        formatCurrency(txn.amount),

      ]),
  })

  doc.save(
    "transactions_reports.pdf"
  )
}


// --------------------------------------------------
// PRINT
// --------------------------------------------------

function printReport() {

  const content =
    document
      .getElementById("transactionsTable")
      .outerHTML


  const win =
    window.open(
      "",
      "",
      "width=900,height=600"
    )


  win.document.write(
    `<html><body>${content}</body></html>`
  )

  win.document.close()

  win.print()
}
</script>
