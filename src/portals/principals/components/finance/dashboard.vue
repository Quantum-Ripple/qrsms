<template>
  <div class="w-full p-4 sm:p-6 lg:p-8">

    <h2 class="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
      Finance Dashboard
    </h2>


    <div v-if="loading" class="text-center text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>

 
    <div
      v-else
      class="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      <div
        v-for="(card, index) in cards"
        :key="card.title"
        :class="[
          'p-4 sm:p-5 rounded-xl shadow-md text-white transition-transform transform hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[120px]',
          gradientClasses[index % gradientClasses.length],
        ]"
      >
        <div class="flex justify-between items-center">
          <h3 class="text-xs sm:text-sm font-medium uppercase tracking-wide opacity-90">
            {{ card.title }}
          </h3>
          <span class="text-xl sm:text-2xl opacity-90">
            <i :class="card.icon"></i>
          </span>
        </div>

        <p class="text-lg sm:text-2xl font-semibold mt-3 sm:mt-4">
          {{ formatCurrency(card.value) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { getFinanceSummary } from "../../api/finance"

const financeData = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const data = await getFinanceSummary()
    financeData.value = data
  } catch (err) {
    error.value = err.message || "Failed to load finance data."
  } finally {
    loading.value = false
  }
})

const cards = computed(() => {
  if (!financeData.value) return []
  return [
    { title: "Fees Collected", value: financeData.value.fees_collected, icon: "fa-solid fa-sack-dollar" },
    { title: "Outstanding Balances", value: financeData.value.outstanding_balances, icon: "fa-solid fa-hand-holding-dollar" },
    { title: "Expected Fees", value: financeData.value.expected_fees, icon: "fa-solid fa-school" },
    { title: "Expenditures", value: financeData.value.expenditure, icon: "fa-solid fa-wallet" },
    { title: "Net Balance", value: financeData.value.net_balance, icon: "fa-solid fa-scale-balanced" },
  ]
})

const gradientClasses = [
  "bg-gradient-to-r from-blue-500 to-indigo-600",
  "bg-gradient-to-r from-green-500 to-emerald-600",
  "bg-gradient-to-r from-yellow-500 to-amber-600",
  "bg-gradient-to-r from-red-500 to-rose-600",
  "bg-gradient-to-r from-purple-500 to-violet-600",
]

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>

<style scoped>
div[class*="bg-gradient-to-r"]:hover {
  transition: all 0.25s ease-in-out;
}
</style>
