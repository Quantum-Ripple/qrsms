<template>
  <div class="min-h-screen bg-gray-50 p-3 pb-24 sm:p-5 md:pb-6">

    <!-- Header -->
    <header class="mb-5 flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold text-gray-900">
        Exams
      </h1>

      <div class="flex shrink-0 items-center gap-2">
      <!--  <button
          type="button"
          :disabled="loading"
          @click="fetchDashboard"
          aria-label="Refresh exams"
          class="flex h-10 w-10 items-center justify-center rounded-lg
                 border border-gray-300 bg-white text-gray-700
                 hover:bg-gray-100 disabled:opacity-50"
        >
          <svg
            class="h-5 w-5"
            :class="{ 'animate-spin': loading }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <path
              d="M20 7v5h-5M4 17v-5h5M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>-->

        <button
          type="button"
          @click="showCreateModal = true"
          class="rounded-lg bg-blue-600 px-3 py-2.5 text-sm
                 font-medium text-white hover:bg-blue-700"
        >
          Create Exam
        </button>
      </div>
    </header>

    <!-- Summary -->
    <section
      class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4"
      aria-label="Exam summary"
    >
      <div class="rounded-lg border border-gray-200 bg-white p-3">
        <p class="text-sm text-gray-500">Exams</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900">
          {{ formatNumber(summary.exams_count) }}
        </p>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-3">
        <p class="text-sm text-gray-500">Missing marks</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900">
          {{ formatNumber(summary.missing_marks) }}
        </p>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-3">
        <p class="text-sm text-gray-500">Ready to release</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900">
          {{ formatNumber(summary.ready_to_release) }}
        </p>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-3">
        <p class="text-sm text-gray-500">Scheduled</p>
        <p class="mt-1 text-2xl font-semibold text-gray-900">
          {{ formatNumber(summary.scheduled) }}
        </p>
      </div>
    </section>

    <!-- Loading -->
    <div
      v-if="loading && !hasLoaded"
      class="border-y border-gray-200 bg-white px-4 py-10 text-center"
    >
      <div
        class="mx-auto h-6 w-6 animate-spin rounded-full
               border-2 border-gray-200 border-t-blue-600"
      ></div>
      <p class="mt-3 text-sm text-gray-500">Loading exams...</p>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="border-y border-gray-200 bg-white px-4 py-5"
    >
      <p class="text-sm text-red-600">{{ error }}</p>

      <button
        type="button"
        @click="fetchDashboard"
        class="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        Try again
      </button>
    </div>

    <!-- Assessments -->
    <section v-else class="overflow-hidden rounded-lg border border-gray-200 bg-white">

      <!-- Search and filter -->
      <div class="flex flex-col gap-3 border-b border-gray-200 p-3 sm:flex-row">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search exams..."
          aria-label="Search exams"
          class="min-w-0 flex-1 rounded-lg border border-gray-300
                 bg-white px-3 py-2.5 text-sm text-gray-800
                 outline-none focus:border-blue-500"
        />

        <div class="flex gap-2">
          <select
            v-model="statusFilter"
            aria-label="Filter by status"
            class="min-w-0 flex-1 rounded-lg border border-gray-300
                   bg-white px-3 py-2.5 text-sm text-gray-700
                   outline-none focus:border-blue-500 sm:w-44"
          >
            <option value="All">All statuses</option>
            <option value="Marking">Marking</option>
            <option value="Completed">Completed</option>
            <option value="Released">Released</option>
            <option value="Scheduled">Scheduled</option>
          </select>

          <button
            v-if="searchQuery || statusFilter !== 'All'"
            type="button"
            @click="clearFilters"
            class="rounded-lg border border-gray-300 px-3 py-2
                   text-sm text-gray-600 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="filteredExams.length === 0"
        class="px-4 py-10 text-center"
      >
        <p class="text-sm text-gray-500">
          {{ exams.length ? "No matching exams." : "No exams yet." }}
        </p>

        <button
          v-if="!exams.length"
          type="button"
          @click="showCreateModal = true"
          class="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Create an exam
        </button>

        <button
          v-else
          type="button"
          @click="clearFilters"
          class="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Clear filters
        </button>
      </div>

      <template v-else>

        <!-- Desktop table -->
        <div class="hidden overflow-x-auto md:block">
          <table class="w-full text-left">
            <thead class="border-b border-gray-200 bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-sm font-medium text-gray-600">
                  Assessment
                </th>
                <th class="px-4 py-3 text-sm font-medium text-gray-600">
                  Dates
                </th>
                <th class="px-4 py-3 text-sm font-medium text-gray-600">
                  Grades
                </th>
                <th class="px-4 py-3 text-sm font-medium text-gray-600">
                  Missing marks
                </th>
                <th class="px-4 py-3 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="exam in filteredExams"
                :key="exam.id"
                class="hover:bg-gray-50"
              >
                <td class="max-w-64 px-4 py-4">
                  <p class="break-words text-sm font-medium text-gray-900">
                    {{ exam.name }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500">
                    {{ exam.term}} {{ exam.academic_year }}
                    
                  </p>
                </td>

                <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                  {{ formatDate(exam.start_date) }}
                  <span class="text-gray-400">–</span>
                  {{ formatDate(exam.end_date) }}
                </td>

                <td class="max-w-52 px-4 py-4">
                  <span v-if="exam.target_class_levels?.length"
                        class="text-sm text-gray-700">
                    {{ exam.target_class_levels.join(", ") }}
                  </span>
                  <span v-else class="text-sm text-gray-400">—</span>
                </td>

                <td class="px-4 py-4 text-sm">
                  <span
                    :class="Number(exam.missing_marks) > 0
                      ? 'font-medium text-amber-700'
                      : 'text-gray-600'"
                  >
                    {{ formatNumber(exam.missing_marks) }}
                  </span>
                </td>

                <td class="px-4 py-4">
                  <StatusBadge :status="exam.status" />
                </td>

                <td class="px-4 py-4 text-right">
                  <button
                    type="button"
                    @click="viewExam(exam)"
                    class="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View →
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile list -->
        <div class="divide-y divide-gray-200 md:hidden">
          <article
            v-for="exam in filteredExams"
            :key="exam.id"
            class="p-4"
          >
            <!-- Name and status -->
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <h2 class="break-words text-sm font-semibold text-gray-900">
                  {{ exam.name }}
                </h2>

                <p class="mt-1 text-xs text-gray-500">
                  {{ exam.term || "—" }}
                  <span v-if="exam.academic_year">
                    · {{ exam.academic_year }}
                  </span>
                </p>
              </div>

              <StatusBadge :status="exam.status" />
            </div>

            <!-- Dates and grades -->
            <div class="mt-3 space-y-1 text-sm text-gray-600">
              <p>
                {{ formatDate(exam.start_date) }}
                <span class="text-gray-400">–</span>
                {{ formatDate(exam.end_date) }}
              </p>

              <p v-if="exam.target_class_levels?.length" class="text-gray-500">
                {{ exam.target_class_levels.join(", ") }}
              </p>
            </div>

            <!-- Missing marks and action -->
            <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <p class="text-sm text-gray-600">
                Missing marks:
                <span
                  class="font-medium"
                  :class="Number(exam.missing_marks) > 0
                    ? 'text-amber-700'
                    : 'text-gray-900'"
                >
                  {{ formatNumber(exam.missing_marks) }}
                </span>
              </p>

              <button
                type="button"
                @click="viewExam(exam)"
                class="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View →
              </button>
            </div>
          </article>
        </div>
      </template>

      <!-- Count -->
      <div
        v-if="filteredExams.length"
        class="border-t border-gray-200 px-4 py-3"
      >
        <p class="text-xs text-gray-500">
          {{ filteredExams.length }}
          {{ filteredExams.length === 1 ? "exam" : "exams" }}
        </p>
      </div>
    </section>

    <!-- Create assessment -->
    <CreateNewAssessment
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleExamCreated"
    />

    <!-- Assessment details -->
    <div
      v-if="selectedExam"
      class="fixed inset-0 z-50 flex items-center justify-center
             bg-black/40 p-3 sm:p-5"
      @click.self="selectedExam = null"
      @keydown.esc="selectedExam = null"
    >
      <section
        class="max-h-[90vh] w-full max-w-lg overflow-y-auto
               rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        :aria-label="`Details for ${selectedExam.name}`"
      >
        <header class="flex items-start justify-between gap-3 border-b border-gray-200 p-4">
          <div class="min-w-0">
            <h2 class="break-words font-semibold text-gray-900">
              {{ selectedExam.name }}
            </h2>

            <p class="mt-1 text-sm text-gray-500">
              {{ selectedExam.term || "—" }}
              <span v-if="selectedExam.academic_year">
                · {{ selectedExam.academic_year }}
              </span>
            </p>
          </div>

          <button
            type="button"
            @click="selectedExam = null"
            aria-label="Close"
            class="flex h-8 w-8 shrink-0 items-center justify-center
                   rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="m18 6-12 12M6 6l12 12" stroke-linecap="round"/>
            </svg>
          </button>
        </header>

        <div class="divide-y divide-gray-200 px-4">
          <div class="flex items-center justify-between gap-3 py-4">
            <span class="text-sm text-gray-500">Status</span>
            <StatusBadge :status="selectedExam.status" />
          </div>

          <div class="flex items-center justify-between gap-3 py-4">
            <span class="text-sm text-gray-500">Missing marks</span>
            <span
              class="font-semibold"
              :class="Number(selectedExam.missing_marks) > 0
                ? 'text-amber-700'
                : 'text-gray-900'"
            >
              {{ formatNumber(selectedExam.missing_marks) }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3 py-4">
            <span class="text-sm text-gray-500">Start date</span>
            <span class="text-right text-sm text-gray-900">
              {{ formatDate(selectedExam.start_date) }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3 py-4">
            <span class="text-sm text-gray-500">End date</span>
            <span class="text-right text-sm text-gray-900">
              {{ formatDate(selectedExam.end_date) }}
            </span>
          </div>

          <div class="flex items-start justify-between gap-3 py-4">
            <span class="text-sm text-gray-500">Grades</span>
            <span class="max-w-[65%] text-right text-sm text-gray-900">
              {{
                selectedExam.target_class_levels?.length
                  ? selectedExam.target_class_levels.join(", ")
                  : "—"
              }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3 py-4">
            <span class="text-sm text-gray-500">Created by</span>
            <span class="break-words text-right text-sm text-gray-900">
              {{ selectedExam.created_by || "—" }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3 py-4">
            <span class="text-sm text-gray-500">Exam ID</span>
            <span class="text-sm text-gray-900">
              #{{ selectedExam.id }}
            </span>
          </div>

          <div class="py-4">
            <p class="text-sm text-gray-500">Results</p>
            <p class="mt-1 text-sm font-medium text-gray-900">
              {{ selectedExam.results_released ? "Released" : "Not released" }}
            </p>

            <p
              v-if="selectedExam.results_released_at"
              class="mt-1 text-xs text-gray-500"
            >
              {{ formatDateTime(selectedExam.results_released_at) }}
            </p>
          </div>
        </div>

        <footer class="border-t border-gray-200 p-4">
          <button
            type="button"
            @click="selectedExam = null"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5
                   text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from "vue";
import { useToast } from "vue-toastification";
import { getExamDashboard } from "../api/Grades";
import CreateNewAssessment from "../components/assessments/CreateNewAssessment.vue";

// Simple status label
const StatusBadge = defineComponent({
  name: "StatusBadge",

  props: {
    status: {
      type: String,
      default: "Marking",
    },
  },

  setup(props) {
    const styles = computed(() => {
      const map = {
        Released: "text-blue-700",
        Completed: "text-emerald-700",
        Marking: "text-amber-700",
        Scheduled: "text-gray-600",
      };

      return map[props.status] || "text-gray-600";
    });

    return () =>
      h(
        "span",
        {
          class: [
            "text-xs font-medium whitespace-nowrap",
            styles.value,
          ],
        },
        props.status || "Unknown",
      );
  },
});

const toast = useToast();

const exams = ref([]);

const summary = ref({
  exams_count: 0,
  missing_marks: 0,
  ready_to_release: 0,
  scheduled: 0,
});

const loading = ref(false);
const hasLoaded = ref(false);
const error = ref("");
const searchQuery = ref("");
const statusFilter = ref("All");
const showCreateModal = ref(false);
const selectedExam = ref(null);

const filteredExams = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return exams.value.filter((exam) => {
    const matchesStatus =
      statusFilter.value === "All" ||
      exam.status === statusFilter.value;

    const gradeText = Array.isArray(exam.target_class_levels)
      ? exam.target_class_levels.join(" ")
      : "";

    const searchableText = [
      exam.name,
      exam.term,
      exam.academic_year,
      exam.created_by,
      gradeText,
      exam.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !query || searchableText.includes(query);

    return matchesStatus && matchesSearch;
  });
});

const fetchDashboard = async () => {
  loading.value = true;
  error.value = "";

  try {
    const data = await getExamDashboard();

    summary.value = {
      exams_count: Number(data.summary?.exams_count ?? 0),
      missing_marks: Number(data.summary?.missing_marks ?? 0),
      ready_to_release: Number(data.summary?.ready_to_release ?? 0),
      scheduled: Number(data.summary?.scheduled ?? 0),
    };

    exams.value = Array.isArray(data.exams) ? data.exams : [];
    hasLoaded.value = true;
  } catch (err) {
    console.error("Failed to load exam dashboard:", err);

    error.value =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      "Could not load exams. Check your connection and try again.";
  } finally {
    loading.value = false;
  }
};

const handleExamCreated = async () => {
  showCreateModal.value = false;
  toast.success("Assessment created successfully");
  await fetchDashboard();
};

const viewExam = (exam) => {
  selectedExam.value = exam;
};

const clearFilters = () => {
  searchQuery.value = "";
  statusFilter.value = "All";
};

const formatNumber = (value) => {
  const number = Number(value ?? 0);

  return Number.isFinite(number)
    ? new Intl.NumberFormat("en-KE").format(number)
    : "0";
};

const formatDate = (value) => {
  if (!value) return "—";

  const parts = String(value).slice(0, 10).split("-");

  if (parts.length !== 3) return "—";

  const [year, month, day] = parts.map(Number);

  if (!year || !month || !day) return "—";

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(fetchDashboard);
</script>