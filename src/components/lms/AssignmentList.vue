<template>
  <div class="p-4 space-y-4">


    <p v-if="loading">Loading assignments...</p>
    <p v-if="!loading && assignments.length === 0">No assignments available.</p>
    
    <div v-for="assignment in assignments" :key="assignment.id" class="p-4 border rounded flex justify-between items-center">
      <div>
        <h2 class="font-semibold">{{ assignment.subject }}</h2>
        <p>{{ assignment.title }}</p>
        <p>Due: {{ assignment.due_date }}</p>
      </div>
      <button 
        @click="startAssignment(assignment)" 
        :disabled="isDisabled(assignment)"
        :class="{
          'bg-gray-400 text-white cursor-not-allowed': isDisabled(assignment),
          'bg-blue-500 text-white': !isDisabled(assignment)
        }"
        class="px-4 py-2 rounded"
      >
        {{ buttonText(assignment) }}
      </button>
    </div>
  </div>
</template>

<script>
import { getAssignments } from '../../api/lms';
export default {
  data() {
    return {
      assignments: [],
      loading: true,
      today: new Date().toISOString().split('T')[0], 
    };
  },
  async created() {
    try {
      this.assignments = await getAssignments();
      
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    startAssignment(assignment) {
      this.$router.push({ name: "AssignmentStart", params: { id: assignment.id } });
    },
    isDisabled(assignment) {
     
      const duePassed = assignment.due_date < this.today;
      const submitted = assignment.submitted; 
      return duePassed || submitted;
    },
    buttonText(assignment) {
      if (assignment.submitted) return "Completed";
      if (assignment.due_date < this.today) return "Due Passed";
      return "Start";
    },
  },
};
</script>
