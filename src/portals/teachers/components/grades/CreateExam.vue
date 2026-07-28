<template>
  <div class="max-w-xl mx-auto p-6 bg-white shadow rounded space-y-4">

    <h2 class="text-2xl font-bold mb-4">Create Assessment</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">

      <input v-model="form.name" type="text" placeholder="Exam Name" class="w-full border p-2 rounded" required>

      <input v-model="form.date" type="date" class="w-full border p-2 rounded" required>

      <select v-model="form.term" class="w-full border p-2 rounded" required>
        <option disabled value="">Select Term</option>
        <option>Term 1</option>
        <option>Term 2</option>
        <option>Term 3</option>
      </select>

      <input v-model="form.academic_year" type="text" placeholder="Academic Year (e.g. 2026)" class="w-full border p-2 rounded" required>

      <select
          v-model="form.class_level"
          class="w-full border p-2 rounded"
          required
        >
          <option disabled value="">Select Class Level</option>
          <option
            v-for="g in GRADES"
            :key="g.value"
            :value="g.value"
          >
            {{ g.label }}
          </option>
        </select>

        <select
            v-model="form.stream"
            class="w-full border p-2 rounded"
            required
          >
            <option disabled value="">Select Stream</option>
            <option
              v-for="s in STREAMS"
              :key="s.value"
              :value="s.value"
            >
              {{ s.label }}
            </option>
          </select>


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
import { ref } from "vue";
import { createExam } from "../../api/Grades";

import { STREAMS } from "../../../../constants/streams";
import { GRADES } from "../../../../constants/grades";
import { useToast } from "vue-toastification";
import { useClassStore } from "@/stores/classStore";

const userData = JSON.parse(localStorage.getItem('user') || '{}')
const school = ref(`${userData.school || ""}`);
const classStore = useClassStore();

const toast = useToast()

const form = ref({
  name: "",
  date: "",
  term: "",
  academic_year: "",
  class_level: "",
  stream: "",
  school: ref(`${userData.school || ""}`),

  
});

const success = ref(false);
const error = ref("");

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