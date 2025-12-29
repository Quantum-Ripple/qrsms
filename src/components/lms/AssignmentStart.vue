<template>
  <div class="p-4">
 
    <p v-if="loading">Loading assignment...</p>

    <p v-if="error" class="text-red-500">{{ error }}</p>


    <div v-if="!loading && assignment">
      <h1 class="text-xl font-bold mb-2">{{ assignment.title }}</h1>
      <p class="mb-1">{{ assignment.subject }} - {{ assignment.class_level }}</p>
      <p class="mb-4">Due Date: {{ assignment.due_date }}</p>

      <button
        @click="startQuestions"
        class="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
      >
        Start Assignment
      </button>
    </div>
  </div>
</template>

<script>
import { getAssignments } from '../../api/lms';

export default {
  data() {
    return {
      assignment: null,
      loading: true,
      error: null,
    };
  },
  async created() {
    const id = this.$route.params.id;

    try {
      const allAssignments = await getAssignments();
      this.assignment = allAssignments.find(a => a.id == id);

      if (!this.assignment) {
        this.error = "Assignment not found.";
      }
    } catch (err) {
      console.error(err);
      this.error = "Failed to fetch assignment.";
    } finally {
      this.loading = false;
    }
  },
  methods: {
    startQuestions() {
      if (!this.assignment) return;

      this.$router.push({
        name: "QuestionPage",
        params: { assignmentId: this.assignment.id, questionIndex: 0 },
      });
    },
  },
};
</script>


