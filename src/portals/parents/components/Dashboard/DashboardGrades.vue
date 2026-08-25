
  <template>
  <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-5">

    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="text-lg font-semibold text-slate-900">
          Latest Exam Performance
        </h3>
        <p v-if="latestExamName" class="text-sm text-slate-500">
          {{ latestExamName }}
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-slate-500 py-10 text-center animate-pulse">
      Loading grades...
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm"
    >
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else-if="latestExamGrades.length">

      <!-- Subject Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">

        <div
          v-for="(grade, idx) in latestExamGrades"
          :key="idx"
          class="border border-slate-200 rounded-lg p-3 text-center bg-slate-50"
        >

          <p class="text-xs uppercase text-slate-500 font-semibold">
            {{ grade.subject }}
          </p>

          <p class="text-2xl font-bold text-blue-600 mt-1">
            {{ grade.score }}%
          </p>

          <p
            class="text-xs font-semibold mt-1"
            :class="gradeColor(grade.grade_letter)"
          >
            {{ grade.grade_letter || "—" }}
          </p>

        </div>

      </div>

      <!-- Chart -->
      <div v-if="chartData.datasets.length > 0" class="h-[240px]">
        <Line :data="chartData" :options="chartOptions" />
      </div>

    </div>

    <!-- Empty -->
    <div v-else class="text-slate-500 text-center py-10">
      No grades available yet.
    </div>

  </div>
</template>


<script setup>

import { ref, computed, watch } from "vue"
import { getStudentGrades } from "../../api/assessments"

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js"

import { Line } from "vue-chartjs"

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
)


const props = defineProps({
  studentId: {
    type: String,
    required: true,
  },
})


const groupedGrades = ref({})
const loading = ref(false)
const error = ref(null)


/* Fetch Grades */

const fetchGrades = async (id) => {

  if (!id) {
    groupedGrades.value = {}
    return
  }

  loading.value = true
  error.value = null

  try {

    const data = await getStudentGrades(id)

    groupedGrades.value = data ?? {}

  } catch (err) {

    console.error(err)

    error.value = "Failed to load grades."

    groupedGrades.value = {}

  } finally {

    loading.value = false

  }

}


/* Watch Student */

watch(
  () => props.studentId,
  (newId) => fetchGrades(newId),
  { immediate: true }
)


/* Latest Exam */

const latestExamName = computed(() => {

  const exams = Object.keys(groupedGrades.value)

  if (!exams.length) return null

  return exams[exams.length - 1]

})


const latestExamGrades = computed(() => {

  if (!latestExamName.value) return []

  return groupedGrades.value[latestExamName.value] || []

})


/* Chart Data */

const chartData = computed(() => {

  const exams = Object.keys(groupedGrades.value)

  if (!exams.length) {
    return { labels: [], datasets: [] }
  }

  const subjects = Array.from(
    new Set(exams.flatMap(exam =>
      groupedGrades.value[exam].map(g => g.subject)
    ))
  )

  const datasets = exams.map((exam, idx) => ({

    label: exam,

    data: subjects.map(subject => {

      const grade = groupedGrades.value[exam].find(
        g => g.subject === subject
      )

      return grade ? grade.score : null

    }),

    borderColor: idx === exams.length - 1
      ? "#3b82f6"
      : "#9ca3af",

    tension: 0.35,
    fill: false

  }))

  return {
    labels: subjects,
    datasets
  }

})


const chartOptions = {

  responsive: true,

  maintainAspectRatio: false,

  plugins: {
    legend: { position: "top" }
  },

  scales: {
    y: {
      min: 0,
      max: 100,
      title: { display: true, text: "Score" }
    }
  }

}


/* Helpers */

function gradeColor(level) {

  switch(level){

    case "EE1":
    case "EE2":
      return "text-green-600"

    case "ME1":
    case "ME2":
      return "text-blue-600"

    case "AE1":
    case "AE2":
      return "text-yellow-600"

    case "BE1":
    case "BE2":
      return "text-red-600"

    default:
      return "text-slate-500"

  }

}

</script>
