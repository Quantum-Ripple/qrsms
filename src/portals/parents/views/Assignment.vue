<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold">
        Assignments<span v-if="child.selected"> · {{ child.selected.full_name }}</span>
      </h1>
      <ChildPicker />
    </div>

    <!-- Stat cards (click to filter) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <button
        v-for="card in cards"
        :key="card.key"
        @click="filter = filter === card.key ? 'all' : card.key"
        class="bg-white border rounded-lg p-4 text-left transition hover:shadow-md"
        :class="filter === card.key ? 'ring-2 ring-blue-400' : ''"
      >
        <p class="text-2xl font-bold" :class="card.color">{{ summary[card.key] ?? 0 }}</p>
        <p class="text-sm text-gray-500">{{ card.label }}</p>
      </button>
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-10">Loading assignments...</div>
    <div v-else-if="error" class="text-center text-red-600 py-10">{{ error }}</div>
    <div v-else-if="visible.length === 0" class="text-center text-gray-500 py-10">
      No assignments here.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="a in visible"
        :key="a.id"
        class="bg-white border rounded-lg p-4 flex items-center justify-between gap-4"
      >
        <div class="min-w-0">
          <p class="font-semibold truncate">{{ a.title }}</p>
          <p class="text-sm text-gray-500">{{ a.subject_display }} · {{ a.question_count }} questions · {{ a.total_points }} pts</p>
          <p class="text-xs text-gray-400 mt-1">Due: {{ a.due_date }}</p>
        </div>

        <div class="flex flex-col items-end gap-2 shrink-0">
          <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="badge[a.status].class">
            {{ badge[a.status].label }}
          </span>

          <button
            v-if="a.status === 'todo'"
            @click="go('ParentAssignmentAttempt', a.id)"
            class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Start
          </button>
        <button
            v-else-if="a.status === 'graded' || a.status === 'submitted'"
            @click="go('ParentAssignmentResult', a.id)"
            class="px-3 py-1 text-sm rounded text-white"
            :class="a.status === 'graded' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'"
            >
            {{ a.status === 'graded' ? 'View result' : 'View submission' }}
            <span v-if="a.status === 'graded' && a.score != null">({{ a.score }}/{{ a.total_points }})</span>
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useChildStore } from "../store/childStore";
import { getChildAssignments, getChildAssignmentSummary } from "../api/lms";
import ChildPicker from "../components/ChildPicker.vue";

const router = useRouter();
const child = useChildStore();

const assignments = ref([]);
const summary = ref({});
const loading = ref(false);
const error = ref("");
const filter = ref("all");

const cards = [
  { key: "todo", label: "To do", color: "text-blue-600" },
  { key: "overdue", label: "Overdue", color: "text-red-600" },
  { key: "submitted", label: "Awaiting marking", color: "text-amber-600" },
  { key: "graded", label: "Graded", color: "text-green-600" },
];

const badge = {
  todo: { label: "To do", class: "bg-blue-100 text-blue-700" },
  overdue: { label: "Overdue", class: "bg-red-100 text-red-700" },
  submitted: { label: "Awaiting marking", class: "bg-amber-100 text-amber-700" },
  graded: { label: "Graded", class: "bg-green-100 text-green-700" },
};

const visible = computed(() =>
  filter.value === "all"
    ? assignments.value
    : assignments.value.filter((a) => a.status === filter.value)
);

let requestId = 0;
const load = async () => {
  if (!child.selectedId) return;
  const mine = ++requestId;
  loading.value = true;
  error.value = "";
  try {
    const [list, sum] = await Promise.all([
      getChildAssignments(child.selectedId),
      getChildAssignmentSummary(child.selectedId),
    ]);
    if (mine !== requestId) return;
    assignments.value = list;
    summary.value = sum;
  } catch (e) {
    if (mine !== requestId) return;
    console.error(e);
    error.value = "Could not load assignments. Please try again.";
  } finally {
    if (mine === requestId) loading.value = false;
  }
};

const go = (name, id) => router.push({ name, params: { id } });

watch(() => child.selectedId, load);
onMounted(async () => {
  await child.load();
  await load();
});
</script>