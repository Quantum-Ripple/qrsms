<!--<template>
  <div class="p-6">

    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">School Announcements</h2>

      <button
        @click="router.push({ name: 'EventCreate' })"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        + Create Announcement
      </button>
    </div>

    
    <EventsList />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import EventsList from '../components/events/EventList.vue' 
const router = useRouter()
</script>
-->
<template>
  <div class="p-4 sm:p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        School Announcements
      </h1>

      <button
        @click="router.push({ name: 'EventCreate' })"
        class="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm sm:text-base transition"
      >
        + Create Announcement
      </button>
    </div>

    <!-- List Component -->
    <EventsList />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import EventsList from '../components/events/EventList.vue'

const router = useRouter()
</script>
