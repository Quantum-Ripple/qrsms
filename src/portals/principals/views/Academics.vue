<script setup>
import { ref, watch } from "vue";
import { getClassPerformance, getRankings } from "../api/analytics";

import FiltersBar from "../components/analytics/FiltersBar.vue";
import ClassOverview from "../components/analytics/ClassOverview.vue";
import RankingsTable from "../components/analytics/RankingsTable.vue";

const filters = ref({
  exam: null,
  class_level: null,
  subject: null,
});

const classData = ref(null);
const rankings = ref([]);

const loading = ref(false);

const fetchData = async () => {
  if (!filters.value.exam || !filters.value.class_level) return;

  loading.value = true;

  try {
    const [classRes, rankingRes] = await Promise.all([
      getClassPerformance(filters.value),
      getRankings(filters.value),
    ]);

    classData.value = classRes.data;
    rankings.value = rankingRes.data;
  } finally {
    loading.value = false;
  }
};

watch(filters, fetchData, { deep: true });
</script>

<template>
  <div class="p-4 space-y-6">
    <FiltersBar v-model="filters" />

    <div v-if="loading" class="text-gray-500">Loading...</div>

    <ClassOverview v-if="classData" :data="classData" />

    <RankingsTable v-if="rankings.length" :data="rankings" />
  </div>
</template>