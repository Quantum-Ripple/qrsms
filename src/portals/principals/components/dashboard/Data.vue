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
import { ref, onMounted } from 'vue'
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js'
import { fetchSchoolStatistics } from '../../api/Dashboard'

Chart.register(PieController, ArcElement, Tooltip, Legend)

const genderCanvas = ref(null)
const roleCanvas = ref(null)

let genderChart = null
let roleChart = null

// Stats
const totalStudents = ref(0)
const totalTeachers = ref(0)
const totalStaffs = ref(0)

const user = JSON.parse(localStorage.getItem("user") || "{}")
const school_id = ref(user.school || "")

onMounted(async () => {
  try {
    const stats = await fetchSchoolStatistics(school_id.value)

    totalStudents.value = stats.total_students
    totalTeachers.value = stats.total_teachers
    totalStaffs.value = stats.total_staff

    // Destroy existing charts if already mounted
    if (genderChart) genderChart.destroy()
    if (roleChart) roleChart.destroy()

    // Boys vs Girls Chart
    genderChart = new Chart(genderCanvas.value, {
      type: 'pie',
      data: {
        labels: ['Boys', 'Girls'],
        datasets: [
          {
            data: [stats.male_students, stats.female_students],
            backgroundColor: ['#3b82f6', '#f97316']
          }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    })

    // Students vs Teachers vs Staff
    roleChart = new Chart(roleCanvas.value, {
      type: 'pie',
      data: {
        labels: ['Students', 'Teachers', 'Staff'],
        datasets: [
          {
            data: [
              stats.total_students,
              stats.total_teachers,
              stats.total_staff
            ],
            backgroundColor: ['#3b82f6', '#10b981', '#facc15']
          }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    })
  } catch (error) {
    console.error("Error in Data.vue onMounted hook:", error);
  }
})
</script>
