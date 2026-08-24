<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="closeModal"
  >
    <div class="w-full max-w-lg bg-white rounded-xl shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 class="text-xl font-bold text-gray-800">
            Create Assessment
          </h2>

          <p class="text-sm text-gray-500 mt-1">
            Set the assessment details and select the grades taking it.
          </p>
        </div>

        <button
          type="button"
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      <!-- Form -->
      <form
        @submit.prevent="handleSubmit"
        class="p-6 space-y-5"
      >
        <!-- Exam Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Exam Name
          </label>

          <input
            v-model.trim="form.name"
            type="text"
            placeholder="e.g. End Term 3 Assessment"
            class="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <!-- Start Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>

          <input
            v-model="form.start_date"
            type="date"
            class="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>

          <input
            v-model="form.end_date"
            type="date"
            :min="form.start_date || undefined"
            class="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <!-- Term -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Term
          </label>

          <select
            v-model="form.term"
            class="w-full border border-gray-300 p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option disabled value="">
              Select Term
            </option>

            <option
              v-for="term in terms"
              :key="term.id"
              :value="term.id"
            >
              {{ term.name }} ({{ term.academic_year_name }})
            </option>
          </select>
        </div>

        <!-- Grades -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-700">
              Grades Taking the Exam
            </label>

            <button
              type="button"
              @click="toggleAllGrades"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
              :disabled="classLevels.length === 0"
            >
              {{ allGradesSelected ? "Clear All" : "Select All" }}
            </button>
          </div>

          <div
            class="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto"
          >
            <div
              v-if="loadingGrades"
              class="text-sm text-gray-500 py-2"
            >
              Loading grades...
            </div>

            <div
              v-else-if="classLevels.length === 0"
              class="text-sm text-gray-500 py-2"
            >
              No grades found for this school.
            </div>

            <label
              v-for="level in classLevels"
              :key="level.id"
              class="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 px-2 rounded"
            >
              <input
                v-model="form.target_class_levels"
                type="checkbox"
                :value="level.id"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              <span class="text-sm text-gray-700">
                {{ level.name }}
              </span>
            </label>
          </div>

          <p
            v-if="form.target_class_levels.length > 0"
            class="text-xs text-gray-500 mt-2"
          >
            {{ form.target_class_levels.length }}
            grade{{ form.target_class_levels.length === 1 ? "" : "s" }}
            selected.
          </p>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm"
        >
          {{ error }}
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            :disabled="submitting"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="submitting"
          >
            {{ submitting ? "Creating..." : "Create Assessment" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { createExam } from "../../api/Grades";
import { listTerms } from "../../api/term";
import { fetchClassLevels } from "../../../../api/classes";

const emit = defineEmits(["close", "created"]);

const form = ref({
  name: "",
  start_date: "",
  end_date: "",
  term: "",
  target_class_levels: [],
});

const terms = ref([]);
const classLevels = ref([]);

const error = ref("");
const submitting = ref(false);
const loadingGrades = ref(false);

const allGradesSelected = computed(() => {
  return (
    classLevels.value.length > 0 &&
    form.value.target_class_levels.length === classLevels.value.length
  );
});

const loadTerms = async () => {
  try {
    terms.value = await listTerms();
  } catch (err) {
    console.error("Failed to load terms:", err);

    error.value =
      err.response?.data?.detail ||
      "Failed to load terms.";
  }
};

const loadClassLevels = async () => {
  loadingGrades.value = true;

  try {
    const response = await fetchClassLevels();

    classLevels.value = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];
  } catch (err) {
    console.error("Failed to load class levels:", err);

    error.value =
      err.response?.data?.detail ||
      "Failed to load grades.";
  } finally {
    loadingGrades.value = false;
  }
};

const toggleAllGrades = () => {
  if (allGradesSelected.value) {
    form.value.target_class_levels = [];
    return;
  }

  form.value.target_class_levels = classLevels.value.map(
    (level) => level.id
  );
};

const closeModal = () => {
  if (submitting.value) return;

  emit("close");
};

const handleSubmit = async () => {
  error.value = "";

  if (!form.value.name) {
    error.value = "Exam name is required.";
    return;
  }

  if (!form.value.start_date) {
    error.value = "Start date is required.";
    return;
  }

  if (!form.value.end_date) {
    error.value = "End date is required.";
    return;
  }

  if (form.value.end_date < form.value.start_date) {
    error.value = "End date cannot be before the start date.";
    return;
  }

  if (!form.value.term) {
    error.value = "Please select a term.";
    return;
  }

  if (form.value.target_class_levels.length === 0) {
    error.value = "Please select at least one grade.";
    return;
  }

  submitting.value = true;

  try {
    const payload = {
      name: form.value.name,
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      term: form.value.term,
      target_class_levels: form.value.target_class_levels,
    };

    console.log("Creating exam with payload:", payload);

    await createExam(payload);

    emit("created");
  } catch (err) {
    console.error("Failed to create exam:", err);

    const responseData = err.response?.data;

    if (responseData) {
      if (typeof responseData === "string") {
        error.value = responseData;
      } else if (responseData.detail) {
        error.value = responseData.detail;
      } else {
        const firstError = Object.values(responseData).flat()[0];
        error.value = firstError || "Failed to create exam.";
      }
    } else {
      error.value = "Failed to create exam.";
    }
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  await Promise.all([
    loadTerms(),
    loadClassLevels(),
  ]);
});
</script>