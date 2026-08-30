<template>
  <div class="w-full max-w-full min-w-0 overflow-hidden p-3 sm:p-4 md:p-6 bg-gray-50 rounded-lg shadow-sm">

    <!-- School Fees -->
    <section class="w-full max-w-full min-w-0 mb-6 sm:mb-8">
      <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
        School Fees
      </h2>

      <div class="w-full max-w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">

        <!-- Collected -->
        <div
          class="w-full min-w-0 max-w-full bg-green-100 p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition"
        >
          <p class="text-green-800 font-medium text-xs sm:text-sm mb-1 sm:mb-2">
            Collected
          </p>

          <p class="text-lg xs:text-xl sm:text-2xl font-bold text-green-900 break-all leading-tight">
            Ksh. {{ formatAmount(overviewData.school_fees_collected) }}
          </p>
        </div>

        <!-- Expected -->
        <div
          class="w-full min-w-0 max-w-full bg-blue-100 p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition"
        >
          <p class="text-blue-800 font-medium text-xs sm:text-sm mb-1 sm:mb-2">
            Expected
          </p>

          <p class="text-lg xs:text-xl sm:text-2xl font-bold text-blue-900 break-all leading-tight">
            Ksh. {{ formatAmount(overviewData.school_fees_expected) }}
          </p>
        </div>

        <!-- Outstanding -->
        <div
          class="w-full min-w-0 max-w-full bg-red-100 p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition"
        >
          <p class="text-red-800 font-medium text-xs sm:text-sm mb-1 sm:mb-2">
            Outstanding
          </p>

          <p class="text-lg xs:text-xl sm:text-2xl font-bold text-red-900 break-all leading-tight">
            Ksh. {{ formatAmount(overviewData.school_fees_outstanding) }}
          </p>
        </div>

      </div>
    </section>


    <!-- Transport -->
    <section class="w-full max-w-full min-w-0 mb-6 sm:mb-8">
      <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
        Transport
      </h2>

      <div class="w-full max-w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">

        <!-- Collected -->
        <div
          class="w-full min-w-0 max-w-full bg-green-100 p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition"
        >
          <p class="text-green-800 font-medium text-xs sm:text-sm mb-1 sm:mb-2">
            Collected
          </p>

          <p class="text-lg xs:text-xl sm:text-2xl font-bold text-green-900 break-all leading-tight">
            Ksh. {{ formatAmount(overviewData.transport_collected) }}
          </p>
        </div>

        <!-- Expected -->
        <div
          class="w-full min-w-0 max-w-full bg-blue-100 p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition"
        >
          <p class="text-blue-800 font-medium text-xs sm:text-sm mb-1 sm:mb-2">
            Expected
          </p>

          <p class="text-lg xs:text-xl sm:text-2xl font-bold text-blue-900 break-all leading-tight">
            Ksh. {{ formatAmount(overviewData.transport_expected) }}
          </p>
        </div>

        <!-- Outstanding -->
        <div
          class="w-full min-w-0 max-w-full bg-red-100 p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition"
        >
          <p class="text-red-800 font-medium text-xs sm:text-sm mb-1 sm:mb-2">
            Outstanding
          </p>

          <p class="text-lg xs:text-xl sm:text-2xl font-bold text-red-900 break-all leading-tight">
            Ksh. {{ formatAmount(overviewData.transport_outstanding) }}
          </p>
        </div>

      </div>
    </section>

  </div>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue'
import { overview } from '../../api/dashboard.js'

const props = defineProps({
  termId: {
    type: [String, Number],
    default: '',
  },
})

const overviewData = ref({
  fees_collected: 0,
  outstanding_balances: 0,
  expected_fees: 0,

  school_fees_collected: 0,
  school_fees_expected: 0,
  school_fees_outstanding: 0,

  transport_collected: 0,
  transport_expected: 0,
  transport_outstanding: 0
})

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString()
}

const fetchOverview = async () => {
  try {
    const data = await overview(props.termId || undefined)
    overviewData.value = data
  } catch (error) {
    console.error('Error fetching dashboard overview:', error)
  }
}

watch(() => props.termId, (newTermId) => {
  if (newTermId) {
    fetchOverview()
  }
})

onMounted(() => {
  fetchOverview()
})
</script>