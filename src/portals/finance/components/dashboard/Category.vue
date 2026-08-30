<template>
  <div class="w-full max-w-full min-w-0 overflow-hidden p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">

    <!-- Fees Collected by Month -->
    <div class="w-full max-w-full min-w-0 bg-white p-3 sm:p-5 md:p-6 rounded-xl shadow-lg overflow-hidden">
      <p class="text-gray-500 font-medium text-sm sm:text-base mb-3">
        Fees Collected by Month
      </p>

      <div class="w-full max-w-full min-w-0 overflow-hidden">
        <apexchart
          v-if="monthChartData.series.length"
          type="bar"
          height="300"
          width="100%"
          :options="monthChartData.options"
          :series="monthChartData.series"
        />

        <p
          v-else
          class="text-gray-400 text-center py-16 sm:py-20"
        >
          No data available
        </p>
      </div>
    </div>


    <!-- Fees Collected by Class -->
    <div class="w-full max-w-full min-w-0 bg-white p-3 sm:p-5 md:p-6 rounded-xl shadow-lg overflow-hidden">
      <p class="text-gray-500 font-medium text-sm sm:text-base mb-3">
        Fees Collected by Class
      </p>

      <div class="w-full max-w-full min-w-0 overflow-hidden">
        <apexchart
          v-if="classChartData.series.length"
          type="pie"
          height="300"
          width="100%"
          :options="classChartData.options"
          :series="classChartData.series"
        />

        <p
          v-else
          class="text-gray-400 text-center py-16 sm:py-20"
        >
          No data available
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import ApexCharts from 'apexcharts'
import VueApexCharts from 'vue3-apexcharts'
import { feeByMonth, feeByClass } from '../../api/dashboard'

const props = defineProps({
  termId: {
    type: [String, Number],
    default: '',
  },
})

const monthChartData = ref({
  series: [],
  options: {
    chart: {
      id: 'fees-by-month',
      width: '100%',
    },
    xaxis: {
      categories: [],
    },
    colors: ['#34D399'],
    dataLabels: {
      enabled: true,
      formatter: (val) => `Ksh. ${val.toLocaleString()}`
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 280,
          },
          dataLabels: {
            enabled: false,
          },
          xaxis: {
            labels: {
              rotate: -45,
              hideOverlappingLabels: true,
            },
          },
        },
      },
    ],
  }
})

const classChartData = ref({
  series: [],
  options: {
    chart: {
      id: 'fees-by-class',
      width: '100%',
    },
    labels: [],
    colors: ['#3B82F6', '#FBBF24', '#EF4444', '#8B5CF6', '#10B981'],
    legend: {
      position: 'bottom',
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 280,
          },
          legend: {
            position: 'bottom',
            fontSize: '12px',
            itemMargin: {
              horizontal: 5,
              vertical: 2,
            },
          },
        },
      },
    ],
  }
})

const fetchCharts = async () => {
  try {
    const monthData = await feeByMonth(props.termId || undefined)

    if (monthData && monthData.length) {
      monthChartData.value.series = [
        {
          name: 'Fees Collected',
          data: monthData.map(d => d.collected_amount)
        }
      ]

      monthChartData.value.options = {
        ...monthChartData.value.options,
        xaxis: {
          categories: monthData.map(d => d.month_name),
        },
      }
    } else {
      monthChartData.value.series = []
    }

    const classData = await feeByClass(props.termId || undefined)

    if (classData && classData.length) {
      classChartData.value.series = classData.map(d => d.collected_amount)

      classChartData.value.options = {
        ...classChartData.value.options,
        labels: classData.map(d => d.class_level),
      }
    } else {
      classChartData.value.series = []
    }
  } catch (error) {
    console.error('Error fetching category charts:', error)
  }
}

watch(() => props.termId, (newTermId) => {
  if (newTermId) {
    fetchCharts()
  }
})

onMounted(() => {
  fetchCharts()
})
</script>

<script>
export default {
  components: { apexchart: VueApexCharts }
}
</script>

<style scoped>
:deep(.apexcharts-canvas),
:deep(.apexcharts-svg) {
  max-width: 100% !important;
}

:deep(.apexcharts-canvas) {
  overflow: hidden !important;
}
</style>