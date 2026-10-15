<template>
  <div class="p-6 max-w-3xl mx-auto">
    <button @click="$router.push({ name: 'ParentAssignments' })" class="text-sm text-blue-600 hover:underline mb-3">
      ← Back to assignments
    </button>

    <p v-if="loading" class="text-gray-500">Loading result...</p>
    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <div v-else-if="result" class="space-y-6">
      <!-- Summary -->
      <div class="bg-white border rounded-lg p-5">
        <h1 class="text-2xl font-semibold">{{ result.assignment.title }}</h1>
        <p class="text-sm text-gray-500">
          {{ subjectLabel }} · due {{ result.assignment.due_date }} ·
          submitted {{ formatDate(result.submitted_at) }}
          <span v-if="child.selected"> · {{ child.selected.full_name }}</span>
        </p>

        <div class="mt-4 flex items-end gap-3">
          <p class="text-4xl font-bold" :class="result.is_graded ? 'text-green-600' : 'text-amber-600'">
            {{ result.total_score ?? 0 }}<span class="text-xl text-gray-400"> / {{ result.max_score }}</span>
          </p>
          <p v-if="result.max_score" class="text-gray-500 mb-1">{{ percent }}%</p>
        </div>

        <p v-if="!result.is_graded" class="mt-3 text-sm text-amber-700 bg-amber-50 rounded p-2">
          Some answers are still waiting for the teacher to mark them, so this score may go up.
        </p>
        <p v-if="!result.answers_revealed" class="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
          Correct answers will be shown after the due date ({{ result.assignment.due_date }}).
        </p>
      </div>

      <!-- Questions -->
      <div
        v-for="(q, i) in result.questions"
        :key="q.question_id"
        class="bg-white border-l-4 border rounded-lg p-4 space-y-2"
        :class="tone(q).border"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="font-medium">{{ i + 1 }}. {{ q.text }}</p>
          <span class="text-sm font-semibold shrink-0" :class="tone(q).text">
            {{ q.pending_review ? "Awaiting marking" : `${q.points_awarded} / ${q.max_points}` }}
          </span>
        </div>

        <p class="text-sm">
          <span class="text-gray-500">Answer given: </span>
          <span class="font-medium">{{ show(q.your_answer) }}</span>
        </p>

        <p v-if="result.answers_revealed && q.correct_answer != null" class="text-sm">
          <span class="text-gray-500">Correct answer: </span>
          <span class="font-medium text-green-700">{{ show(q.correct_answer) }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useChildStore } from "../../store/childStore";
import { getChildAssignmentResult } from "../../api/lms";

const route = useRoute();
const child = useChildStore();

const result = ref(null);
const loading = ref(true);
const error = ref("");

const percent = computed(() =>
  result.value?.max_score
    ? Math.round(((result.value.total_score ?? 0) / result.value.max_score) * 100)
    : 0
);

// The result payload only carries the raw subject code.
const subjectLabel = computed(() => result.value?.assignment.subject ?? "");

const show = (v) => {
  if (Array.isArray(v)) return v.length ? v.join(", ") : "No answer";
  return v === null || v === undefined || v === "" ? "No answer" : v;
};

const tone = (q) => {
  if (q.pending_review) return { border: "border-l-amber-400", text: "text-amber-600" };
  if (q.points_awarded >= q.max_points) return { border: "border-l-green-500", text: "text-green-600" };
  if (q.points_awarded > 0) return { border: "border-l-yellow-400", text: "text-yellow-600" };
  return { border: "border-l-red-400", text: "text-red-600" };
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

onMounted(async () => {
  try {
    await child.load();
    result.value = await getChildAssignmentResult(child.selectedId, route.params.id);
  } catch (e) {
    console.error(e);
    error.value = e.response?.data?.detail || "Could not load this result.";
  } finally {
    loading.value = false;
  }
});
</script>