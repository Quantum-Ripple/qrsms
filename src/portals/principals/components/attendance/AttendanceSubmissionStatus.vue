<template>
  <div class="rounded-xl bg-white p-4 shadow mb-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <p class="text-sm text-gray-500">Today's Attendance Submission</p>
        <p class="mt-1 text-sm text-slate-700">Shows all active class instances and whether they have submitted attendance for today.</p>
      </div>
      <div class="text-xs uppercase tracking-[0.12em] text-slate-500">Updated on {{ todayDate }}</div>
    </div>

    <div v-if="items.length" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th class="px-4 py-3">Class Instance</th>
            <th class="px-4 py-3">Class Level</th>
            <th class="px-4 py-3">Stream</th>
            <th class="px-4 py-3">Submission</th>
            <th class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 bg-white">
          <tr v-for="item in items" :key="item.key" class="hover:bg-slate-50">
            <td class="px-4 py-3">{{ item.label }}</td>
            <td class="px-4 py-3">{{ item.class_level }}</td>
            <td class="px-4 py-3">{{ item.stream }}</td>
            <td class="px-4 py-3">
              <span :class="item.status === 'Submitted' ? 'text-emerald-600' : 'text-amber-600'">{{ item.status }}</span>
            </td>
            <td class="px-4 py-3">
              <button
                v-if="item.status === 'Submitted' && item.sessionId"
                @click="$emit('view', item.sessionId)"
                class="rounded-lg bg-blue-600 px-3 py-1.5 text-white text-xs hover:bg-blue-700"
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="rounded-xl border border-slate-200 p-6 text-center text-slate-500">No submission status available for today.</div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
  todayDate: { type: String, required: true },
})

defineEmits(['view'])
</script>
