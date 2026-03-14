<template>
  <div class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl space-y-6">
 
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-bold text-gray-700">
        Attendance Overview | {{ today }}
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
      
      <div class="flex-1 bg-white p-6 rounded-xl shadow-md flex justify-center items-center">
        <canvas ref="attendanceChartRef" class="max-w-full max-h-[300px]"></canvas>
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
const classLevel = ref("");
const stream = ref("");

const noRecords = computed(() =>
  Object.values(attendanceSummary.value).every((v) => v === 0)
);

const getStoredClassInfo = () => {
 /* const user = JSON.parse(localStorage.getItem("user"));
  classLevel.value = user?.class_level;
  stream.value = user?.stream;*/
  watch(
  () => classStore.activeClass,
  (cls) => {
    if (!cls) return
    classLevel.value = cls.class_level
    stream.value = cls.stream
    loadAttendance()
  },
  { immediate: true }
)
};

const createChart = () => {
  if (!attendanceChartRef.value) return;
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(attendanceChartRef.value, {
    type: "pie",
    data: {
      labels: ["Present", "Late", "Absent", "Excused"],
      datasets: [
        {
          data: Object.values(attendanceSummary.value),
          backgroundColor: ["#34d399", "#fbbf24", "#f87171", "#60a5fa"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        title: {
          display: true,
          text: `Attendance for ${today}`,
          font: { size: 18, weight: "bold" },
        },
      },
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

const loadAttendance = async () => {
  isLoading.value = true;
  try {
    const res = await attendanceApi.listAttendanceSessions({
      class_level: classLevel.value,
      stream: stream.value,
    });
    calculateSummary(res);
    await nextTick();
    setTimeout(createChart, 100);
  } catch (err) {
    console.error("Failed to load attendance summary:", err);
  } finally {
    isLoading.value = false;
  }
};

const refreshData = async () => {
  await loadAttendance();
};

onMounted(async () => {
  getStoredClassInfo();
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  max-height: 300px;
}
</style>

<!--

<template>
<div class="p-4 sm:p-6 space-y-6">

  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

    <h2 class="text-xl sm:text-2xl font-bold text-slate-800">
      Attendance Overview
      <span class="text-slate-500 text-sm font-normal">| {{ today }}</span>
    </h2>

    <button
      @click="refreshData"
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow"
    >
      Refresh
    </button>

  </div>


      <div v-if="isLoading">
        Loading attendance...
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div class="bg-white rounded-xl shadow p-5 border">

          <h3 class="font-semibold text-slate-700 mb-3">
            Attendance Distribution
          </h3>

          <div v-if="noRecords" class="text-center text-slate-400 italic py-10">
            No attendance records found for today
          </div>

          <div v-else class="flex justify-center">
            <canvas ref="attendanceChartRef"></canvas>
          </div>

        </div>

      



    <div class="grid grid-cols-2 gap-4">

      <div
        class="bg-green-50 border border-green-100 rounded-xl p-5 text-center"
      >
        <p class="text-xs uppercase tracking-wide text-green-700">
          Present
        </p>

        <p class="text-3xl font-bold text-green-700 mt-1">
          {{ attendanceSummary.present }}
        </p>
      </div>


      <div
        class="bg-yellow-50 border border-yellow-100 rounded-xl p-5 text-center"
      >
        <p class="text-xs uppercase tracking-wide text-yellow-700">
          Late
        </p>

        <p class="text-3xl font-bold text-yellow-700 mt-1">
          {{ attendanceSummary.late }}
        </p>
      </div>


      <div
        class="bg-red-50 border border-red-100 rounded-xl p-5 text-center"
      >
        <p class="text-xs uppercase tracking-wide text-red-700">
          Absent
        </p>

        <p class="text-3xl font-bold text-red-700 mt-1">
          {{ attendanceSummary.absent }}
        </p>
      </div>


      <div
        class="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center"
      >
        <p class="text-xs uppercase tracking-wide text-blue-700">
          Excused
        </p>

        <p class="text-3xl font-bold text-blue-700 mt-1">
          {{ attendanceSummary.excused }}
        </p>
      </div>

    </div>

  </div>

</div>
</template>



<script setup>
import { ref, onMounted, nextTick, computed, watch, onActivated } from "vue"
import Chart from "chart.js/auto"
import * as attendanceApi from "../../api/attendance"
import { useClassStore } from "@/stores/classStore"

const classStore = useClassStore()

const attendanceChartRef = ref(null)

let chartInstance = null

const attendanceSummary = ref({
  present: 0,
  late: 0,
  absent: 0,
  excused: 0
})

const isLoading = ref(false)

const today = new Date().toISOString().split("T")[0]

const classLevel = ref("")
const stream = ref("")



/* -------------------------
EMPTY CHECK
-------------------------- */

const noRecords = computed(() =>
  Object.values(attendanceSummary.value).every(v => v === 0)
)



const ensureActiveClass = () => {
  if (!classStore.activeClass) {
    classStore.loadInitialClass()
  }
}

const syncFromActiveClass = async (cls) => {
  if (!cls) return
  classLevel.value = cls.class_level
  stream.value = cls.stream
  await loadAttendance()
}

/* -------------------------
WATCH ACTIVE CLASS
-------------------------- */

watch(
  () => classStore.activeClass,
  async (cls) => {
    await syncFromActiveClass(cls)
  },
  { immediate: true }
)



/* -------------------------
CHART
-------------------------- */

const createChart = () => {

  if (!attendanceChartRef.value) return

  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(attendanceChartRef.value, {

    type: "doughnut",

    data: {

      labels: ["Present", "Late", "Absent", "Excused"],

      datasets: [
        {
          data: Object.values(attendanceSummary.value),

          backgroundColor: [
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#3b82f6"
          ],

          borderWidth: 2,
          borderColor: "#ffffff"
        }
      ]

    },

    options: {
      responsive: true,

      plugins: {
        legend: {
          position: "bottom"
        }
      }

    }

  })

}



/* -------------------------
CALCULATE SUMMARY
-------------------------- */

const calculateSummary = (attendance) => {

  const todaySession = attendance.find(a => a.date === today)

  if (!todaySession) {

    attendanceSummary.value = {
      present: 0,
      late: 0,
      absent: 0,
      excused: 0
    }

    return
  }

  const summary = {
    present: 0,
    late: 0,
    absent: 0,
    excused: 0
  }

  for (const record of todaySession.records) {

    switch (record.status) {

      case "PRESENT":
        summary.present++
        break

      case "LATE":
        summary.late++
        break

      case "ABSENT":
        summary.absent++
        break

      case "EXCUSED":
        summary.excused++
        break

    }

  }

  attendanceSummary.value = summary

}



/* -------------------------
LOAD ATTENDANCE
-------------------------- */

const loadAttendance = async () => {

  isLoading.value = true

  try {

    const res = await attendanceApi.listAttendanceSessions({

      class_level: classLevel.value,
      stream: stream.value

    })

    calculateSummary(res)

    await nextTick()

    createChart()

  } catch (err) {

    console.error("Failed to load attendance summary:", err)

  } finally {

    isLoading.value = false

  }

}



/* -------------------------
REFRESH
-------------------------- */

const refreshData = async () => {

  await loadAttendance()

}



/* -------------------------
INIT
-------------------------- */

onMounted(async () => {
  ensureActiveClass()
  if (classStore.activeClass) {
    await syncFromActiveClass(classStore.activeClass)
  }

})

onActivated(async () => {
  ensureActiveClass()
  await syncFromActiveClass(classStore.activeClass)
})
</script>



<style scoped>
canvas{
max-width:100%;
max-height:260px;
}
</style>
-->