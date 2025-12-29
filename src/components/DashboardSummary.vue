<template>
  <div class="space-y-8">

    <section>
      <h2 class="text-lg font-semibold text-gray-800 mb-3">
        Recent Assignments
      </h2>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div
          v-for="assignment in recentAssignments"
          :key="assignment.id"
          class="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between"
        >
          <div>
            <p class="font-medium text-gray-800 truncate">
              {{ assignment.title }}
            </p>
            <p class="text-sm text-gray-500">
              {{ assignment.subject }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              Due: {{ assignment.due_date }}
            </p>
          </div><div class="mt-2 flex items-center justify-between">

  <span
    class="text-xs font-medium"
    :class="getAssignmentStatus(assignment).color"
  >
    {{ getAssignmentStatus(assignment).label }}
  </span>

 
  <button
    v-if="getAssignmentStatus(assignment).label === 'Open'"
    @click="openAssignment(assignment.id)"
    class="text-sm text-blue-600 hover:underline"
  >
    Open
  </button>
</div>


        </div>
      </div>
    </section>

    <section class="grid gap-6 md:grid-cols-2">
    
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <h3 class="text-sm font-semibold mb-3">
          Assignments by Subject
        </h3>
        <div class="relative h-[240px]">
          <Doughnut :data="subjectChartData" :options="chartOptions" />
        </div>
      </div>

   
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <h3 class="text-sm font-semibold mb-3">
          Completion Status
        </h3>
        <div class="relative h-[240px]">
          <Pie :data="completionChartData" :options="chartOptions" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Doughnut, Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { getAssignments } from '../api/lms'
import router from '../routers'

ChartJS.register(ArcElement, Tooltip, Legend)

const assignments = ref([])

onMounted(async () => {
  assignments.value = await getAssignments()
})



const recentAssignments = computed(() =>
  assignments.value.slice(0, 5)
)

const subjectChartData = computed(() => {
  const map = {}
  assignments.value.forEach(a => {
    map[a.subject] = (map[a.subject] || 0) + 1
  })

  return {
    labels: Object.keys(map),
    datasets: [
      {
        data: Object.values(map),
        backgroundColor: ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444']
      }
    ]
  }
})

const completionChartData = computed(() => {
  const completed = assignments.value.filter(a => a.submitted).length
  const pending = assignments.value.length - completed

  return {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completed, pending],
        backgroundColor: ['#10B981', '#F97316']
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}
const getAssignmentStatus = (assignment) => {
  const now = new Date()
  const dueDate = new Date(assignment.due_date)

  if (assignment.submitted) {
    return {
      label: 'Completed',
      color: 'text-green-600'
    }
  }

  if (dueDate < now) {
    return {
      label: 'Overdue',
      color: 'text-red-600'
    }
  }

  return {
    label: 'Open',
    color: 'text-blue-600'
  }
}


const openAssignment = () => {
  router.push('/dashboard/assignments')
}
</script>

