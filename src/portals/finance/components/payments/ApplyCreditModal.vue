<template>
  <div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" @click.self="$emit('close')">
    <form
      class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:max-w-md sm:rounded-lg sm:p-6"
      @submit.prevent="submit"
    >
      <h2 class="text-lg font-semibold">Apply credit</h2>
      <p class="text-sm text-gray-500">{{ studentLabel }} · {{ formatCurrency(credit) }} available</p>

      <div class="mt-4 space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium" for="ac-target">Apply to</label>
          <select id="ac-target" v-model="target" class="w-full rounded border px-3 py-2">
            <option value="">School's allocation rule</option>
            <option v-for="t in targets" :key="t.key" :value="t.key">{{ t.label }}</option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium" for="ac-amount">Amount (optional)</label>
          <input
            id="ac-amount"
            v-model="amount"
            type="number"
            min="0.01"
            step="0.01"
            inputmode="decimal"
            class="w-full rounded border px-3 py-2"
            :placeholder="maxHint ? `Up to ${maxHint}` : 'As much as possible'"
          />
          <p class="mt-1 text-xs text-gray-500">
            Leave blank to apply as much as the credit and the invoice balance allow.
          </p>
        </div>
      </div>

      <p v-if="error" class="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>

      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" @click="$emit('close')" class="w-full rounded border px-4 py-2 hover:bg-gray-50 sm:w-auto">Cancel</button>
        <button type="submit" :disabled="saving" class="w-full rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800 disabled:opacity-60 sm:w-auto">
          {{ saving ? 'Applying...' : 'Apply credit' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { applyCredit, targetPayload } from '../../api/payment'
import { errorMessage } from '../../api/charge'

const props = defineProps({
  studentId: { type: [Number, String], required: true },
  studentLabel: { type: String, default: '' },
  credit: { type: Number, default: 0 },
  targets: { type: Array, default: () => [] }, // [{ key, label, balance }] with an open balance
  initialTarget: { type: String, default: '' },
})
const emit = defineEmits(['close', 'done'])

const target = ref(props.initialTarget)
const amount = ref('')
const saving = ref(false)
const error = ref('')

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(Number(v || 0))

const maxHint = computed(() => {
  const t = props.targets.find((x) => x.key === target.value)
  if (!t || t.balance == null) return ''
  return Math.min(props.credit, t.balance).toLocaleString('en-KE')
})

const submit = async () => {
  error.value = ''
  if (amount.value !== '' && !(Number(amount.value) > 0)) {
    error.value = 'Enter an amount above zero, or leave it blank.'
    return
  }
  saving.value = true
  try {
    const payload = { student: props.studentId, ...targetPayload(target.value) }
    if (amount.value !== '') payload.amount = String(amount.value)
    emit('done', await applyCredit(payload))
  } catch (err) {
    error.value =
      err?.response?.status === 403
        ? "Your role can't apply credit. Ask an admin, bursar or principal."
        : errorMessage(err)
  } finally {
    saving.value = false
  }
}
</script>