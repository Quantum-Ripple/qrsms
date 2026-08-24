<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          Exam Management
        </h1>

        <p class="text-sm text-gray-500 mt-1">
          Manage assessments created for your school.
        </p>
      </div>

      <button
        type="button"
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
      >
        + Create Assessment
      </button>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="bg-white rounded-lg shadow p-6 text-center text-gray-500"
    >
      Loading exams...
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4"
    >
      {{ error }}
    </div>

    <!-- Empty -->
    <div
      v-else-if="exams.length === 0"
      class="bg-white rounded-lg shadow p-8 text-center"
    >
      <p class="text-gray-500 mb-4">
        No assessments have been created yet.
      </p>

      <button
        type="button"
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Create First Assessment
      </button>
    </div>

    <!-- Exams -->
    <div
      v-else
      class="bg-white rounded-lg shadow overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Exam
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Period
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Term
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Grades
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Created By
              </th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="exam in exams"
              :key="exam.id"
              class="hover:bg-gray-50"
            >
              <!-- Exam -->
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">
                  {{ exam.name }}
                </div>
              </td>

              <!-- Period -->
              <td class="px-6 py-4 text-sm text-gray-600">
                <div class="flex flex-col">
                  <span>
                    {{ formatDate(exam.start_date) }}
                  </span>

                  <span class="text-xs text-gray-400">
                    to
                  </span>

                  <span>
                    {{ formatDate(exam.end_date) }}
                  </span>
                </div>
              </td>

              <!-- Term -->
              <td class="px-6 py-4 text-sm text-gray-600">
                <div>
                  {{ exam.term_name || "—" }}
                </div>

                <div
                  v-if="exam.academic_year"
                  class="text-xs text-gray-400 mt-1"
                >
                  {{ exam.academic_year }}
                </div>
              </td>

              <!-- Grades -->
              <td class="px-6 py-4">
                <div
                  v-if="exam.target_class_levels?.length"
                  class="flex flex-wrap gap-1"
                >
                  <span
                    v-for="level in exam.target_class_levels"
                    :key="level"
                    class="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                  >
                    {{ getClassLevelName(level, exam) }}
                  </span>
                </div>

                <!-- Backward compatibility for old exams -->
                <span
                  v-else-if="exam.class_level"
                  class="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
                >
                  {{ getLegacyClassLevelName(exam) }}
                </span>

                <span v-else class="text-sm text-gray-400">
                  —
                </span>
              </td>

              <!-- Created By -->
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ exam.created_by_name || "—" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <CreateNewAssessment
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleExamCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { listExams } from "../api/Grades";
import CreateNewAssessment from "../components/assessments/CreateNewAssessment.vue";
import { useToast } from "vue-toastification";

const toast = useToast();

const exams = ref([]);
const loading = ref(false);
const error = ref("");
const showCreateModal = ref(false);

const fetchExams = async () => {
  loading.value = true;
  error.value = "";

  try {
    exams.value = await listExams();
  } catch (err) {
    console.error("Failed to load exams:", err);

    error.value =
      err.response?.data?.detail ||
      "Failed to load assessments.";
  } finally {
    loading.value = false;
  }
};

const handleExamCreated = async () => {
  showCreateModal.value = false;

  toast.success("Assessment created successfully");

  await fetchExams();
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getClassLevelName = (levelId, exam) => {
  /*
   * If the backend later returns nested target class levels,
   * this function can be adjusted easily.
   *
   * For now, support IDs returned by the serializer.
   */
  if (exam.target_class_level_details?.length) {
    const level = exam.target_class_level_details.find(
      (item) => item.id === levelId
    );

    return level?.name || `Grade ${levelId}`;
  }

  return `Grade ${levelId}`;
};

const getLegacyClassLevelName = (exam) => {
  if (
    typeof exam.class_level === "object" &&
    exam.class_level !== null
  ) {
    return exam.class_level.name || "—";
  }

  return `Grade ${exam.class_level}`;
};

onMounted(fetchExams);
</script>