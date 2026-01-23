<template>
  <div class="w-full p-4 sm:p-6 lg:p-8 bg-gray-50">
  
    <h2 class="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
      Fee Collection Overview
    </h2>

   
    <div v-if="loading" class="text-center text-gray-500 py-8">Loading data...</div>
    <div v-else-if="error" class="text-center text-red-500 py-8">{{ error }}</div>

    
    <div v-else class="space-y-8">
     
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
        <div class="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 class="text-base sm:text-lg font-medium mb-3 text-gray-700">
            Fee Collected by Class Level
          </h3>
          <div class="flex-1 min-h-[250px] sm:min-h-[300px] md:min-h-[350px]">
            <Bar v-if="classChartData" :data="classChartData" :options="chartOptions" />
          </div>
        </div>

       
        <div class="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 class="text-base sm:text-lg font-medium mb-3 text-gray-700">
            Fee Collected by Month
          </h3>
          <div class="flex-1 min-h-[250px] sm:min-h-[300px] md:min-h-[350px]">
            <Bar v-if="monthChartData" :data="monthChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

     
      <div
        class="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto"
      >
        <h3 class="text-base sm:text-lg font-medium mb-4 text-gray-700 text-center">
          Paid vs Pending Fees
        </h3>
        <div class="min-h-[250px] sm:min-h-[300px] md:min-h-[350px]">
          <Pie v-if="pieChartData" :data="pieChartData" :options="pieOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { Bar, Pie } from "vue-chartjs"
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js"

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale)

import { getMonthlyFinanceSummary, getClasswiseFinanceSummary ,getFinanceSummary} from "../../api/finance"


const classChartData = ref(null)
const monthChartData = ref(null)
const pieChartData = ref(null)
const loading = ref(true)
const error = ref(null)


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `KSh ${value.toLocaleString()}`,
        font: { size: 10 },
      },
    },
    x: {
      ticks: { font: { size: 10 } },
    },
  },
}

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: { usePointStyle: true },
    },
  },
}


onMounted(async () => {
  try {
    const [classData, monthData, financeData] = await Promise.all([
      getClasswiseFinanceSummary(),
      getMonthlyFinanceSummary(),
      getFinanceSummary()
    ])


    classChartData.value = {
      labels: classData.map((item) => item.class_level),
      datasets: [
        {
          label: "Collected Amount (KSh)",
          data: classData.map((item) => item.collected_amount),
          backgroundColor: "rgba(37, 99, 235, 0.6)",
          borderRadius: 6,
        },
      ],
    }

    monthChartData.value = {
      labels: monthData.map((item) => item.month_name),
      datasets: [
        {
          label: "Collected Amount (KSh)",
          data: monthData.map((item) => item.collected_amount),
          backgroundColor: "rgba(234, 179, 8, 0.6)",
          borderRadius: 6,
        },
      ],
    }

    const totalPaid = financeData.fees_collected
    const totalExpected = financeData.expected_fees
    const totalPending = Math.max(totalExpected - totalPaid, 0)


    pieChartData.value = {
      labels: ["Paid Amount", "Pending Amount"],
      datasets: [
        {
          data: [totalPaid, totalPending],
          backgroundColor: ["#2563eb", "#f87171"],
          hoverOffset: 10,
        },
      ],
    }
  } catch (err) {
    console.error("Error fetching fee data:", err)
    error.value = "Failed to load fee data. Please try again later."
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
div.bg-white:hover {
  transform: translateY(-3px);
  transition: all 0.2s ease;
}
</style>
