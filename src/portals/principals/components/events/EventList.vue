

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div
      v-for="announcement in events"
      :key="announcement.id"
      class="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition flex flex-col justify-between"
    >
     
      <div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2 break-words">
          {{ announcement.title }}
        </h3>
        <p class="text-gray-600 text-sm mb-3 line-clamp-3">
          {{ announcement.message }}
        </p>
      </div>

     
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
        <div class="flex flex-wrap gap-2 text-xs sm:text-sm">
          <span class="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            {{ announcement.target_audience }}
          </span>
          <span class="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {{ formatDate(announcement.created_at) }}
          </span>
        </div>

        <button
          @click="viewDetails(announcement.id)"
          class="text-blue-600 hover:underline text-sm sm:text-base font-medium"
        >
          View →
        </button>
 
  
      </div>
    </div>
  </div>
</template>


<script setup>

import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import * as eventApi from '../../api/events.js'
import { useRouter } from 'vue-router'


const router = useRouter()


const emit = defineEmits(['view'])


// =========================================================
// SCHOOL
// =========================================================

const user = JSON.parse(
  localStorage.getItem('user') || '{}'
)

const school_id = user.school || ''


// =========================================================
// EVENTS / ANNOUNCEMENTS
// =========================================================

const {
  data: eventsData,
  isFetching: eventsFetching
} = useQuery({

  queryKey: [
    'communication-events',
    school_id
  ],

  queryFn: async () => {

    const response =
      await eventApi.fetchEvents()


    // Keep the same newest-first ordering
    // as the original implementation.
    return [...(response || [])].sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    )

  },


  // Announcements don't normally change
  // every few seconds.
  staleTime: 10 * 60 * 1000,


  // When returning to Communication,
  // refresh if necessary while keeping
  // cached data visible.
  refetchOnMount: 'always'

})


const events = computed(
  () => eventsData.value || []
)


// =========================================================
// VIEW DETAILS
// =========================================================

function viewDetails(id) {

  router.push({
    name: 'PrincipalEventDetail',
    params: { id }
  })

}


// =========================================================
// DATE FORMATTING
// =========================================================

function formatDate(dateString) {

  return new Date(
    dateString
  ).toLocaleDateString(
    'en-GB',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  )

}

</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  
  overflow: hidden;
}
</style>
