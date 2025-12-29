<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Assignments</h1>
    <AssignmentList />
  </div>
</template>

<script>
import AssignmentList from '../components/lms/AssignmentList.vue';

export default {
  components: { AssignmentList },
};
</script>
