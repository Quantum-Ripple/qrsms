<template>
  <div class="space-y-4 text-sm">
    <div v-if="row.issues?.length" class="rounded border border-amber-200 bg-amber-50 p-3 text-amber-800">
      <p class="font-medium">Needs attention</p>
      <ul class="mt-1 list-disc space-y-0.5 pl-5">
        <li v-for="(issue, i) in row.issues" :key="i">{{ issueText(issue) }}</li>
      </ul>
    </div>

    <div>
      <p class="mb-1 font-medium text-gray-700">Bill lines</p>
      <ul class="divide-y rounded border bg-white">
        <li
          v-for="(line, i) in row.lines"
          :key="i"
          class="flex items-start justify-between gap-3 p-2.5"
        >
          <div class="min-w-0">
            <div class="break-words text-gray-900">{{ line.description }}</div>
            <div class="text-xs text-gray-500">
              {{ [line.type, line.origin, line.reason ?? line.reaason].filter(Boolean).join(' · ') }}
            </div>
          </div>
          <span
            class="shrink-0 font-medium"
            :class="Number(line.amount) < 0 ? 'text-green-700' : 'text-gray-900'"
          >
            {{ formatCurrency(line.amount) }}
          </span>
        </li>
        <li v-if="!row.lines?.length" class="p-3 text-center text-gray-500">No lines on this bill yet.</li>
      </ul>
    </div>

    <div v-if="row.removed?.length">
      <p class="mb-1 font-medium text-gray-700">Removed for this student</p>
      <ul class="divide-y rounded border bg-white">
        <li
          v-for="(line, i) in row.removed"
          :key="i"
          class="flex items-start justify-between gap-3 p-2.5 text-gray-500"
        >
          <span class="min-w-0 break-words line-through">{{ line.description }}</span>
          <span class="shrink-0">{{ formatCurrency(line.amount) }}</span>
        </li>
      </ul>
    </div>

    <dl class="grid grid-cols-2 gap-2 rounded border bg-white p-3 sm:grid-cols-4">
      <div>
        <dt class="text-gray-500">Total</dt>
        <dd class="font-medium">{{ formatCurrency(row.total) }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">Discounts</dt>
        <dd class="font-medium">{{ formatCurrency(row.discount_total) }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">Credit applied</dt>
        <dd class="font-medium">{{ formatCurrency(row.credit_applied) }}</dd>
      </div>
      <div>
        <dt class="text-gray-500">Net payable</dt>
        <dd class="font-semibold">{{ formatCurrency(row.net_payable) }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup>
defineProps({
  row: { type: Object, required: true },
})

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

// issues may be strings or objects depending on the backend
const issueText = (issue) =>
  typeof issue === 'string' ? issue : issue.detail ?? issue.message ?? JSON.stringify(issue)
</script>