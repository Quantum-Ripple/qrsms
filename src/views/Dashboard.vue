<template>
  <div class="min-h-screen bg-gray-100 px-4 sm:px-6 py-4">

    <div
      class="bg-white shadow-sm rounded-xl p-4 sm:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >

      <div class="space-y-2">
        <h1 class="text-lg sm:text-xl font-semibold text-gray-800">
          My Profile
        </h1>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-sm text-gray-600"
        >
          <p><span class="font-medium">Name:</span> {{ student?.first_name }} {{ student?.last_name }}</p>
        
          <p><span class="font-medium">Admission No:</span> {{ student?.admission_number }}</p>
          <p><span class="font-medium">Grade:</span> {{ student?.class_level }}</p>
          <p><span class="font-medium">Stream:</span> {{ student?.stream }}</p>
        </div>
      </div>

      <div class="self-end md:self-start">
        <button
          @click="goToAnnouncements"
          class="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          <span
            v-if="hasAnnouncements"
            class="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500"
          ></span>
        </button>
      </div>
    </div>


    <div class="mt-6">
      <DashboardSummary />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardSummary from '../components/DashboardSummary.vue'

const router = useRouter()
const student = ref(null)
const hasAnnouncements = ref(false)

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    student.value = JSON.parse(userData)
  }

  hasAnnouncements.value = true
})

const goToAnnouncements = () => {
  router.push('/dashboard/announcements')
}
</script>

