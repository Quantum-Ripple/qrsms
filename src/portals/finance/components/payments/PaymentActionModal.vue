<template>
  <div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" @click.self="$emit('close')">
    <form
      class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:max-w-lg sm:rounded-lg sm:p-6"
      @submit.prevent="submit"
    >
      <h2 class="text-lg font-semibold">{{ title }}</h2>
      <p class="text-sm text-gray-500">
        Payment #{{ payment.id }} · {{ payment.full_name }} · {{ formatCurrency(payment.amount) }}
      </p>

      <p class="mt-3 rounded border bg-gray-50 p-3 text-sm text-gray-700">{{ explainer }}</p>

      <div class="mt-4 space-y-4">
        <!-- Reallocate -->
        <div v-if="mode === 'reallocate'" class="space-y-3">
          <p v-if="loadingTargets" class="text-sm text-gray-500">Loading invoices...</p>

          <div v-for="(row, i) in rows" :key="i" class="grid grid-cols-1 gap-2 rounded border p-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600" :for="`ra-t-${i}`">Invoice</label>
              <select :id="`ra-t-${i}`" v-model="row.target" class="w-full rounded border px-3 py-2">
                <option value="" disabled>Select invoice</option>
                <option v-for="t in targets" :key="t.key" :value="t.key">{{ t.label }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600" :for="`ra-a-${i}`">Amount</label>
              <input :id="`ra-a-${i}`" v-model="row.amount" type="number" min="0.01" step="0.01" class="w-full rounded border px-3 py-2" />
            </div>
            <button type="button" @click="rows.splice(i, 1)" class="rounded border px-3 py-2 text-sm text-red-700 hover:bg-red-50">Remove</button>
          </div>

          <button type="button" @click="rows.push({ target: '', amount: '' })" class="text-sm text-blue-600 hover:underline">
            Add another invoice
          </button>

          <dl class="grid grid-cols-2 gap-2 rounded border p-3 text-sm">
            <div>
              <dt class="text-gray-500">Allocated</dt>
              <dd class="font-medium">{{ formatCurrency(allocatedTotal) }}</dd>
            </div>
            <div>
              <dt class="text-gray-500">Becomes credit</dt>
              <dd class="font-medium" :class="remainder < 0 ? 'text-red-700' : ''">{{ formatCurrency(remainder) }}</dd>
            </div>
          </dl>
        </div>

        <!-- Transfer -->
        <template v-if="mode === 'transfer'">
          <StudentSelect v-model="recipient" :students="students" :exclude-id="payment.student_id" label="Move to student" input-id="tr-student" />
          <div>
            <label class="mb-1 block text-sm font-medium" for="tr-target">Apply to (optional)</label>
            <select id="tr-target" v-model="transferTarget" :disabled="!recipient || loadingTargets" class="w-full rounded border px-3 py-2">
              <option value="">School's allocation rule</option>
              <option v-for="t in targets" :key="t.key" :value="t.key">{{ t.label }}</option>
            </select>
          </div>
        </template>

        <div>
          <label class="mb-1 block text-sm font-medium" for="pa-reason">Reason</label>
          <textarea id="pa-reason" v-model.trim="reason" rows="2" required class="w-full rounded border px-3 py-2" :placeholder="reasonHint"></textarea>
        </div>
      </div>

      <p v-if="error" class="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>

      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" @click="$emit('close')" class="w-full rounded border px-4 py-2 hover:bg-gray-50 sm:w-auto">Cancel</button>
        <button
          type="submit"
          :disabled="saving"
          class="w-full rounded px-4 py-2 text-white disabled:opacity-60 sm:w-auto"
          :class="mode === 'reverse' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
        >
          {{ saving ? 'Saving...' : submitLabel }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  reversePayment,
  reallocatePayment,
  transferPayment,
  getPaymentById,
  getInvoiceTargets,
  targetPayload,
} from '../../api/payment'
import { errorMessage } from '../../api/charge'
import StudentSelect from './StudentSelect.vue'

const props = defineProps({
  mode: { type: String, required: true }, // 'reverse' | 'reallocate' | 'transfer'
  payment: { type: Object, required: true }, // a row from GET /payments/
  students: { type: Array, default: () => [] },
})
const emit = defineEmits(['close', 'done'])

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(Number(v || 0))

const reason = ref('')
const saving = ref(false)
const error = ref('')
const loadingTargets = ref(false)
const targets = ref([])

// reallocate
const rows = ref([{ target: '', amount: '' }])
const allocatedTotal = computed(() => rows.value.reduce((n, r) => n + Number(r.amount || 0), 0))
const remainder = computed(() => Number(props.payment.amount) - allocatedTotal.value)

// transfer
const recipient = ref('')
const transferTarget = ref('')

const title = computed(
  () => ({ reverse: 'Reverse payment', reallocate: 'Reallocate payment', transfer: 'Transfer payment' }[props.mode]),
)
const submitLabel = computed(
  () => ({ reverse: 'Reverse payment', reallocate: 'Save allocation', transfer: 'Transfer payment' }[props.mode]),
)
const explainer = computed(
  () =>
    ({
      reverse: "Marks this payment as reversed and puts the invoice balances back. The record stays in the history and can't be deleted.",
      reallocate: "Changes where this same payment is applied. Anything you don't allocate becomes credit for the student. Leave the list empty to release it all to credit.",
      transfer: "Reverses this payment and records a new one for the other student with the same amount, method, reference and date.",
    }[props.mode]),
)
const reasonHint = computed(
  () =>
    ({
      reverse: 'e.g. Duplicate payment entry',
      reallocate: 'e.g. Move payment to the correct term',
      transfer: 'e.g. Recorded under the wrong student',
    }[props.mode]),
)

const loadTargets = async (studentId) => {
  loadingTargets.value = true
  targets.value = []
  try {
    targets.value = await getInvoiceTargets(studentId)
  } catch {
    targets.value = []
  } finally {
    loadingTargets.value = false
  }
}

onMounted(async () => {
  if (props.mode !== 'reallocate') return
  await loadTargets(props.payment.student_id)
  // Pre-fill with the current allocations when the detail exposes them
  try {
    const detail = await getPaymentById(props.payment.id, { include_reversed: 1 })
    const existing = (detail.allocations ?? [])
      .map((a) => {
        const feeId = a.invoice ?? a.invoice_id
        const transportId = a.transport_invoice ?? a.transport_invoice_id
        const target = feeId ? `fee:${feeId}` : transportId ? `transport:${transportId}` : ''
        return { target, amount: a.amount != null ? String(Number(a.amount)) : '' }
      })
      .filter((r) => r.target)
    if (existing.length) rows.value = existing
  } catch {
    /* keep the empty row */
  }
})

watch(recipient, (id) => {
  transferTarget.value = ''
  if (id) loadTargets(id)
  else targets.value = []
})

const submit = async () => {
  error.value = ''
  if (!reason.value) {
    error.value = 'Give a reason. It is kept with the payment history.'
    return
  }
  saving.value = true
  try {
    if (props.mode === 'reverse') {
      await reversePayment(props.payment.id, reason.value)
      emit('done', `Payment #${props.payment.id} reversed.`)
    } else if (props.mode === 'reallocate') {
      const filled = rows.value.filter((r) => r.target || r.amount)
      const keys = filled.map((r) => r.target)
      if (filled.some((r) => !r.target || !(Number(r.amount) > 0))) {
        error.value = 'Each line needs an invoice and an amount above zero.'
        return
      }
      if (new Set(keys).size !== keys.length) {
        error.value = 'Each invoice can only appear once.'
        return
      }
      if (remainder.value < 0) {
        error.value = 'The allocations add up to more than the payment.'
        return
      }
      await reallocatePayment(props.payment.id, {
        reason: reason.value,
        allocations: filled.map((r) => ({ ...targetPayload(r.target), amount: String(r.amount) })),
      })
      emit('done', `Payment #${props.payment.id} reallocated.`)
    } else {
      if (!recipient.value) {
        error.value = 'Choose the student who should receive this payment.'
        return
      }
      await transferPayment(props.payment.id, {
        student: recipient.value,
        reason: reason.value,
        ...targetPayload(transferTarget.value),
      })
      emit('done', `Payment #${props.payment.id} transferred.`)
    }
  } catch (err) {
    error.value =
      err?.response?.status === 403
        ? "Your role can't change payments. Ask an admin, bursar or principal."
        : errorMessage(err)
  } finally {
    saving.value = false
  }
}
</script>