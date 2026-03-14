<template>
    <div>
        <StatDashboard/>
        <AttendanceDashboard/>
        <PerformanceDashboard/>
    </div>
</template>


<script setup>
import AttendanceDashboard from '../components/dashboard/AttendanceDashboard.vue';
import StatDashboard from '../components/dashboard/StatDashboard.vue';
import PerformanceDashboard from '../components/dashboard/PerformanceDashboard.vue';
</script>
<!--

<template>
  <div class="space-y-6">

    <div class="bg-white p-4 rounded-xl shadow flex items-center gap-4">
      <label class="font-semibold">Select Class:</label>

      <select v-model="selectedClass" @change="changeClass" class="border p-2 rounded">
        <option
          v-for="cls in classes"
          :key="cls.class_level + cls.stream"
          :value="cls"
        >
          {{ cls.class_level }} {{ cls.stream }}
        </option>
      </select>
    </div>

    <StatDashboard/>
    <AttendanceDashboard/>
    <PerformanceDashboard/>

  </div>
</template>
<script setup>
import { ref, onMounted } from "vue"

import AttendanceDashboard from '../components/dashboard/AttendanceDashboard.vue'
import StatDashboard from '../components/dashboard/StatDashboard.vue'
import PerformanceDashboard from '../components/dashboard/PerformanceDashboard.vue'

const classes = ref([])
const selectedClass = ref(null)

const loadTeacherClasses = () => {

  const user = JSON.parse(localStorage.getItem("user") || "{}")

  classes.value = user.teaching_assignments || []

  const saved = JSON.parse(localStorage.getItem("activeClass"))

  if (saved) {
    selectedClass.value = saved
  } else {
    selectedClass.value = classes.value[0]
    localStorage.setItem("activeClass", JSON.stringify(selectedClass.value))
  }
}

const changeClass = () => {
  localStorage.setItem("activeClass", JSON.stringify(selectedClass.value))
  window.location.reload()
}

onMounted(loadTeacherClasses)
</script>-->