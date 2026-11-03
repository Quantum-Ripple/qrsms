<template>
  <div>
    <!-- Desktop -->
    <div class="hidden overflow-x-auto rounded border md:block">
      <table class="w-full border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-left">Term</th>
            <th class="p-3 text-right">Billed</th>
            <th class="p-3 text-right">Paid</th>
            <th class="p-3 text-right">Balance</th>
            <th class="p-3 text-left">Status</th>
            <th class="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in invoices" :key="inv.id" class="border-t hover:bg-gray-50">
            <td class="p-3">{{ termText(inv) }}</td>
            <td class="p-3 text-right">{{ formatCurrency(inv.amount_due) }}</td>
            <td class="p-3 text-right">{{ formatCurrency(inv.amount_paid) }}</td>
            <td class="p-3 text-right font-medium">
              <span v-if="inv.is_overpaid" class="text-blue-700">+{{ formatCurrency(inv.overpaid_amount) }} over</span>
              <span v-else>{{ formatCurrency(balanceOf(inv)) }}</span>
            </td>
            <td class="p-3">
              <span class="rounded px-2 py-0.5 text-xs font-medium" :class="statusClass(inv)">{{ statusLabel(inv) }}</span>
            </td>
            <td class="space-x-3 p-3 text-center whitespace-nowrap">
              <button v-if="kind === 'fee'" @click="$emit('view', inv.id)" class="text-blue-600 hover:underline">View</button>
              <button v-if="canApply(inv)" @click="$emit('apply', `${kind}:${inv.id}`)" class="text-green-700 hover:underline">
                Apply credit
              </button>
            </td>
          </tr>
          <tr v-if="!invoices.length">
            <td colspan="6" class="p-4 text-center text-gray-500">{{ emptyText }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile -->
    <div class="space-y-3 md:hidden">
      <article v-for="inv in invoices" :key="inv.id" class="rounded-lg border bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <h3 class="min-w-0 break-words font-semibold text-gray-900">{{ termText(inv) }}</h3>
          <span class="shrink-0 rounded px-2 py-0.5 text-xs font-medium" :class="statusClass(inv)">{{ statusLabel(inv) }}</span>
        </div>

        <dl class="mt-3 grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt class="text-gray-500">Billed</dt>
            <dd class="mt-0.5 font-medium text-gray-800">{{ formatCurrency(inv.amount_due) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Paid</dt>
            <dd class="mt-0.5 font-medium text-gray-800">{{ formatCurrency(inv.amount_paid) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Balance</dt>
            <dd class="mt-0.5 font-semibold" :class="inv.is_overpaid ? 'text-blue-700' : 'text-gray-900'">
              {{ inv.is_overpaid ? '+' + formatCurrency(inv.overpaid_amount) : formatCurrency(balanceOf(inv)) }}
            </dd>
          </div>
        </dl>

        <div v-if="kind === 'fee' || canApply(inv)" class="mt-4 grid grid-cols-2 gap-2">
          <button
            v-if="kind === 'fee'"
            @click="$emit('view', inv.id)"
            class="rounded border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            View invoice
          </button>
          <button
            v-if="canApply(inv)"
            @click="$emit('apply', `${kind}:${inv.id}`)"
            class="rounded border border-green-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
          >
            Apply credit
          </button>
        </div>
      </article>

      <div v-if="!invoices.length" class="rounded-lg border bg-white p-6 text-center text-gray-500">{{ emptyText }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  invoices: { type: Array, default: () => [] },
  kind: { type: String, default: 'fee' }, // 'fee' | 'transport'
  credit: { type: Number, default: 0 },
  emptyText: { type: String, default: 'No invoices for this term.' },
})
defineEmits(['view', 'apply'])

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(Number(v || 0))

const balanceOf = (inv) => Number(inv.balance_due ?? inv.balance ?? Number(inv.amount_due || 0) - Number(inv.amount_paid || 0))
const termText = (inv) => inv.term_name ?? inv.term ?? ''
const canApply = (inv) => props.credit > 0 && balanceOf(inv) > 0 && !inv.is_overpaid

const statusLabel = (inv) => (inv.is_overpaid ? 'Overpaid' : inv.is_fully_paid ? 'Paid' : 'Pending')
const statusClass = (inv) =>
  inv.is_overpaid
    ? 'bg-blue-100 text-blue-700'
    : inv.is_fully_paid
      ? 'bg-green-100 text-green-700'
      : 'bg-yellow-100 text-yellow-700'
</script>