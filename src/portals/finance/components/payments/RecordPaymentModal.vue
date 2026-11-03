<template>
  <div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" @click.self="$emit('close')">
    <form
      class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:max-w-lg sm:rounded-lg sm:p-6"
      @submit.prevent="submit"
    >
      <h2 class="text-lg font-semibold">Record payment</h2>

      <div class="mt-4 space-y-4">
        <StudentSelect v-model="form.student" :students="students" input-id="rp-student" />

        <div>
          <label class="mb-1 block text-sm font-medium" for="rp-target">Apply to</label>
          <select id="rp-target" v-model="form.target" :disabled="!form.student || loadingTargets" class="w-full rounded border px-3 py-2">
            <option value="">School's allocation rule (oldest open invoice first)</option>
            <option v-for="t in targets" :key="t.key" :value="t.key">{{ t.label }}</option>
          </select>
          <p class="mt-1 text-xs text-gray-500">
            Anything above the invoice balance is kept as credit for the student.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium" for="rp-amount">Amount (KES)</label>
            <input id="rp-amount" v-model="form.amount" type="number" min="0.01" step="0.01" inputmode="decimal" required class="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium" for="rp-method">Method</label>
            <select id="rp-method" v-model="form.method" class="w-full rounded border px-3 py-2">
              <option value="mpesa">M-Pesa</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium" for="rp-code">Reference (optional)</label>
            <input id="rp-code" v-model.trim="form.transaction_code" class="w-full rounded border px-3 py-2" placeholder="e.g. QRS123" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium" for="rp-date">Date</label>
            <input id="rp-date" v-model="form.date" type="date" :max="today" class="w-full rounded border px-3 py-2" />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium" for="rp-by">Received by (optional)</label>
          <input id="rp-by" v-model.trim="form.received_by" class="w-full rounded border px-3 py-2" />
        </div>
      </div>

      <p v-if="error" class="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>

      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" @click="$emit('close')" class="w-full rounded border px-4 py-2 hover:bg-gray-50 sm:w-auto">Cancel</button>
        <button type="submit" :disabled="saving" class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto">
          {{ saving ? 'Saving...' : 'Record payment' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { recordPayment, getInvoiceTargets, targetPayload } from '../../api/payment'
import { errorMessage } from '../../api/charge'
import StudentSelect from './StudentSelect.vue'

const props = defineProps({
  students: { type: Array, default: () => [] },
  studentId: { type: [Number, String], default: '' }, // preselect when opened from a student page
})
const emit = defineEmits(['close', 'saved'])

const today = new Date().toISOString().slice(0, 10)
const form = reactive({
  student: props.studentId,
  target: '',
  amount: '',
  method: 'mpesa',
  transaction_code: '',
  received_by: '',
  date: today,
})
const targets = ref([])
const loadingTargets = ref(false)
const saving = ref(false)
const error = ref('')

watch(
  () => form.student,
  async (id) => {
    form.target = ''
    targets.value = []
    if (!id) return
    loadingTargets.value = true
    try {
      targets.value = await getInvoiceTargets(id)
    } catch {
      targets.value = [] // the allocation rule still works without a list
    } finally {
      loadingTargets.value = false
    }
  },
  { immediate: true },
)

const submit = async () => {
  error.value = ''
  if (!form.student) {
    error.value = 'Choose a student from the list.'
    return
  }
  if (!(Number(form.amount) > 0)) {
    error.value = 'Enter an amount above zero.'
    return
  }
  saving.value = true
  try {
    const payload = {
      student: form.student,
      amount: String(form.amount),
      method: form.method,
      ...targetPayload(form.target),
    }
    if (form.transaction_code) payload.transaction_code = form.transaction_code
    if (form.received_by) payload.received_by = form.received_by
    if (form.date) payload.date = form.date
    emit('saved', await recordPayment(payload))
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}
</script>