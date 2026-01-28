<template>
  <div>
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div
        class="w-10 h-10 flex items-center justify-center rounded-lg bg-green-100 text-green-700 text-xl"
      >
        🌱
      </div>
      <div>
        <h2 class="text-xl font-semibold text-gray-800">
          Biology Virtual Labs
        </h2>
        <p class="text-sm text-gray-600">
          Discover life, cells, and living systems
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center gap-3 text-gray-500 text-sm"
    >
      <span class="animate-pulse">🧫</span>
      Loading experiments...
    </div>

    <!-- Empty State -->
    <div
      v-else-if="simulations.length === 0"
      class="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center"
    >
      <p class="text-gray-600 text-sm">
        No biology labs available for your class yet.
      </p>
    </div>

    <!-- Cards -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="sim in simulations"
        :key="sim.id"
        class="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm
               hover:shadow-lg hover:-translate-y-1 transition"
      >
        <div class="flex items-center justify-between mb-3">
          <span
            class="text-xs font-medium px-3 py-1 rounded-full
                   bg-green-100 text-green-700"
          >
            Biology
          </span>
          <span class="text-lg">🧠</span>
        </div>

        <h3 class="font-semibold text-gray-800 mb-2">
          {{ sim.name }}
        </h3>

        <p class="text-sm text-gray-600 mb-5 line-clamp-3">
          {{ sim.description }}
        </p>

        <button
          @click="openSimulation(sim)"
          class="w-full py-2 rounded-lg text-sm font-medium
                 bg-green-600 text-white
                 hover:bg-green-700 transition"
        >
          Open Lab 🚀
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="activeSimulation"
      class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
    >
      <div
        class="bg-white w-[96%] h-[92%] rounded-2xl overflow-hidden relative"
      >
        <button
          @click="activeSimulation = null"
          class="absolute top-3 right-4 text-gray-600 text-xl"
        >
          ✕
        </button>

        <iframe
          :src="activeSimulation.embed_url"
          class="w-full h-full border-none"
          allowfullscreen
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getSimulations } from "../../api/simulations";

const simulations = ref([]);
const loading = ref(false);
const activeSimulation = ref(null);

const user = JSON.parse(localStorage.getItem("user") || "{}");
const classLevel = user.class_level;

const openSimulation = (sim) => {
  activeSimulation.value = sim;
};

onMounted(async () => {
  if (!classLevel) return;

  loading.value = true;
  try {
    simulations.value = await getSimulations("BIO", classLevel);
  } finally {
    loading.value = false;
  }
});
</script>
