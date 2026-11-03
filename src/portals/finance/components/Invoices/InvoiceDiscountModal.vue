<template>
  <div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" @click.self="$emit('close')">
    <form
      class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:max-w-lg sm:rounded-lg sm:p-6"
      @submit.prevent="submit"
    >
      <h2 class="text-lg font-semibold">Add discount</h2>
      <p class="text-sm text-gray-500">{{ invoice.student_name }} · currently {{ formatCurrency(invoice.amount_due) }} due</p>

      <p class="mt-3 rounded border bg-gray-50 p-3 text-sm text-gray-700">
        The discount is applied to this invoice now as a negative line. If the student has already paid more than the new total, the extra becomes credit.
      </p>

      <div class="mt-4 space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium" for="id-kind">Type</label>
            <select id="id-kind" v-model="form.kind" class="w-full rounded border px-3 py-2">
              <option value="percent">Percentage off</option>
              <option value="fixed">Fixed amount off</option>
              <option value="pays_only">Student pays only</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium" for="id-value">{{ valueLabel }}</label>
            <input
              id="id-value"
              v-model="form.value"
              type="number"
              required
              :min="form.kind === 'pays_only' ? 0 : 1"
              :max="form.kind === 'percent' ? 100 : undefined"
              :step="form.kind === 'percent' ? 'any' : 1"
              class="w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <div v-if="form.kind !== 'pays_only'">
          <label class="mb-1 block text-sm font-medium" for="id-base">Applies to</label>
          <select id="id-base" v-model="form.base" class="w-full rounded border px-3 py-2">
            <option value="fee">School fees only</option>
            <option value="invoice">Whole invoice</option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium" for="id-reason">Reason</label>
          <select id="id-reason" v-model="form.reason" class="w-full rounded border px-3 py-2">
            <option v-for="r in reasons" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium" for="id-note">Note{{ form.reason === 'other' ? '' : ' (optional)' }}</label>
          <input id="id-note" v-model.trim="form.note" :required="form.reason === 'other'" class="w-full rounded border px-3 py-2" />
        </div>

        <label class="flex items-start gap-2 text-sm">
          <input v-model="form.ongoing" type="checkbox" class="mt-0.5 rounded border" />
          <span>
            Also apply to future invoices
            <span class="block text-xs text-gray-500">Off: this invoice only. On: it is also saved as an ongoing discount for eligible future invoices.</span>
          </span>
        </label>

        <div v-if="form.ongoing">
          <label class="mb-1 block text-sm font-medium" for="id-ends">Ends on (optional)</label>
          <input id="id-ends" v-model="form.ends_on" type="date" class="w-full rounded border px-3 py-2" />
        </div>
      </div>

      <p v-if="error" class="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>

      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" @click="$emit('close')" class="w-full rounded border px-4 py-2 hover:bg-gray-50 sm:w-auto">Cancel</button>
        <button type="submit" :disabled="saving" class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto">
          {{ saving ? 'Saving...' : 'Add discount' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { discountInvoice } from '../../api/payment'
import { errorMessage } from '../../api/charge'

const props = defineProps({ invoice: { type: Object, required: true } })
const emit = defineEmits(['close', 'done'])

const reasons = [
  { value: 'staff_child', label: 'Staff child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'bursary', label: 'Bursary' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'mid_term', label: 'Mid-term admission' },
  { value: 'other', label: 'Other' },
]

const form = reactive({ kind: 'percent', value: '', base: 'fee', reason: 'bursary', note: '', ongoing: false, ends_on: '' })
const saving = ref(false)
const error = ref('')

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(Number(v || 0))

const valueLabel = computed(
  () => ({ percent: 'Percentage (1–100)', fixed: 'Amount off (KES)', pays_only: 'Student pays (KES)' }[form.kind]),
)

const submit = async () => {
  error.value = ''
  const value = Number(form.value)
  if (form.kind === 'percent' && !(value > 0 && value <= 100)) {
    error.value = 'Percentage must be above 0 and at most 100.'
    return
  }
  if (form.kind !== 'percent' && !Number.isInteger(value)) {
    error.value = 'Enter a whole shilling amount.'
    return
  }

  const payload = {
    kind: form.kind,
    value: String(value),
    reason: form.reason,
    note: form.note,
    ongoing: form.ongoing,
  }
  if (form.kind !== 'pays_only') payload.base = form.base
  if (form.ongoing && form.ends_on) payload.ends_on = form.ends_on

  saving.value = true
  try {
    emit('done', await discountInvoice(props.invoice.id, payload))
  } catch (err) {
    error.value =
      err?.response?.status === 403
        ? "Your role can't add discounts. Ask an admin, bursar or principal."
        : errorMessage(err)
  } finally {
    saving.value = false
  }
}
</script>