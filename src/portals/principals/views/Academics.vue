<template>
  <div class="min-h-screen bg-paper font-sans text-ink">
    <div class="max-w-6xl mx-auto px-6 py-10">

      <div class="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 mb-8">
        <div>
          <h1 class="font-serif text-3xl">Academics</h1>
          <p class="text-sm text-ink/60 mt-1" v-if="dashboard">{{ dashboard.exam_name }}</p>
        </div>

        <select
          id="exam-select"
          v-model="selectedExamId"
          @change="loadDashboard"
          class="border border-line bg-white rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
        >
          <option v-for="exam in exams" :key="exam.id" :value="exam.id">
            {{ exam.name }}
          </option>
        </select>
      </div>

      <p v-if="loading" class="text-sm text-ink/50">Loading dashboard...</p>
      <p v-else-if="error" class="text-sm text-signal-bad">{{ error }}</p>

      <template v-else-if="dashboard">
        <div class="flex flex-wrap divide-x divide-line border border-line rounded-sm bg-white mb-12">
          <div class="flex-1 min-w-[160px] px-6 py-5">
            <div class="font-serif text-4xl">{{ dashboard.school_average }}</div>
            <div class="text-sm text-ink/60 mt-1">School average</div>
          </div>
          <div class="flex-1 min-w-[160px] px-6 py-5">
            <div class="font-serif text-4xl" :class="passRateColor">{{ dashboard.pass_rate }}%</div>
            <div class="text-sm text-ink/60 mt-1">Pass rate</div>
          </div>
          <div class="flex-1 min-w-[160px] px-6 py-5">
            <div class="font-serif text-4xl">{{ dashboard.total_students }}</div>
            <div class="text-sm text-ink/60 mt-1">Students examined</div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-10 mb-12">
          <PerformanceBreakdown
            title="Grades, ranked"
            :rows="dashboard.grade_performance"
            name-key="class_level_name"
          />
          <PerformanceBreakdown
            title="Subjects, ranked"
            :rows="dashboard.subject_performance"
            name-key="subject_display"
          />
        </div>

        <ExamComparisonChart :class-level="selectedClassLevel" />
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { listExams, getPrincipalDashboard } from '../api/Grades.js';
import PerformanceBreakdown from '../components/assessments/PerformanceBreakdown.vue';
import ExamComparisonChart from '../components/assessments/ExamComparisonChart.vue';

const exams = ref([]);
const selectedExamId = ref(null);
const selectedClassLevel = ref(null); // wire up if you add a grade filter later
const dashboard = ref(null);
const loading = ref(false);
const error = ref('');

const passRateColor = computed(() => {
  if (!dashboard.value) return '';
  return dashboard.value.pass_rate >= 50 ? 'text-signal-good' : 'text-signal-bad';
});

const loadExams = async () => {
  try {
    exams.value = await listExams();
    if (exams.value.length) {
      selectedExamId.value = exams.value[0].id;
      await loadDashboard();
    }
  } catch (e) {
    error.value = 'Could not load exams.';
  }
};

const loadDashboard = async () => {
  if (!selectedExamId.value) return;
  loading.value = true;
  error.value = '';
  try {
    dashboard.value = await getPrincipalDashboard(selectedExamId.value);
  } catch (e) {
    error.value = 'Could not load dashboard for this exam.';
  } finally {
    loading.value = false;
  }
};

onMounted(loadExams);
</script>