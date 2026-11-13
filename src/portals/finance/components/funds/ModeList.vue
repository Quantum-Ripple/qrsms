<script setup>
defineProps({
  modes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
defineEmits(['add', 'edit', 'toggle', 'remove', 'move'])

const ITEM_LABELS = {
  fees: 'School fees',
  transport: 'Transport',
  uniform: 'Uniform',
  other: 'Other charges',
}
const KIND_LABELS = {
  app: 'In-app',
  paybill: 'Paybill',
  till: 'Buy Goods till',
  bank: 'Bank',
  other: 'Cash or other',
}

function details(m) {
  if (m.kind === 'paybill') return `Business no. ${m.business_number}`
  if (m.kind === 'till') return `Till no. ${m.business_number}`
  if (m.kind === 'bank') return `${m.bank_name} · ${m.account_number}`
  if (m.kind === 'app') return 'M-Pesa prompt to the parent phone'
  return m.steps?.[0] || 'Instructions only'
}

function appliesTo(m) {
  if (!m.applies_to?.length) return 'All fee items'
  return m.applies_to.map((c) => ITEM_LABELS[c] || c).join(', ')
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden">
    <!-- Loading skeleton -->
    <div v-if="loading" class="divide-y divide-slate-200">
      <div v-for="n in 4" :key="n" class="p-5 flex items-center gap-4 animate-pulse">
        <div class="h-4 w-40 rounded bg-slate-200" />
        <div class="h-4 flex-1 rounded bg-slate-100" />
        <div class="h-6 w-11 rounded-full bg-slate-200" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!modes.length" class="p-10 text-center space-y-3">
      <p class="text-base font-semibold text-slate-900">No payment modes yet</p>
      <p class="text-sm text-slate-600">Add the ways your school accepts payment so parents know how to pay.</p>
      <button
        class="h-11 px-5 rounded-xl border border-emerald-700 text-emerald-700 text-sm font-semibold hover:bg-emerald-50"
        @click="$emit('add')"
      >
        Add your first payment mode
      </button>
    </div>

    <!-- Rows -->
    <ul v-else class="divide-y divide-slate-200">
      <li
        v-for="(m, i) in modes"
        :key="m.id"
        class="p-4 sm:px-5 flex flex-wrap items-center gap-x-4 gap-y-3"
      >
        <!-- Order -->
        <div class="flex flex-col">
          <button
            class="h-5 w-8 text-slate-500 hover:text-slate-900 disabled:opacity-30"
            :disabled="i === 0"
            :aria-label="`Move ${m.name} up`"
            @click="$emit('move', { mode: m, dir: -1 })"
          >
            &#9650;
          </button>
          <button
            class="h-5 w-8 text-slate-500 hover:text-slate-900 disabled:opacity-30"
            :disabled="i === modes.length - 1"
            :aria-label="`Move ${m.name} down`"
            @click="$emit('move', { mode: m, dir: 1 })"
          >
            &#9660;
          </button>
        </div>

        <!-- Name + type -->
        <div class="w-48">
          <p class="text-[15px] font-semibold text-slate-900" :class="{ 'opacity-50': !m.is_active }">{{ m.name }}</p>
          <p class="text-xs text-slate-600">{{ KIND_LABELS[m.kind] }}</p>
        </div>

        <!-- Details + applies to -->
        <div class="flex-1 min-w-[180px]">
          <p class="text-sm text-slate-600">{{ details(m) }}</p>
          <p class="text-xs text-slate-500 mt-0.5">{{ appliesTo(m) }}</p>
        </div>

        <!-- Visible switch -->
        <button
          role="switch"
          :aria-checked="m.is_active"
          :aria-label="`Show ${m.name} to parents`"
          class="relative h-6 w-11 rounded-full transition-colors"
          :class="m.is_active ? 'bg-emerald-700' : 'bg-slate-300'"
          @click="$emit('toggle', m)"
        >
          <span
            class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform"
            :class="m.is_active ? 'translate-x-5' : ''"
          />
        </button>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            class="h-10 px-4 rounded-lg border border-emerald-700 text-emerald-700 text-sm font-semibold hover:bg-emerald-50"
            @click="$emit('edit', m)"
          >
            Edit
          </button>
          <button
            class="h-10 px-3 rounded-lg text-sm font-semibold text-red-700 hover:bg-red-50"
            @click="$emit('remove', m)"
          >
            Delete
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>