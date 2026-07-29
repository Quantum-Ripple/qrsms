<template>
  <div class="max-w-xl mx-auto p-6 bg-white shadow rounded space-y-4">

    <h2 class="text-2xl font-bold mb-4">Create Assessment</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">

      <input v-model="form.name" type="text" placeholder="Exam Name" class="w-full border p-2 rounded" required>

      <input v-model="form.date" type="date" class="w-full border p-2 rounded" required>

      <select
          v-model="form.term"
          class="w-full border p-2 rounded"
          required
        >
          <option disabled value="">Select Term</option>

          <option
            v-for="term in terms"
            :key="term.id"
            :value="term.id"
          >
            {{ term.name }} ({{ term.academic_year_name }})
          </option>
        </select>

  
     <div class="border rounded p-3 bg-gray-50">
        <p class="text-sm text-gray-500">Class</p>

        <p class="font-medium">
          {{ classStore.activeClass?.class_level_name }}
          {{ classStore.activeClass?.stream_name }}
        </p>
      </div>


      <button 
        type="submit"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
      >
        Create Assessment
      </button>
    </form>

    
    <div v-if="success" class="text-green-600 font-semibold">Assessment Created☑️</div>

    
    <div v-if="error" class="text-red-600 font-semibold">{{ error }}</div>

  </div>
</template>

<script setup>

import { createExam } from "../../api/Grades";

import { listTerms } from "../../api/term";
import { useToast } from "vue-toastification";
import { useClassStore } from "@/stores/classStore";

import { ref, onMounted } from "vue";

const userData = JSON.parse(localStorage.getItem('user') || '{}')
const school = ref(`${userData.school || ""}`);
const classStore = useClassStore();

const toast = useToast()

const form = ref({
  name: "",
  date: "",


  school: userData.school,
});



const terms = ref([]);

const success = ref(false);
const error = ref("");

onMounted(async () => {
  try {
    terms.value = await listTerms();
  } catch (err) {
    console.error(err);
  }
});

const handleSubmit = async () => {
  try {
    error.value = "";
    success.value = false;

    const payload = {
      ...form.value,
      class_instance: classStore.activeClass?.class_instance || form.value.class_instance || ""
    };

    const res = await createExam(payload);
    //console.log("Exam created:", res);
    toast.success("Assessment Created Successfully")

    success.value = true;

  
  } catch (err) {
    error.value = err.response?.data?.detail || "Failed to create exam";
  }
};
</script>