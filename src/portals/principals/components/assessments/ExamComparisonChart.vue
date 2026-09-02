<template>
  <section>
    <h2 class="font-serif text-xl mb-6">Trend across recent exams</h2>

    <div class="border border-line rounded-sm bg-white px-6 pt-6 pb-4">
      <div class="relative h-40 flex items-end gap-6">
        <div
          class="absolute left-0 right-0 border-t border-dashed border-ink/25"
          :style="{ bottom: passMark + '%' }"
        >
          <span class="absolute -top-4 right-0 text-xs text-ink/40">pass mark</span>
        </div>

        <div
          v-for="point in points"
          :key="point.exam_id"
          class="flex-1 flex flex-col items-center justify-end h-full relative z-10"
        >
          <span class="font-serif text-sm mb-1">{{ point.average_score }}</span>
          <div
            class="w-8"
            :class="point.average_score >= passMark ? 'bg-signal-good' : 'bg-signal-bad'"
            :style="{ height: point.average_score + '%' }"
          ></div>
        </div>
      </div>

      <div class="flex gap-6 mt-3">
        <span
          v-for="point in points"
          :key="'label-' + point.exam_id"
          class="flex-1 text-center text-xs text-ink/50 truncate"
        >
          {{ point.exam_name }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { getExamComparison } from '../../api/Grades';

const props = defineProps({
  classLevel: { type: [Number, String, null], default: null },
});

const points = ref([]);
const passMark = 50;

const load = async () => {
  const params = {};
  if (props.classLevel) params.class_level = props.classLevel;
  points.value = await getExamComparison(params);
};

watch(() => props.classLevel, load);
onMounted(load);
</script>