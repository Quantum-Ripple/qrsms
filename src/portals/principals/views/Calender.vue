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
import { ref, computed, onMounted, watch } from 'vue'
import CalendarGrid from '../components/CalendarGrid.vue'
import EventModal from '../components/EventModal.vue'

import {
  getEvents,
  getCategories
} from '../api/calendar'

// ======================
// STATE
// ======================

const today = new Date()

const events = ref([])
const loading = ref(false)

const categories = ref([])
const selectedCategory = ref(null)

const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const showPanel = ref(false)
const selectedDate = ref(null)
const selectedEvents = ref([])

// ======================
// COMPUTED
// ======================

const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const currentMonthName = computed(
  () => monthNames[currentMonth.value]
)

// ======================
// FETCH
// ======================

const fetchCategories = async () => {
  try {
    categories.value = await getCategories()
  } catch (err) {
    console.error('Fetch categories failed', err)
  }
}

const fetchEvents = async () => {
  try {
    loading.value = true

    const start = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2,'0')}-01`
    const end = new Date(currentYear.value, currentMonth.value + 1, 0)
      .toISOString()
      .split('T')[0]

    const params = {
      start_date: start,
      end_date: end
    }

    if (selectedCategory.value) {
      params.category = selectedCategory.value
    }

    events.value = await getEvents(params)

  } catch (err) {
    console.error('Fetch events failed', err)
  } finally {
    loading.value = false
  }
}

// ======================
// NAVIGATION
// ======================

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
  currentMonth.value = today.getMonth()
  currentYear.value = today.getFullYear()
}

// ======================
// INTERACTION
// ======================

const handleDayClick = (date) => {
  selectedDate.value = date
  selectedEvents.value = events.value.filter(e => e.date === date)
  showPanel.value = true
}

const closePanel = () => {
  showPanel.value = false
}

// ======================
// LIFECYCLE
// ======================

onMounted(async () => {
  await fetchCategories()
  await fetchEvents()
})

// ======================
// WATCHERS
// ======================

watch([currentMonth, currentYear], fetchEvents)
watch(selectedCategory, fetchEvents)

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