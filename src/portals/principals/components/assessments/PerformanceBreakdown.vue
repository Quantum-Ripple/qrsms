<template>
  <section>
    <h2 class="font-serif text-xl mb-4">{{ title }}</h2>

    <div class="divide-y divide-line border-t border-b border-line">
      <div
        v-for="(row, i) in sortedRows"
        :key="row[nameKey]"
        class="flex items-center gap-4 py-3"
      >
        <span
          class="font-serif text-sm w-5 text-right"
          :class="i === 0 ? 'text-gold' : 'text-ink/40'"
        >
          {{ i + 1 }}
        </span>

        <div class="w-32 shrink-0">
          <div class="text-sm font-medium">{{ row[nameKey] }}</div>
          <div class="text-xs text-ink/50">{{ row.student_count }} students · {{ row.pass_rate }}% pass</div>
        </div>

        <div class="flex-1 h-[3px] bg-line/70 relative">
          <div
            class="absolute inset-y-0 left-0"
            :class="barColor(row.average_score)"
            :style="{ width: Math.min(row.average_score, 100) + '%' }"
          ></div>
        </div>

        <span class="w-14 text-right font-serif text-sm tabular-nums">{{ row.average_score }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  rows: { type: Array, default: () => [] },
  nameKey: { type: String, required: true },
});

const sortedRows = computed(() =>
  [...props.rows].sort((a, b) => b.average_score - a.average_score)
);

const barColor = (score) => {
  if (score >= 70) return 'bg-signal-good';
  if (score < 50) return 'bg-signal-bad';
  return 'bg-gold';
};
</script>