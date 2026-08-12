<template>
  <div class="p-6 space-y-6">
    
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      
      <div class="bg-white p-5 shadow rounded-lg text-center">
        <h3 class="text-gray-600 text-sm">Students</h3>
        <p class="text-2xl font-bold text-blue-600">{{ totalStudents }}</p>
      </div>

      <div class="bg-white p-5 shadow rounded-lg text-center">
        <h3 class="text-gray-600 text-sm">Teachers</h3>
        <p class="text-2xl font-bold text-green-600">{{ totalTeachers }}</p>
      </div>

      <div class="bg-white p-5 shadow rounded-lg text-center">
        <h3 class="text-gray-600 text-sm">Other Staff</h3>
        <p class="text-2xl font-bold text-yellow-600">{{ totalStaffs }}</p>
      </div>

    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- Gender Chart -->
      <div class="bg-white shadow rounded-lg p-4">
        <h3 class="text-gray-700 font-semibold mb-2 text-center">Boys vs Girls</h3>
        <div style="height:280px">
          <canvas ref="genderCanvas"></canvas>
        </div>
      </div>

      <!-- Role Chart -->
      <div class="bg-white shadow rounded-lg p-4">
        <h3 class="text-gray-700 font-semibold mb-2 text-center">Role Distribution</h3>
        <div style="height:280px">
          <canvas ref="roleCanvas"></canvas>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>

import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import {
  Chart,
  PieController,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

import { fetchSchoolStatistics } from '../../api/Dashboard'


Chart.register(PieController, ArcElement, Tooltip, Legend)


const genderCanvas = ref(null)
const roleCanvas = ref(null)


let genderChart = null
let roleChart = null


// School
const user = JSON.parse(localStorage.getItem("user") || "{}")
const school_id = user.school || ""


// Dashboard statistics
const {
  data: stats,
  isFetching,
} = useQuery({
  queryKey: ['school-dashboard', school_id],

  queryFn: () =>
    fetchSchoolStatistics(school_id),

  staleTime:5 * 60 * 1000,

  refetchOnMount: 'always',
})


// KPI values
const totalStudents = computed(
  () => stats.value?.total_students ?? 0
)

const totalTeachers = computed(
  () => stats.value?.total_teachers ?? 0
)

const totalStaffs = computed(
  () => stats.value?.total_staff ?? 0
)


// Update charts whenever fresh/cached statistics arrive
watch(
  stats,
  async (newStats) => {

    if (!newStats) return

    await nextTick()

    // Destroy existing charts
    if (genderChart) {
      genderChart.destroy()
    }

    if (roleChart) {
      roleChart.destroy()
    }


    // Boys vs Girls
    genderChart = new Chart(genderCanvas.value, {
      type: 'pie',

      data: {
        labels: ['Boys', 'Girls'],

        datasets: [
          {
            data: [
              newStats.male_students,
              newStats.female_students
            ],

            backgroundColor: [
              '#3b82f6',
              '#f97316'
            ]
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    })


    // Students vs Teachers vs Staff
    roleChart = new Chart(roleCanvas.value, {
      type: 'pie',

      data: {
        labels: [
          'Students',
          'Teachers',
          'Staff'
        ],

        datasets: [
          {
            data: [
              newStats.total_students,
              newStats.total_teachers,
              newStats.total_staff
            ],

            backgroundColor: [
              '#3b82f6',
              '#10b981',
              '#facc15'
            ]
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    })

  },
  {
    immediate: true
  }
)


// Cleanup
onMounted(() => {
  
})
</script>