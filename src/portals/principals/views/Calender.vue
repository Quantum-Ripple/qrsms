<template>
  <div class="p-4 sm:p-6 bg-gray-50 min-h-screen">

    <!-- HEADER -->
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-semibold text-gray-800">
          School Calendar
        </h1>
        <p class="text-sm text-gray-500">
          {{ currentMonthName }} {{ currentYear }}
        </p>
      </div>

      <!-- FILTERS -->
      <div class="flex flex-wrap items-center gap-3">

        <!-- Category ONLY -->
        <select 
          v-model="selectedCategory"
          class="px-3 py-1.5 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option :value="null">All Categories</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>

        <!-- NAV -->
        <div class="flex gap-1 ml-2">
          <button @click="prevMonth" class="nav-btn">←</button>
          <button @click="goToday" class="nav-btn px-3">Today</button>
          <button @click="nextMonth" class="nav-btn">→</button>
        </div>

      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-10 text-gray-400">
      Loading events...
    </div>

    <!-- CALENDAR -->
    <CalendarGrid
      v-else
      :year="currentYear"
      :month="currentMonth"
      :events="events"
      @selectDay="handleDayClick"
    />

    <!-- MODAL -->
    <EventModal
      v-if="showPanel"
      :selectedDate="selectedDate"
      :events="selectedEvents"
      @close="closePanel"
      @created="fetchEvents"
    />

  </div>
</template>


<script setup>

import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import CalendarGrid from '../components/CalendarGrid.vue'
import EventModal from '../components/EventModal.vue'

import {
  getEvents,
  getCategories
} from '../api/calendar'

import { useAuthStore } from '@/stores/authStore.js'

const auth = useAuthStore()


// =========================================================
// SCHOOL
// =========================================================

const user = auth.user || {}

const school_id = user.school?.id || user.school_id || ''


// =========================================================
// STATE
// =========================================================

const today = new Date()


const selectedCategory = ref(null)


const currentMonth = ref(
  today.getMonth()
)

const currentYear = ref(
  today.getFullYear()
)


const showPanel = ref(false)

const selectedDate = ref(null)

const selectedEvents = ref([])


// =========================================================
// CATEGORIES
// =========================================================

const {
  data: categoriesData,
  isFetching: categoriesFetching
} = useQuery({

  queryKey: [
    'calendar-categories',
    school_id
  ],

  queryFn: async () => {

    const response =
      await getCategories()

    return response || []

  },

  // Categories rarely change.
  staleTime: 10 * 60 * 1000,

  refetchOnMount: 'always'

})


const categories = computed(
  () => categoriesData.value || []
)


// =========================================================
// MONTH
// =========================================================

const monthNames = [

  'January',
  'February',
  'March',
  'April',
  'May',
  'June',

  'July',
  'August',
  'September',
  'October',
  'November',
  'December'

]


const currentMonthName = computed(
  () => monthNames[currentMonth.value]
)


// =========================================================
// DATE RANGE
// =========================================================

const startDate = computed(() => {

  return `${currentYear.value}-${
    String(
      currentMonth.value + 1
    ).padStart(2, '0')
  }-01`

})


const endDate = computed(() => {

  const lastDay =
    new Date(
      currentYear.value,
      currentMonth.value + 1,
      0
    )

  return lastDay
    .toISOString()
    .split('T')[0]

})


// =========================================================
// EVENTS QUERY
// =========================================================

const {
  data: eventsData,
  isFetching: eventsFetching,
  isPending: eventsPending
} = useQuery({

  queryKey: [

    'calendar-events',

    school_id,

    currentYear,

    currentMonth,

    selectedCategory

  ],

  queryFn: async () => {

    const params = {

      start_date:
        startDate.value,

      end_date:
        endDate.value

    }


    if (selectedCategory.value) {

      params.category =
        selectedCategory.value

    }


    const response =
      await getEvents(params)


    return response || []

  },


  // Calendar data can safely remain
  // fresh for a short period.
  staleTime: 5 * 60 * 1000,


  // Always check when returning to
  // the calendar if the data is stale.
  refetchOnMount: 'always',


  // Keep the previous month's events
  // visible while the new month loads.
  placeholderData: previousData =>
    previousData

})


const events = computed(
  () => eventsData.value || []
)


// =========================================================
// NAVIGATION
// =========================================================

const prevMonth = () => {

  if (currentMonth.value === 0) {

    currentMonth.value = 11

    currentYear.value--

  } else {

    currentMonth.value--

  }

}


const nextMonth = () => {

  if (currentMonth.value === 11) {

    currentMonth.value = 0

    currentYear.value++

  } else {

    currentMonth.value++

  }

}


const goToday = () => {

  currentMonth.value =
    today.getMonth()

  currentYear.value =
    today.getFullYear()

}


// =========================================================
// INTERACTION
// =========================================================

const handleDayClick = (date) => {

  selectedDate.value = date

  selectedEvents.value =
    events.value.filter(
      event => event.date === date
    )

  showPanel.value = true

}


const closePanel = () => {

  showPanel.value = false

}

</script>

<style scoped>
.nav-btn {
  padding: 0.25rem 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 0.875rem;
  transition: 0.2s;
}
.nav-btn:hover {
  background: #f3f4f6;
}
</style>