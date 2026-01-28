<template>
  <div class="p-4 sm:p-6 max-w-7xl mx-auto">
    <!-- Page Title -->
    <h1 class="text-2xl font-semibold text-gray-800 mb-4">
      Virtual Labs
    </h1>

    <!-- Subject Navigation -->
    <div
      class="grid grid-cols-3 text-center border-b border-gray-200 mb-6"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="py-3 text-sm sm:text-base font-medium transition"
        :class="
          activeTab === tab.key
            ? 'border-b-2 border-emerald-600 text-emerald-600'
            : 'text-gray-500 hover:text-gray-700'
        "
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content Area -->
    <div>
      <!-- Guidance -->
      <div
        v-if="activeTab === 'help'"
        class="bg-gray-50 border border-gray-200 rounded-lg p-5 max-w-3xl"
      >
        <h2 class="text-lg font-semibold text-gray-800 mb-2">
          How to use Virtual Labs
        </h2>

        <ul class="list-disc ml-5 space-y-2 text-sm text-gray-700">
          <li>Select a subject above (Physics, Chemistry, or Biology).</li>
          <li>Choose a simulation related to your class level.</li>
          <li>Interact with the experiment directly on the screen.</li>
          <li>Use the lab to better understand what you learn in class.</li>
        </ul>

        <p class="mt-4 text-sm text-gray-600">
          These simulations are safe, interactive, and can be used as many times
          as you like.
        </p>
      </div>

      <!-- Labs -->
      <PhysicsLab v-else-if="activeTab === 'physics'" />
      <ChemistryLab v-else-if="activeTab === 'chemistry'" />
      <BiologyLab v-else-if="activeTab === 'biology'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

import PhysicsLab from "../components/simulations/PhysicsLab.vue";
import ChemistryLab from "../components/simulations/ChemistryLab.vue";
import BiologyLab from "../components/simulations/BiologyLab.vue";

const activeTab = ref("help");

const tabs = [
  { key: "physics", label: "Physics" },
  { key: "chemistry", label: "Chemistry" },
  { key: "biology", label: "Biology" },
];
</script>
