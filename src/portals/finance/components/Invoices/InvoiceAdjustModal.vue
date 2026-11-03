<template>
  <div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" @click.self="$emit('close')">
    <form
      class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:max-w-lg sm:rounded-lg sm:p-6"
      @submit.prevent="submit"
    >
      <h2 class="text-lg font-semibold">Adjust invoice</h2>
      <p class="text-sm text-gray-500">{{ invoice.student_name }} · currently {{ formatCurrency(invoice.amount_due) }} due</p>

      <div class="mt-4 inline-flex rounded border text-sm" role="group" aria-label="Adjustment type">
        <button
          type="button"
          class="px-3 py-2"
          :class="source === 'custom' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'"
          @click="source = 'custom'"
        >
          Custom amount
        </button>
        <button
          type="button"
          class="border-l px-3 py-2"
          :class="source === 'charge' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'"
          @click="source = 'charge'"
        >
          From a charge
        </button>
      </div>

      <div class="mt-4 space-y-4">
        <template v-if="source === 'custom'">
          <div>
            <label class="mb-1 block text-sm font-medium" for="adj-desc">Description</label>
            <input id="adj-desc" v-model.trim="form.description" required class="w-full rounded border px-3 py-2" placeholder="e.g. Additional activity fee" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium" for="adj-amount">Amount (KES)</label>
            <input id="adj-amount" v-model="form.amount" type="number" step="1" inputmode="numeric" required class="w-full rounded border px-3 py-2" />
            <p class="mt-1 text-xs text-gray-500">Positive adds to the invoice. Negative reduces it. Whole shillings only.</p>
          </div>
        </template>

        <template v-else>
          <div>
            <label class="mb-1 block text-sm font-medium" for="adj-charge">Charge</label>
            <select id="adj-charge" v-model="form.charge" required class="w-full rounded border px-3 py-2">
              <option value="" disabled>Select charge</option>
              <option v-for="c in charges" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Uses this class's rate for the invoice's term, falling back to the default rate.
            </p>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium" for="adj-c-amount">Amount (optional)</label>
              <input id="adj-c-amount" v-model="form.amount" type="number" step="1" inputmode="numeric" class="w-full rounded border px-3 py-2" placeholder="Use the rate" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium" for="adj-c-desc">Description (optional)</label>
              <input id="adj-c-desc" v-model.trim="form.description" class="w-full rounded border px-3 py-2" placeholder="Charge name" />
            </div>
          </div>
        </template>

        <div>
          <label class="mb-1 block text-sm font-medium" for="adj-reason">Reason</label>
          <textarea id="adj-reason" v-model.trim="form.reason" rows="2" required class="w-full rounded border px-3 py-2" placeholder="e.g. Approved by finance"></textarea>
        </div>
      </div>

      <dl v-if="newDue !== null" class="mt-4 grid grid-cols-2 gap-2 rounded border bg-gray-50 p-3 text-sm">
        <div>
          <dt class="text-gray-500">New amount due</dt>
          <dd class="font-medium" :class="newDue < 0 ? 'text-red-700' : ''">{{ formatCurrency(newDue) }}</dd>
        </div>
        <div>
          <dt class="text-gray-500">New balance</dt>
          <dd class="font-medium">{{ formatCurrency(Math.max(newDue - paid, 0)) }}</dd>
        </div>
      </dl>

      <p v-if="releasedCredit > 0" class="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        This leaves {{ formatCurrency(releasedCredit) }} of the paid amount above the new total. It is released back to the student as credit.
      </p>

      <p v-if="error" class="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>

      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" @click="$emit('close')" class="w-full rounded border px-4 py-2 hover:bg-gray-50 sm:w-auto">Cancel</button>
        <button type="submit" :disabled="saving" class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto">
          {{ saving ? 'Saving...' : 'Save adjustment' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { adjustInvoice } from '../../api/payment'
import { getCharges, unwrapList, errorMessage } from '../../api/charge'

const props = defineProps({ invoice: { type: Object, required: true } })
const emit = defineEmits(['close', 'done'])

const source = ref('custom')
const form = reactive({ description: '', amount: '', charge: '', reason: '' })
const charges = ref([])
const saving = ref(false)
const error = ref('')

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(Number(v || 0))

const due = computed(() => Number(props.invoice.amount_due || 0))
const paid = computed(() => Number(props.invoice.amount_paid || 0))

// Only a typed amount can be previewed; a charge's rate is looked up by the server
const newDue = computed(() => {
  if (form.amount === '' || Number.isNaN(Number(form.amount))) return null
  return due.value + Number(form.amount)
})
const releasedCredit = computed(() => (newDue.value !== null && newDue.value >= 0 ? Math.max(paid.value - newDue.value, 0) : 0))

onMounted(async () => {
  try {
    charges.value = unwrapList(await getCharges({ active: 1 }))
  } catch {
    charges.value = []
  }
})

const submit = async () => {
  error.value = ''
  const hasAmount = form.amount !== '' && form.amount != null

  if (hasAmount) {
    const amount = Number(form.amount)
    if (!Number.isInteger(amount) || amount === 0) {
      error.value = "Enter a whole shilling amount that isn't zero."
      return
    }
    if (due.value + amount < 0) {
      error.value = "The adjustment can't take the invoice below zero."
      return
    }
  }

  const payload = { reason: form.reason }
  if (source.value === 'custom') {
    payload.description = form.description
    payload.amount = String(Number(form.amount))
  } else {
    payload.charge = form.charge
    if (hasAmount) payload.amount = String(Number(form.amount))
    if (form.description) payload.description = form.description
  }

  saving.value = true
  try {
    emit('done', await adjustInvoice(props.invoice.id, payload))
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}
</script>