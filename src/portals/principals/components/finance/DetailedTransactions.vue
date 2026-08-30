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
        <option value="Mpesa">M-Pesa</option>
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
            <!--<th class="border px-3 py-2 text-left">Actions</th>-->
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

            <!--<td class="border px-3 py-2">
              <button
                @click="goToInvoice(txn.id)"
                class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
              >
                Invoice
              </button>
            </td>-->
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
import autoTable from "jspdf-autotable"
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
  router.push({ name: "PrincipalGenerateInvoice", params: { id } })
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

/*
|--------------------------------------------------------------------------
| PDF REPORT — same visual language as the receipts (navy accent, muted
| gray labels, light zebra striping) so everything the school prints
| feels like one product.
|--------------------------------------------------------------------------
*/

const REPORT_COLORS = {
  accent: [23, 52, 88],
  ink: [30, 32, 36],
  muted: [120, 122, 128],
  panel: [246, 247, 249],
  line: [223, 225, 229],
}

function activeFilterSummary() {
  const parts = []
  if (searchQuery.value) parts.push(`Name contains "${searchQuery.value}"`)
  if (filter.value.method) parts.push(`Method: ${filter.value.method}`)
  if (dateRange.value.start || dateRange.value.end) {
    parts.push(
      `Date: ${dateRange.value.start || "—"} to ${dateRange.value.end || "—"}`
    )
  }
  return parts.join("   •   ")
}

function exportToPDF() {
  const rows = filteredTransactions.value
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14

  doc.setProperties({ title: "Transaction Report", subject: "Detailed Transactions" })

  // Title + generated timestamp
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(...REPORT_COLORS.accent)
  doc.text("Transaction Report", margin, 16)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(...REPORT_COLORS.muted)
  doc.text(
    `Generated ${new Date().toLocaleString("en-GB")}`,
    pageWidth - margin,
    16,
    { align: "right" }
  )

  // Applied filters, only shown when something is actually active
  let subY = 22
  const filterSummary = activeFilterSummary()
  if (filterSummary) {
    doc.setFontSize(8.5)
    doc.text(`Filters — ${filterSummary}`, margin, subY)
    subY += 5
  }

  doc.setDrawColor(...REPORT_COLORS.accent)
  doc.setLineWidth(0.6)
  doc.line(margin, subY, pageWidth - margin, subY)

  autoTable(doc, {
    startY: subY + 5,
    margin: { left: margin, right: margin },
    head: [["Date", "Full Name", "Class Level", "Payment Method", "Amount"]],
    body: rows.map((txn) => [
      formatDate(txn.date),
      txn.full_name,
      txn.class_level || "—",
      txn.payment_method,
      formatCurrency(txn.amount),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: REPORT_COLORS.ink,
      lineColor: REPORT_COLORS.line,
      lineWidth: 0.2,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: REPORT_COLORS.accent,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: REPORT_COLORS.panel,
    },
    columnStyles: {
      4: { halign: "right", fontStyle: "bold" },
    },
  })

  // Summary line — total + count, placed under the table
  let summaryY = doc.lastAutoTable.finalY + 10
  if (summaryY > pageHeight - 20) {
    doc.addPage()
    summaryY = margin + 6
  }

  const total = rows.reduce((sum, t) => sum + Number(t.amount || 0), 0)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...REPORT_COLORS.muted)
  doc.text(
    `${rows.length} transaction${rows.length === 1 ? "" : "s"}`,
    margin,
    summaryY
  )

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(...REPORT_COLORS.ink)
  doc.text(`Total: ${formatCurrency(total)}`, pageWidth - margin, summaryY, {
    align: "right",
  })

  // Page numbers on every page, added last so the count is accurate
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.setTextColor(...REPORT_COLORS.muted)
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" }
    )
  }

  doc.save("transactions.pdf")
}
</script>

<style scoped>
button {
  transition: all 0.2s ease;
}
</style>