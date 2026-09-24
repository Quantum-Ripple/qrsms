<template>
  <div class="min-h-screen bg-paper font-sans text-ink">
    <div class="max-w-6xl mx-auto px-6 py-10">
      <div class="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 mb-8">
        <div>
          <h1 class="font-serif text-3xl" v-if="data">{{ data.class_level_name }}</h1>
          <p class="text-sm text-ink/60 mt-1" v-if="data">
            {{ data.exam_name }} · {{ data.student_count }} students
          </p>
        </div>



<!-- Analytics strip -->
<div v-if="data" class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
  <div class="border border-line rounded-sm bg-white px-4 py-3">
    <p class="text-xs uppercase tracking-wide text-ink/50">Class Average</p>
    <p class="font-serif text-2xl mt-1">{{ classStats.average }}</p>
  </div>
  <div class="border border-line rounded-sm bg-white px-4 py-3">
    <p class="text-xs uppercase tracking-wide text-ink/50">Pass Rate</p>
    <p class="font-serif text-2xl mt-1">{{ classStats.passRate }}%</p>
  </div>
  <div class="border border-line rounded-sm bg-white px-4 py-3">
    <p class="text-xs uppercase tracking-wide text-ink/50">Top Score</p>
    <p class="font-serif text-2xl mt-1">{{ classStats.topScore }}</p>
    <p class="text-xs text-ink/40">{{ classStats.topStudent }}</p>
  </div>
  <div class="border border-line rounded-sm bg-white px-4 py-3">
    <p class="text-xs uppercase tracking-wide text-ink/50">Weakest Subject</p>
    <p class="font-serif text-2xl mt-1">{{ classStats.weakestSubject.display }}</p>
    <p class="text-xs text-ink/40">avg {{ classStats.weakestSubject.avg }}</p>
  </div>
</div>




        <input
          v-if="data"
          v-model="searchQuery"
          type="text"
          placeholder="Search student..."
          class="border border-line bg-white rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 w-56"
        />
      </div>



      <p v-if="loading" class="text-sm text-ink/50">Loading...</p>
      <p v-else-if="error" class="text-sm text-signal-bad">{{ error }}</p>

      <div v-else-if="data" class="overflow-x-auto border border-line rounded-sm bg-white">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-ink/50 text-xs uppercase tracking-wide">
              <th class="px-4 py-3 w-10">#</th>
              <th class="px-4 py-3">Student</th>
              <th v-for="subj in data.subjects" :key="subj.subject" class="px-4 py-3 text-right">
                {{ subj.subject_display }}
              </th>
              <th class="px-4 py-3 text-right font-medium text-ink/70">Average</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="row in filteredResults" :key="row.student_id">
              <td class="px-4 py-3 font-serif" :class="row.rank === 1 ? 'text-gold' : 'text-ink/40'">
                {{ row.rank }}
              </td>
              <td class="px-4 py-3">
                <div class="font-medium">{{ row.first_name }} {{ row.last_name }}</div>
                <div class="text-xs text-ink/50">{{ row.admission_number }}</div>
              </td>
              <td
                v-for="subj in data.subjects"
                :key="subj.subject"
                class="px-4 py-3 text-right tabular-nums"
                :class="scoreColor(row.scores[subj.subject])"
              >
                {{ row.scores[subj.subject] ?? '—' }}
              </td>
              <td class="px-4 py-3 text-right font-serif tabular-nums font-medium">
                {{ row.average_score }}
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  class="text-xs text-ink/50 hover:text-gold underline underline-offset-2"
                  @click="goToStudent(row.student_id)"
                >
                  View
                </button>
              </td>
            </tr>

            <tr v-if="filteredResults.length === 0">
              <td :colspan="data.subjects.length + 4" class="px-4 py-6 text-center text-ink/40 text-sm">
                No student matches "{{ searchQuery }}"
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getClassResults } from '../../api/Grades.js';

const props = defineProps({
  classLevelId: { type: [String, Number], required: true },
});

const route = useRoute();
const router = useRouter();

const data = ref(null);
const loading = ref(false);
const error = ref('');
const searchQuery = ref('');

const filteredResults = computed(() => {
  if (!data.value) return [];
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return data.value.results;
  return data.value.results.filter((row) => {
    const fullName = `${row.first_name} ${row.last_name}`.toLowerCase();
    return fullName.includes(q) || row.admission_number.toLowerCase().includes(q);
  });
});

const scoreColor = (score) => {
  if (score === undefined) return 'text-ink/30';
  if (score >= 70) return 'text-signal-good';
  if (score < 50) return 'text-signal-bad';
  return '';
};

const load = async () => {
  loading.value = true;
  error.value = '';
  try {
    data.value = await getClassResults(route.query.exam, props.classLevelId);
  } catch (e) {
    error.value = 'Could not load class results.';
  } finally {
    loading.value = false;
  }
};

const goToStudent = (studentId) => {
  router.push({
    name: 'StudentResults',
    params: { studentId },
    query: { exam: route.query.exam }, // preserve which exam we came from
  });
};

const classStats = computed(() => {
  if (!data.value) return {};
  const results = data.value.results;
  const subjects = data.value.subjects;

  const average = (
    results.reduce((sum, r) => sum + r.average_score, 0) / results.length
  ).toFixed(1);

  const passRate = (
    (results.filter((r) => r.average_score >= 50).length / results.length) * 100
  ).toFixed(0);

  const top = results.reduce((best, r) =>
    r.average_score > best.average_score ? r : best
  );

  const subjectAverages = subjects.map((subj) => {
    const scores = results
      .map((r) => r.scores[subj.subject])
      .filter((s) => s !== undefined && s !== null);
    const avg = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;
    return { subject: subj.subject, display: subj.subject_display, avg };
  });

  const weakestSubject = subjectAverages.reduce((worst, s) =>
    s.avg !== null && (worst.avg === null || s.avg < worst.avg) ? s : worst
  );

  return {
    average,
    passRate,
    topScore: top.average_score,
    topStudent: `${top.first_name} ${top.last_name}`,
    weakestSubject: { ...weakestSubject, avg: weakestSubject.avg?.toFixed(1) },
  };
});

onMounted(load);
</script>