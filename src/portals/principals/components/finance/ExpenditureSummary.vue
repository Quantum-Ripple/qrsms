
<template>
  <div
    class="w-full max-w-full overflow-x-hidden bg-white rounded-lg shadow p-4 sm:p-6"
  >
   
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"
    >
      <h2 class="text-lg sm:text-xl md:text-2xl font-semibold">
        Expenditure Summary
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
        placeholder="Search description or category..."
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
        v-model="filter.category"
        class="border rounded px-3 py-2 text-sm w-full"
      >
        <option value="">All Categories</option>
        <option value="Utilities">Utilities</option>
        <option value="Salaries">Salaries</option>
        <option value="Maintenance">Maintenance</option>
        <option value="Supplies">Supplies</option>
        <option value="Miscellaneous">Miscellaneous</option>
      </select>
    </div>

    <div v-if="loading" class="text-center py-6 text-gray-500">
      Loading data...
    </div>

    <div v-else-if="error" class="text-center py-6 text-red-500">
      {{ error }}
    </div>

    <div v-else class="sm:hidden space-y-3">
      <div
        v-for="exp in filteredExpenditures"
        :key="exp.id"
        class="border rounded-md p-3"
      >
        <div class="font-semibold text-gray-800">
          {{ exp.expense_category }}
        </div>

        <div class="text-sm text-gray-600 mt-1">
          {{ formatDate(exp.date) }}
        </div>

        <div class="mt-2 text-sm">
          {{ exp.description }}
        </div>

        <div class="mt-2 font-bold text-gray-900">
          {{ formatCurrency(exp.amount) }}
        </div>

        <div class="mt-1 text-sm text-gray-600">
          Approved by: {{ exp.approved_by || "N/A" }}
        </div>
      </div>
    </div>


    <div
      v-if="filteredExpenditures.length"
      class="hidden sm:block overflow-x-auto border rounded-md"
    >
      <table class="w-full table-auto text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-3 py-2 text-left">Date</th>
            <th class="border px-3 py-2 text-left">Category</th>
            <th class="border px-3 py-2 text-left hidden md:table-cell">
              Description
            </th>
            <th class="border px-3 py-2 text-left">Amount</th>
            <th class="border px-3 py-2 text-left hidden md:table-cell">
              Approved By
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="exp in filteredExpenditures"
            :key="exp.id"
            class="hover:bg-gray-50"
          >
            <td class="border px-3 py-2 whitespace-nowrap">
              {{ formatDate(exp.date) }}
            </td>

            <td class="border px-3 py-2 whitespace-nowrap">
              {{ exp.expense_category }}
            </td>

            <td
              class="border px-3 py-2 break-words hidden md:table-cell"
            >
              {{ exp.description }}
            </td>

            <td class="border px-3 py-2 whitespace-nowrap">
              {{ formatCurrency(exp.amount) }}
            </td>

            <td
              class="border px-3 py-2 hidden md:table-cell whitespace-nowrap"
            >
              {{ exp.approved_by || "N/A" }}
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
import { getExpenditures } from "../../api/finance"

const expenditures = ref([])
const searchQuery = ref("")
const filter = ref({ category: "" })
const dateRange = ref({ start: "", end: "" })
const loading = ref(false)
const error = ref(null)

async function fetchExpenditures() {
  loading.value = true
  try {
    expenditures.value = await getExpenditures()
  } catch {
    error.value = "Failed to load expenditure data."
  } finally {
    loading.value = false
  }
}

onMounted(fetchExpenditures)

const filteredExpenditures = computed(() =>
  expenditures.value.filter((exp) => {
    const matchesSearch =
      exp.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      exp.expense_category
        ?.toLowerCase()
        .includes(searchQuery.value.toLowerCase())

    const matchesCategory =
      !filter.value.category ||
      exp.expense_category === filter.value.category

    const matchesDate =
      (!dateRange.value.start || exp.date >= dateRange.value.start) &&
      (!dateRange.value.end || exp.date <= dateRange.value.end)

    return matchesSearch && matchesCategory && matchesDate
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
  filter.value.category = ""
  dateRange.value = { start: "", end: "" }
}

function exportToExcel() {
  const ws = XLSX.utils.json_to_sheet(filteredExpenditures.value)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Expenditure Summary")
  XLSX.writeFile(wb, "expenditure_summary.xlsx")
}

function exportToPDF() {
  const doc = new jsPDF()
  doc.text("Expenditure Summary", 14, 10)
  doc.autoTable({
    head: [["Date", "Category", "Description", "Amount", "Approved By"]],
    body: filteredExpenditures.value.map((exp) => [
      formatDate(exp.date),
      exp.expense_category,
      exp.description,
      formatCurrency(exp.amount),
      exp.approved_by || "N/A",
    ]),
  })
  doc.save("expenditure_summary.pdf")
}
</script>

<style scoped>
button {
  transition: all 0.2s ease;
}
</style>
