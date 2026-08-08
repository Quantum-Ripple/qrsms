<template>
  <div class="rounded-xl bg-white p-4 shadow">
    <div class="flex items-center justify-between gap-4 mb-4">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">Attendance Records</h2>
        <p class="text-sm text-gray-500">Filtered records shown by class, stream, and date range.</p>
      </div>
      <div class="text-sm text-slate-500">{{ rows.length }} record(s)</div>
    </div>

    <div v-if="loading" class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-600">Loading attendance data...</div>
    <div v-else-if="!rows.length" class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-600">No attendance records found for the selected filters.</div>

    <div v-else class="overflow-x-auto">
      <table id="attendancePrintTable" class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th class="px-4 py-3">Date</th>
            <th class="px-4 py-3">Class Level</th>
            <th class="px-4 py-3">Stream</th>
            <th class="px-4 py-3">Present</th>
            <th class="px-4 py-3">Absent</th>
            <th class="px-4 py-3">Excused</th>
            <th class="px-4 py-3">Late</th>
            <th class="px-4 py-3">Total Records</th>
            <th class="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 bg-white">
          <tr v-for="row in rows" :key="row.key" class="hover:bg-slate-50">
            <td class="px-4 py-3 whitespace-nowrap">{{ row.date }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ row.class_level }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ row.stream }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ row.present }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ row.absent }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ row.excused }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ row.late }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ row.total_records }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ row.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
</script>
