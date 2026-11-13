<script setup>
import { computed } from 'vue'
import { formatAccount, paymentSteps, SAMPLE_ADMISSION } from '@/utils/PaymentSteps'

// Pass `modes` to show the list screen, or `mode` to show one mode's detail screen.
const props = defineProps({
  modes: { type: Array, default: () => [] },
  mode: { type: Object, default: null },
})

const activeModes = computed(() => props.modes.filter((m) => m.is_active))

const rows = computed(() => {
  const m = props.mode
  if (!m) return []
  if (m.kind === 'paybill') {
    return [
      ['Business number', m.business_number || '—'],
      ['Account number', formatAccount(m)],
    ]
  }
  if (m.kind === 'till') {
    return [['Till number', m.business_number || '—']]
  }
  if (m.kind === 'bank') {
    return [
      ['Bank', [m.bank_name, m.branch].filter(Boolean).join(', ') || '—'],
      ['Account name', m.account_name || '—'],
      ['Account number', m.account_number || '—'],
      ['Reference', SAMPLE_ADMISSION],
    ]
  }
  return []
})

const steps = computed(() => (props.mode ? paymentSteps(props.mode) : []))
</script>

<template>
  <div class="w-[300px] shrink-0 rounded-[36px] border-8 border-slate-900 bg-slate-50 p-4 space-y-3">
    <p class="text-base font-bold text-slate-900">How to pay</p>

    <!-- Detail of one mode -->
    <template v-if="mode">
      <p class="text-sm font-semibold text-slate-900">{{ mode.name || 'New payment mode' }}</p>

      <div v-if="rows.length" class="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
        <div v-for="[label, value] in rows" :key="label">
          <p class="text-[11px] text-slate-600">{{ label }}</p>
          <p class="text-[15px] font-bold text-slate-900 break-all">{{ value }}</p>
        </div>
      </div>

      <ol v-if="steps.length" class="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
        <li v-for="(s, i) in steps" :key="i" class="flex gap-2 text-xs leading-snug text-slate-900">
          <span class="font-bold text-emerald-700">{{ i + 1 }}</span>
          <span>{{ s }}</span>
        </li>
      </ol>
    </template>

    <!-- List of active modes -->
    <template v-else>
      <p v-if="!activeModes.length" class="text-xs text-slate-600">No payment modes are switched on.</p>
      <div
        v-for="m in activeModes"
        :key="m.id"
        class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-semibold text-slate-900"
      >
        <span class="h-7 w-7 rounded-lg bg-emerald-100" />
        {{ m.name }}
      </div>
    </template>
  </div>
</template>