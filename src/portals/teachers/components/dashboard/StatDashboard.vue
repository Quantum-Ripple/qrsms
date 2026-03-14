<template>
  <div class="p-6 space-y-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-2xl min-h-screen">
    
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-extrabold text-gray-600">
        <span v-if="classLevel && stream">{{ classLevel }} {{ stream }}</span>
      </h2>

      <div class="relative">
        <button
          @click="toggleNotification"
          class="relative text-gray-700 hover:text-gray-900 transition transform hover:scale-110"
          title="View latest announcement"
        >
          <i class="fas fa-bell text-2xl"></i>
          <span
            v-if="latestAnnouncement"
            class="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
          >
            {{ unreadCount }}
          </span>
        </button>

        <div
          v-if="showNotification && latestAnnouncement"
          class="absolute right-0 mt-3 w-72 bg-white border rounded-2xl shadow-xl p-4 z-10"
        >
          <p class="font-semibold text-gray-800">{{ latestAnnouncement.title }}</p>
          <p class="text-sm text-gray-600 mt-1">{{ latestAnnouncement.message }}</p>
          <p class="text-xs text-gray-400 mt-2 text-right">
            {{ formatDate(latestAnnouncement.created_at) }}
          </p>
        </div>
      </div>
    </div>

  
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div
        class="p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 to-blue-200 transform hover:-translate-y-1 hover:scale-105 transition"
      >
        <p class="uppercase text-gray-700 font-medium tracking-wide">Total Students</p>
        <p class="text-3xl font-extrabold text-blue-800 mt-2">{{ stats.total }}</p>
      </div>

      <div
        class="p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center bg-gradient-to-tr from-green-100 to-green-200 transform hover:-translate-y-1 hover:scale-105 transition"
      >
        <p class="uppercase text-gray-700 font-medium tracking-wide">Boys</p>
        <p class="text-3xl font-extrabold text-green-800 mt-2">{{ stats.boys }}</p>
      </div>

      <div
        class="p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center bg-gradient-to-tr from-pink-100 to-pink-200 transform hover:-translate-y-1 hover:scale-105 transition"
      >
        <p class="uppercase text-gray-700 font-medium tracking-wide">Girls</p>
        <p class="text-3xl font-extrabold text-pink-800 mt-2">{{ stats.girls }}</p>
      </div>
    </div>

    <div class="flex justify-center items-center mt-8 bg-white p-6 rounded-2xl shadow-xl">
      <canvas ref="genderChartRef" class="max-w-full max-h-[320px]"></canvas>
    </div>

    
    <div v-if="stats.total === 0" class="text-center text-gray-500 mt-4 italic">
      No students found for this class.
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import Chart from "chart.js/auto";
import studentsApi from "../../api/Students.js";
import * as eventApi from "../../api/event.js";
import { useClassStore } from "@/stores/classStore"
import { watch } from "vue"

const genderChartRef = ref(null);
const unreadCount = ref(0);
let chartInstance = null;

const classStore = useClassStore()

const stats = ref({ total: 0, boys: 0, girls: 0 });
const latestAnnouncement = ref(null);
const showNotification = ref(false);

const classLevel = ref("");
const stream = ref("");

const getStoredClassInfo = () => {
  /*const user = JSON.parse(localStorage.getItem("user") || "{}");
  classLevel.value = user.class_level || "";
  stream.value = user.stream || "";*/
  watch(
  () => classStore.activeClass,
  (cls) => {
    if (!cls) return
    classLevel.value = cls.class_level
    stream.value = cls.stream
    loadStats()
  },
  { immediate: true }
)
};

const createChart = () => {
  if (!genderChartRef.value) return;
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(genderChartRef.value, {
    type: "pie",
    data: {
      labels: ["Boys", "Girls"],
      datasets: [
        {
          data: [stats.value.boys, stats.value.girls],
          backgroundColor: ["#34d399", "#f472b6"],
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { padding: 20, boxWidth: 18 } },
        title: {
          display: true,
          text: "Gender Distribution",
          font: { size: 18, weight: "bold" },
        },
      },
    },
  });
};

const loadStats = async () => {
  try {
    const res = await studentsApi.filter(classLevel.value, stream.value);
    const boys = res.filter((s) => s.gender === "M").length;
    const girls = res.filter((s) => s.gender === "F").length;
    stats.value = { total: boys + girls, boys, girls };
    await nextTick();
    createChart();
  } catch (err) {
    console.error("Failed to load student stats:", err);
  }
};

const loadAnnouncement = async () => {
  try {
    const res = await eventApi.fetchEvents();
    if (res.length > 0) {
      latestAnnouncement.value = res.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0];
      unreadCount.value = res.length;
    }
  } catch (err) {
    console.error("Failed to load announcements:", err);
  }
};

