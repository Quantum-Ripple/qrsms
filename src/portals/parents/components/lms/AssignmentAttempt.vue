<template>
  <div class="p-6 max-w-3xl mx-auto">
    <p v-if="loading" class="text-gray-500">Loading assignment...</p>
    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <div v-else-if="assignment" class="space-y-6">
      <div>
        <button @click="$router.back()" class="text-sm text-blue-600 hover:underline mb-2">← Back</button>
        <h1 class="text-2xl font-semibold">{{ assignment.title }}</h1>
        <p class="text-sm text-gray-500">
          {{ assignment.subject_display }} · Due {{ assignment.due_date }} ·
          {{ assignment.total_points }} points · for {{ child.selected?.full_name }}
        </p>
      </div>

      <div
        v-for="(q, i) in assignment.questions"
        :key="q.id"
        class="bg-white border rounded-lg p-4 space-y-3"
      >
        <p class="font-medium">
          {{ i + 1 }}. {{ q.text }}
          <span class="text-xs text-gray-400">({{ q.points }} pt{{ q.points > 1 ? "s" : "" }})</span>
        </p>

        <!-- multiple choice -->
        <div v-if="q.type === 'multiple'" class="space-y-2">
            <p class="text-xs text-gray-400">Select all that apply</p>
            <label v-for="o in q.options" :key="o.id" class="flex items-center gap-2">
                <input type="checkbox" :value="o.id" v-model="answers[q.id]" />
                <span>{{ o.text }}</span>
            </label>
            </div>

        <!-- true / false -->
        <div v-else-if="q.type === 'true_false'" class="flex gap-6">
          <label class="flex items-center gap-2">
            <input type="radio" :name="`q${q.id}`" value="true" v-model="answers[q.id]" /> True
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" :name="`q${q.id}`" value="false" v-model="answers[q.id]" /> False
          </label>
        </div>

        <!-- short answer -->
        <input
          v-else-if="q.type === 'short'"
          v-model="answers[q.id]"
          type="text"
          class="w-full p-2 border rounded"
        />

        <!-- essay -->
        <textarea v-else v-model="answers[q.id]" rows="5" class="w-full p-2 border rounded"></textarea>
      </div>

      <p v-if="submitError" class="text-red-600">{{ submitError }}</p>

      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-500">{{ answeredCount }} of {{ assignment.questions.length }} answered</span>
        <button
          @click="submit"
          :disabled="submitting"
          class="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {{ submitting ? "Submitting..." : "Submit assignment" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useChildStore } from "../../store/childStore";
import { getChildAssignment, submitChildAssignment } from "../../api/lms";

const route = useRoute();
const router = useRouter();
const child = useChildStore();

const assignment = ref(null);
const answers = ref({});
const loading = ref(true);
const error = ref("");
const submitting = ref(false);
const submitError = ref("");

const isAnswered = (v) => (Array.isArray(v) ? v.length > 0 : v !== "" && v != null);
const answeredCount = computed(
  () => Object.values(answers.value).filter(isAnswered).length
);

const buildAnswers = () =>
  assignment.value.questions.map((q) => {
    const v = answers.value[q.id];
    return q.type === "multiple"
      ? { question: q.id, selected_options: v ?? [] }
      : { question: q.id, answer_text: v ?? "" };
  });


const submit = async () => {
  const missing = assignment.value.questions.length - answeredCount.value;
  const msg = missing
    ? `${missing} question(s) are unanswered. Submit anyway? You can't change answers afterwards.`
    : "Submit now? You can't change answers afterwards.";
  if (!window.confirm(msg)) return;

  submitting.value = true;
  submitError.value = "";
  try {
    await submitChildAssignment(child.selectedId, assignment.value.id, buildAnswers());
    router.replace({ name: "ParentAssignments" });
  } catch (e) {
    console.error(e);
    submitError.value =
      e.response?.data?.detail || "Could not submit. Please try again.";
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  try {
    await child.load();
    const data = await getChildAssignment(child.selectedId, route.params.id);

    // Prepare an empty answer slot for every question: array for checkboxes, string for the rest.
    const initial = {};
    for (const q of data.questions) {
      initial[q.id] = q.type === "multiple" ? [] : "";
    }
    answers.value = initial;

    assignment.value = data;
  } catch (e) {
    console.error(e);
    error.value = "Could not load this assignment.";
  } finally {
    loading.value = false;
  }
});
</script>