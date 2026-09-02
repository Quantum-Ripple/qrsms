
<template>
  <div class="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800">
          Exam Management
        </h1>
      </div>

      <button
        type="button"
        @click="showCreateModal = true"
        class="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition w-full sm:w-auto"
      >
        <span class="text-lg leading-none">+</span>
        Create Assessment
      </button>
    </div>


    <!-- Loading -->
    <div
      v-if="loading"
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-10 text-center"
    >
      <div class="text-sm text-gray-500">
        Loading assessments...
      </div>
    </div>


    <!-- Error -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4"
    >
      <p class="font-medium">
        Unable to load assessments
      </p>

      <p class="text-sm mt-1 break-words">
        {{ error }}
      </p>

      <button
        type="button"
        @click="fetchExams"
        class="mt-3 text-sm font-medium text-red-700 underline hover:no-underline"
      >
        Try again
      </button>
    </div>


    <!-- Empty -->
    <div
      v-else-if="exams.length === 0"
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center"
    >
      <h3 class="text-lg font-semibold text-gray-800">
        No assessments yet
      </h3>

     
      <button
        type="button"
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium w-full sm:w-auto"
      >
        Create First Assessment
      </button>
    </div>


    <!-- Exams -->
    <div
      v-else
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >

      <!-- Table Header -->
      <div class="px-4 sm:px-6 py-4 border-b border-gray-100">
        <div>
          <h2 class="font-semibold text-gray-800">
            Assessments
          </h2>

          <p class="text-xs text-gray-500 mt-1">
            {{ exams.length }}
            assessment{{ exams.length === 1 ? "" : "s" }}
          </p>
        </div>
      </div>


      <!-- ========================= -->
      <!-- DESKTOP TABLE -->
      <!-- ========================= -->
      <div class="hidden md:block overflow-x-auto">
        <table class="min-w-full">

          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>

              <th
                class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Assessment
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

              <th
                class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>

            </tr>
          </thead>


          <tbody class="divide-y divide-gray-100">

            <tr
              v-for="exam in exams"
              :key="exam.id"
              class="hover:bg-gray-50 transition"
            >

              <!-- Assessment -->
              <td class="px-6 py-4">

                <div class="font-semibold text-gray-900">
                  {{ exam.name }}
                </div>

                <div class="text-xs text-gray-400 mt-1">
                  Exam #{{ exam.id }}
                </div>

              </td>


              <!-- Period -->
              <td class="px-6 py-4">

                <div class="text-sm text-gray-700">
                  {{ formatDate(exam.start_date) }}
                </div>

                <div class="text-xs text-gray-400 my-0.5">
                  to
                </div>

                <div class="text-sm text-gray-700">
                  {{ formatDate(exam.end_date) }}
                </div>

              </td>


              <!-- Term -->
              <td class="px-6 py-4">

                <div class="text-sm text-gray-700">
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
                  class="flex flex-wrap gap-1.5"
                >

                  <span
                    v-for="level in exam.target_class_levels"
                    :key="level"
                    class="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                  >
                    {{ getClassLevelName(level, exam) }}
                  </span>

                </div>


                <!-- Legacy exam -->
                <span
                  v-else-if="exam.class_level"
                  class="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
                >
                  {{ getLegacyClassLevelName(exam) }}
                </span>


                <span
                  v-else
                  class="text-sm text-gray-400"
                >
                  —
                </span>

              </td>


              <!-- Created By -->
              <td class="px-6 py-4">

                <div class="text-sm text-gray-700">
                  {{ exam.created_by_name || "—" }}
                </div>

              </td>


              <!-- Actions -->
              <td class="px-6 py-4 text-right">

                <button
                  type="button"
                  class="text-sm font-medium text-blue-600 hover:text-blue-800"
                  @click="viewExam(exam)"
                >
                  View
                </button>

              </td>

            </tr>

          </tbody>

        </table>
      </div>


      <!-- ========================= -->
      <!-- MOBILE CARDS -->
      <!-- ========================= -->
      <div class="md:hidden divide-y divide-gray-100">

        <div
          v-for="exam in exams"
          :key="exam.id"
          class="p-4 space-y-4"
        >

          <!-- Assessment -->
          <div>
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="font-semibold text-gray-900 break-words">
                  {{ exam.name }}
                </div>

                <div class="text-xs text-gray-400 mt-1">
                  Exam #{{ exam.id }}
                </div>
              </div>

              <button
                type="button"
                class="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-800"
                @click="viewExam(exam)"
              >
                View
              </button>
            </div>
          </div>


          <!-- Period -->
          <div>
            <p class="text-xs font-medium text-gray-500 mb-1">
              Period
            </p>

            <div class="text-sm text-gray-700">
              {{ formatDate(exam.start_date) }}
              <span class="text-gray-400 mx-1">to</span>
              {{ formatDate(exam.end_date) }}
            </div>
          </div>


          <!-- Term -->
          <div class="grid grid-cols-2 gap-4">

            <div>
              <p class="text-xs font-medium text-gray-500 mb-1">
                Term
              </p>

              <div class="text-sm text-gray-700">
                {{ exam.term_name || "—" }}
              </div>
            </div>

            <div>
              <p class="text-xs font-medium text-gray-500 mb-1">
                Academic Year
              </p>

              <div class="text-sm text-gray-700">
                {{ exam.academic_year || "—" }}
              </div>
            </div>

          </div>


          <!-- Grades -->
          <div>
            <p class="text-xs font-medium text-gray-500 mb-2">
              Grades
            </p>

            <div
              v-if="exam.target_class_levels?.length"
              class="flex flex-wrap gap-1.5"
            >

              <span
                v-for="level in exam.target_class_levels"
                :key="level"
                class="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
              >
                {{ getClassLevelName(level, exam) }}
              </span>

            </div>


            <!-- Legacy exam -->
            <span
              v-else-if="exam.class_level"
              class="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
            >
              {{ getLegacyClassLevelName(exam) }}
            </span>


            <span
              v-else
              class="text-sm text-gray-400"
            >
              —
            </span>
          </div>


          <!-- Created By -->
          <div>
            <p class="text-xs font-medium text-gray-500 mb-1">
              Created By
            </p>

            <div class="text-sm text-gray-700">
              {{ exam.created_by_name || "—" }}
            </div>
          </div>

        </div>

      </div>

    </div>


    <!-- Create Modal -->
    <CreateNewAssessment
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleExamCreated"
    />


    <!-- View Modal -->
    <div
      v-if="selectedExam"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
      @click.self="selectedExam = null"
    >

      <div
        class="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl"
      >

        <!-- Header -->
        <div
          class="px-4 sm:px-6 py-4 border-b flex items-start justify-between gap-4"
        >

          <div class="min-w-0">
            <h2 class="text-lg font-bold text-gray-800 break-words">
              {{ selectedExam.name }}
            </h2>

            <p class="text-xs text-gray-500 mt-1">
              Exam #{{ selectedExam.id }}
            </p>
          </div>

          <button
            type="button"
            @click="selectedExam = null"
            class="shrink-0 text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>

        </div>


        <!-- Details -->
        <div class="p-4 sm:p-6 space-y-5">

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <p class="text-xs text-gray-500">
                Start Date
              </p>

              <p class="mt-1 font-medium text-gray-800">
                {{ formatDate(selectedExam.start_date) }}
              </p>
            </div>


            <div>
              <p class="text-xs text-gray-500">
                End Date
              </p>

              <p class="mt-1 font-medium text-gray-800">
                {{ formatDate(selectedExam.end_date) }}
              </p>
            </div>


            <div>
              <p class="text-xs text-gray-500">
                Term
              </p>

              <p class="mt-1 font-medium text-gray-800">
                {{ selectedExam.term_name || "—" }}
              </p>
            </div>


            <div>
              <p class="text-xs text-gray-500">
                Academic Year
              </p>

              <p class="mt-1 font-medium text-gray-800">
                {{ selectedExam.academic_year || "—" }}
              </p>
            </div>

          </div>


          <div>
            <p class="text-xs text-gray-500 mb-2">
              Grades Taking the Exam
            </p>

            <div
              v-if="selectedExam.target_class_levels?.length"
              class="flex flex-wrap gap-2"
            >

              <span
                v-for="level in selectedExam.target_class_levels"
                :key="level"
                class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium"
              >
                {{ getClassLevelName(level, selectedExam) }}
              </span>

            </div>


            <span
              v-else-if="selectedExam.class_level"
              class="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium"
            >
              {{ getLegacyClassLevelName(selectedExam) }}
            </span>


            <span
              v-else
              class="text-sm text-gray-400"
            >
              —
            </span>

          </div>


          <div>
            <p class="text-xs text-gray-500">
              Created By
            </p>

            <p class="mt-1 font-medium text-gray-800 break-words">
              {{ selectedExam.created_by_name || "—" }}
            </p>
          </div>

        </div>


        <!-- Footer -->
        <div class="px-4 sm:px-6 py-4 border-t flex justify-stretch sm:justify-end">

          <button
            type="button"
            @click="selectedExam = null"
            class="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>

        </div>

      </div>

    </div>

  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import { listExams } from "../api/Grades";
import CreateNewAssessment from "../components/assessments/CreateNewAssessment.vue";
import { useToast } from "vue-toastification";
import { fetchClassLevels } from "../../../api/classes";

const toast = useToast();
const classLevels = ref([]);
const exams = ref([]);
const loading = ref(false);
const error = ref("");
const showCreateModal = ref(false);
const selectedExam = ref(null);


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


const viewExam = (exam) => {
  selectedExam.value = exam;
};


const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const fetchClassLevelsData = async () => {
  try {
    const response = await fetchClassLevels();

    classLevels.value = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];
  } catch (err) {
    console.error("Failed to load class levels:", err);
  }
};


const getClassLevelName = (levelId) => {
  const level = classLevels.value.find(
    (item) => String(item.id) === String(levelId)
  );

  return level?.name || "Unknown Grade";
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


onMounted(async () => {
  await Promise.all([
    fetchExams(),
    fetchClassLevelsData(),
  ]);
});
</script>