const toggleNotification = () => {
  showNotification.value = !showNotification.value;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

onMounted(async () => {
  getStoredClassInfo();
  await loadAnnouncement();
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  max-height: 320px;
}
</style>


<!--
<template>
<div class="p-4 sm:p-6 space-y-6">


  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

    <h2 class="text-xl sm:text-2xl font-bold text-slate-800">
      {{ classLevel }} {{ stream }}
    </h2>

    <div class="relative self-end sm:self-auto">

      <button
        @click="toggleNotification"
        class="relative text-slate-600 hover:text-slate-900 transition"
      >
        <i class="fas fa-bell text-xl"></i>

        <span
          v-if="latestAnnouncement"
          class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
        >
          {{ unreadCount }}
        </span>
      </button>

      <div
        v-if="showNotification && latestAnnouncement"
        class="absolute right-0 mt-3 w-72 sm:w-80 bg-white border rounded-xl shadow-xl p-4 z-10"
      >
        <p class="font-semibold text-slate-800">
          {{ latestAnnouncement.title }}
        </p>

        <p class="text-sm text-slate-600 mt-1">
          {{ latestAnnouncement.message }}
        </p>

        <p class="text-xs text-slate-400 mt-2 text-right">
          {{ formatDate(latestAnnouncement.created_at) }}
        </p>
      </div>

    </div>
  </div>



  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

    <div class="bg-white rounded-xl shadow p-5 text-center border">
      <p class="text-xs uppercase tracking-wide text-slate-500">
        Total Students
      </p>

      <p class="text-3xl font-bold text-blue-700 mt-1">
        {{ stats.total }}
      </p>
    </div>


    <div class="bg-white rounded-xl shadow p-5 text-center border">
      <p class="text-xs uppercase tracking-wide text-slate-500">
        Boys
      </p>

      <p class="text-3xl font-bold text-emerald-600 mt-1">
        {{ stats.boys }}
      </p>
    </div>


    <div class="bg-white rounded-xl shadow p-5 text-center border">
      <p class="text-xs uppercase tracking-wide text-slate-500">
        Girls
      </p>

      <p class="text-3xl font-bold text-pink-600 mt-1">
        {{ stats.girls }}
      </p>
    </div>

  </div>



  <div class="bg-white rounded-xl shadow p-5 border">

    <h3 class="font-semibold text-slate-700 mb-3">
      Gender Distribution
    </h3>

    <div class="flex justify-center">
      <canvas ref="genderChartRef" class="max-h-[280px]"></canvas>
    </div>

  </div>



  
  <div
    v-if="stats.total === 0"
    class="text-center text-slate-500 text-sm italic"
  >
    No students found for this class.
  </div>

</div>
</template>



<script setup>
import { ref, onMounted, nextTick, watch, onActivated } from "vue"
import Chart from "chart.js/auto"

import studentsApi from "../../api/Students.js"
import * as eventApi from "../../api/event.js"

import { useClassStore } from "@/stores/classStore"

const classStore = useClassStore()

const genderChartRef = ref(null)
let chartInstance = null

const stats = ref({ total: 0, boys: 0, girls: 0 })

const latestAnnouncement = ref(null)
const unreadCount = ref(0)
const showNotification = ref(false)

const classLevel = ref("")
const stream = ref("")



const ensureActiveClass = () => {
  if (!classStore.activeClass) {
    classStore.loadInitialClass()
  }
}

const syncFromActiveClass = async (cls) => {
  if (!cls) return
  classLevel.value = cls.class_level
  stream.value = cls.stream
  await loadStats()
}

/* -----------------------------
WATCH ACTIVE CLASS
------------------------------ */

watch(
  () => classStore.activeClass,
  async (cls) => {
    if (!cls) return
    await syncFromActiveClass(cls)
  },
  { immediate: true }
)



/* -----------------------------
CHART
------------------------------ */

const createChart = () => {

  if (!genderChartRef.value) return

  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(genderChartRef.value, {

    type: "doughnut",

    data: {
      labels: ["Boys", "Girls"],
      datasets: [
        {
          data: [stats.value.boys, stats.value.girls],
          backgroundColor: ["#10b981", "#ec4899"],
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



/* -----------------------------
LOAD STUDENT STATS
------------------------------ */

const loadStats = async () => {

  if (!classLevel.value || !stream.value) return

  try {

    const res = await studentsApi.filter(
      classLevel.value,
      stream.value
    )

    const boys = res.filter(s => s.gender === "M").length
    const girls = res.filter(s => s.gender === "F").length

    stats.value = {
      total: boys + girls,
      boys,
      girls
    }

    await nextTick()
    createChart()

  } catch (err) {

    console.error("Failed to load student stats:", err)

  }

}



/* -----------------------------
ANNOUNCEMENTS
------------------------------ */

const loadAnnouncement = async () => {

  try {

    const res = await eventApi.fetchEvents()

    if (res.length > 0) {

      latestAnnouncement.value = res.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0]

      unreadCount.value = res.length

    }

  } catch (err) {

    console.error("Failed to load announcements:", err)

  }

}



/* -----------------------------
HELPERS
------------------------------ */

const toggleNotification = () => {
  showNotification.value = !showNotification.value
}

const formatDate = (dateStr) => {

  const date = new Date(dateStr)

  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  })

}



/* -----------------------------
INIT
------------------------------ */

onMounted(async () => {
  ensureActiveClass()
  await loadAnnouncement()

})

onActivated(async () => {

  ensureActiveClass()

  if (classStore.activeClass) {
    await syncFromActiveClass(classStore.activeClass)
  }

})
</script>
-->