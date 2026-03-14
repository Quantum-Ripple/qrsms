<!--

<template>
    <div class="dashboard-card">
      <h3 class="card-title">Latest Exam Grades</h3>
  
      
      <div v-if="loading" class="loading-placeholder">
        <p>Loading grades...</p>
      </div>
  
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>
  
      
      <div v-else-if="latestExamGrades.length" class="card-content">
        
        <div class="grades-grid">
          <div v-for="(grade, idx) in latestExamGrades" :key="idx" class="grade-item">
            <p class="subject">{{ grade.subject }}</p>
            <p class="score">{{ grade.score }}</p>
            <p class="grade-letter">{{ grade.grade_letter || '—' }}</p>
            <p class="remarks">{{ grade.remarks || '' }}</p>
          </div>
        </div>
  
        
        <div v-if="chartData.datasets.length > 0" class="chart-container">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>
  
      
      <div v-else class="no-data">
        <p>No grades available for this student.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, watch, computed, toRefs } from 'vue';
  import { getStudentGrades } from '../../api/Students';
  
  
  import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
  import { Line } from 'vue-chartjs';
  
  ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);
  
  
  const props = defineProps({
    studentId: {
      type: String,
      required: true,
    },
  });
  
  const { studentId } = toRefs(props);
  
  
  const groupedGrades = ref({});
  const loading = ref(false);
  const error = ref(null);
  
  
  const fetchGrades = async (id) => {
    if (!id) {
        groupedGrades.value = {};
        return;
    }
    loading.value = true;
    error.value = null;
    try {
      const data = await getStudentGrades(id);
      groupedGrades.value = data;
    } catch (err) {
      console.error('Error fetching grades:', err);
      error.value = 'Failed to load grades.';
      groupedGrades.value = {};
    } finally {
      loading.value = false;
    }
  };
  
  
  watch(studentId, (newId) => {
      fetchGrades(newId);
  }, { immediate: true });
  
  
  const latestExamGrades = computed(() => {
    const exams = Object.keys(groupedGrades.value);
    if (!exams.length) return [];
    const latestExam = exams.sort().pop(); 
    return groupedGrades.value[latestExam] || [];
  });
  
  
  const chartData = reactive({ labels: [], datasets: [] });
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
    scales: { y: { min: 0, max: 100, title: { display: true, text: 'Score' } } },
  };
  
  watch(groupedGrades, (newGrades) => {
      const examNames = Object.keys(newGrades);
      if (!examNames.length) {
        chartData.labels = [];
        chartData.datasets = [];
        return;
      }
  
      const subjects = Array.from(new Set(examNames.flatMap(exam => newGrades[exam].map(g => g.subject))));
      chartData.labels = subjects;
      chartData.datasets = examNames.map((exam, idx) => ({
        label: exam,
        data: subjects.map(subj => {
          const grade = newGrades[exam].find(g => g.subject === subj);
          return grade ? grade.score : null;
        }),
        fill: false,
        borderColor: idx === examNames.length - 1 ? '#3b82f6' : '#9ca3af',
        tension: 0.3,
      }));
  });
  
  </script>
  
  <style scoped>
  .dashboard-card {
    background-color: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  
  .card-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .card-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
  }
  
  .grades-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  .grade-item {
    background-color: #f9fafb;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    border: 1px solid #f0f0f0;
  }
  
  .subject {
    font-weight: bold;
    color: #333;
  }
  
  .score {
    font-size: 1.75rem;
    font-weight: bold;
    color: #3b82f6;
    margin: 0.25rem 0;
  }
  
  .grade-letter {
    font-size: 0.9rem;
    color: #666;
  }
  
  .remarks {
      font-size: 0.8rem;
      color: #999;
  }
  
  .chart-container {
      position: relative;
      height: 250px;
  }
  
  .loading-placeholder, .error-message, .no-data {
    text-align: center;
    padding: 2rem;
    color: #777;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  </style>-->

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
