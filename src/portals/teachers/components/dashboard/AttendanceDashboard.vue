<template>
  <div class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl space-y-6">
 
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-bold text-gray-700">
        Attendance | {{ today }}
      </h2>
      <button
        @click="refreshData"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition"
      >
        Refresh
      </button>
    </div>

    
    <div v-if="isLoading" class="text-center text-gray-500 italic py-10">
      Loading attendance...
    </div>

  
    <div v-else-if="noRecords" class="text-center text-gray-400 italic py-10">
      No attendance records found for today
    </div>

    
    <div v-else class="flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0">
      
     <div class="flex-1 bg-white p-6 rounded-xl shadow-md h-[350px]">
        <canvas ref="attendanceChartRef"></canvas>
      </div>

    
      <div class="flex-1 grid grid-cols-2 sm:grid-cols-2 gap-4">
        <div
          v-for="(count, key) in attendanceSummary"
          :key="key"
          class="p-5 rounded-xl shadow-md flex flex-col justify-center items-center transition transform hover:-translate-y-1 hover:shadow-lg"
          :class="{
            'bg-green-50 text-green-700': key === 'present',
            'bg-yellow-50 text-yellow-600': key === 'late',
            'bg-red-50 text-red-600': key === 'absent',
            'bg-blue-50 text-blue-600': key === 'excused',
          }"
        >
          <p class="uppercase font-semibold text-sm tracking-wide">{{ key }}</p>
          <p class="text-2xl font-bold mt-1">{{ count }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import Chart from "chart.js/auto";
import * as attendanceApi from "../../api/attendance";
import { useClassStore } from "@/stores/classStore"
import { watch } from "vue"

const classStore=useClassStore()

const attendanceChartRef = ref(null);
const attendanceSummary = ref({
  present: 0,
  late: 0,
  absent: 0,
  excused: 0,
});
const isLoading = ref(false);
let chartInstance = null;

const today = new Date().toISOString().split("T")[0];
const classInstance = ref(null);

const noRecords = computed(() =>
  Object.values(attendanceSummary.value).every((v) => v === 0)
);

const createChart = () => {
  if (!attendanceChartRef.value) {
    console.log("Canvas not ready");
    return;
  }

  console.log("Chart data:", Object.values(attendanceSummary.value));

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(attendanceChartRef.value, {
    type: "pie",
    data: {
      labels: ["Present", "Late", "Absent", "Excused"],
      datasets: [
        {
          data: Object.values(attendanceSummary.value),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
};

const calculateSummary = (attendance) => {
  const todaySession = attendance.find((a) => a.date === today);
  if (!todaySession) {
    attendanceSummary.value = { present: 0, late: 0, absent: 0, excused: 0 };
    return;
  }

  const summary = { present: 0, late: 0, absent: 0, excused: 0 };
  for (const record of todaySession.records) {
    switch (record.status) {
      case "PRESENT":
        summary.present++;
        break;
      case "LATE":
        summary.late++;
        break;
      case "ABSENT":
        summary.absent++;
        break;
      case "EXCUSED":
        summary.excused++;
        break;
    }
  }
  attendanceSummary.value = summary;
};

let currentRequestId = 0;

const loadAttendance = async () => {
  const requestId = ++currentRequestId;

  isLoading.value = true;

  try {
    const res = await attendanceApi.listAttendanceSessions({
      class_instance: classInstance.value,
    });

    if (requestId !== currentRequestId) return;

    calculateSummary(res);

    isLoading.value = false;

    await nextTick();

    createChart(); 
  } catch (err) {
    console.error("Failed to load attendance summary:", err);
  } 
};

watch(
  () => classStore.activeClass,
  (cls) => {
    if (!cls) return;

    classInstance.value = cls.class_instance || null;

    loadAttendance();
  },
  { immediate: true }
);

const refreshData = async () => {
  await loadAttendance();
};


</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>


