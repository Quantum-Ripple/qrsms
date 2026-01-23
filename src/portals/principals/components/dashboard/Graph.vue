<template>
  <div class="p-6 bg-gray-50 rounded-xl space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">Analytics Overview</h2>
      <p class="text-sm text-gray-500">Current Academic Year: 2025</p>
    </div>

    <!-- Graph Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Bar Graph: Students per Class Level -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-3 text-gray-700">Students per Class</h3>
        <div class="h-56">
          <canvas ref="studentsByClassCanvas"></canvas>
        </div>
      </div>

      <!-- Line Graph: Amount Collected vs Month -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-3 text-gray-700">Amount Collected (KES)</h3>
        <div class="h-56">
          <canvas ref="amountCollectedCanvas"></canvas>
        </div>
      </div>

      <!-- Pie Chart: Paid vs Pending -->
      <div class="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <h3 class="text-lg font-semibold mb-3 text-gray-700">Fee Status</h3>
        <div class="max-w-[220px] max-h-[220px]">
          <canvas ref="feeStatusCanvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// import your API helpers
import {
  fetchSchoolStatistics,
  getMonthlyFinanceSummary,
  getFinanceSummary
} from '../../api/Dashboard'

// Register Chart.js components + Filler (required for `fill: true`)
Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

// Canvas refs
const studentsByClassCanvas = ref(null)
const amountCollectedCanvas = ref(null)
const feeStatusCanvas = ref(null)

// Keep chart instances to destroy later
let studentsByClassChart = null
let amountCollectedChart = null
let feeStatusChart = null

// Fallback / default data (used if API doesn't provide it)
const defaultClassLevels = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'
]
const defaultStudentsPerClass = [40, 35, 50, 45, 55, 48, 52, 47, 43]

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Read user -> school id
const user = JSON.parse(localStorage.getItem("user") || "{}")
const school_id = user.school_id || ""

// Helper: safely destroy charts
function destroyCharts() {
  if (studentsByClassChart) { studentsByClassChart.destroy(); studentsByClassChart = null }
  if (amountCollectedChart) { amountCollectedChart.destroy(); amountCollectedChart = null }
  if (feeStatusChart) { feeStatusChart.destroy(); feeStatusChart = null }
}

onUnmounted(() => {
  destroyCharts()
})

onMounted(async () => {
  // destroy any existing charts (hot-reload / remount safety)
  destroyCharts()

  try {
    // fetch required data in parallel
    const [stats, financeSummary, monthly] = await Promise.all([
      fetchSchoolStatistics(school_id || 1),
      getFinanceSummary(),
      getMonthlyFinanceSummary()
    ])

    // -------- Students per class ----------
    let classLabels = []
    let classData = []

    if (Array.isArray(stats.students_per_class_level) && stats.students_per_class_level.length > 0) {
      classLabels = stats.students_per_class_level.map(it => it.class_level_name || 'Unnamed')
      classData = stats.students_per_class_level.map(it => Number(it.student_count || 0))
    } else {
      // fallback to defaults
      classLabels = defaultClassLevels
      classData = defaultStudentsPerClass
    }

    // create Bar chart
    studentsByClassChart = new Chart(studentsByClassCanvas.value, {
      type: 'bar',
      data: {
        labels: classLabels,
        datasets: [
          {
            label: 'Number of Students',
            data: classData,
            backgroundColor: '#3b82f6',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: '#4b5563' } },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 10, color: '#4b5563' },
            grid: { color: '#e5e7eb' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    })

    // -------- Amounts by month (line) ----------
    // ensure monthly is an array like [{month:10, month_name:'Oct', collected_amount:70000}, ...]
    const monthlyAmounts = new Array(12).fill(0)
    if (Array.isArray(monthly)) {
      monthly.forEach(item => {
        // prefer numeric month if provided (1-12)
        const mNum = Number(item.month)
        if (!Number.isNaN(mNum) && mNum >= 1 && mNum <= 12) {
          monthlyAmounts[mNum - 1] = Number(item.collected_amount || 0)
        } else if (item.month_name) {
          const idx = monthNames.indexOf(item.month_name)
          if (idx >= 0) monthlyAmounts[idx] = Number(item.collected_amount || 0)
        }
      })
    }

    amountCollectedChart = new Chart(amountCollectedCanvas.value, {
      type: 'line',
      data: {
        labels: monthNames,
        datasets: [
          {
            label: 'Amount Collected (KES)',
            data: monthlyAmounts,
            fill: true,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.15)',
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
          x: { ticks: { color: '#4b5563' } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    })

    // -------- Fee status pie (Paid vs Pending) ----------
    // Determine paid vs pending from financeSummary
    const feesCollected = Number(financeSummary?.fees_collected ?? 0)
    const expectedFees = Number(financeSummary?.expected_fees ?? 0)
    const outstanding = Number(financeSummary?.outstanding_balances ?? 0)

    // Conservative pending computation:
    // - expectedFees - feesCollected is the simplest pending estimate
    // - outstanding balances may be negative in your API response; use its absolute value as another estimate
    // Choose the max of these and 0 to avoid negative pending.
    const pendingEstimate = Math.max(expectedFees - feesCollected, Math.abs(outstanding), 0)

    const feeData = {
      labels: ['Paid', 'Pending'],
      datasets: [
        {
          data: [feesCollected, pendingEstimate],
          backgroundColor: ['#16a34a', '#ef4444'],
          hoverBackgroundColor: ['#22c55e', '#f87171']
        }
      ]
    }

    feeStatusChart = new Chart(feeStatusCanvas.value, {
      type: 'pie',
      data: feeData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#374151' } }
        }
      }
    })

  } catch (err) {
    // Log and leave the fallback charts (or none) visible
    console.error('Error initializing charts:', err)
  }
})
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
