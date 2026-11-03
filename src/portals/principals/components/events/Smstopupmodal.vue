<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h3 class="text-xl font-semibold text-gray-800 mb-1">Top up SMS credits</h3>
      <p v-if="price" class="text-sm text-gray-500 mb-4">KES {{ price }} per SMS credit</p>

      <div v-if="state === 'success'" class="bg-green-100 text-green-700 p-3 rounded">
        Payment received. Credits added.
      </div>

      <form v-else class="space-y-4" @submit.prevent="start">
        <div>
          <label class="block text-gray-700 font-medium mb-1">Amount (KES)</label>
          <input v-model="amount" type="number" min="50" step="1" required
                 class="w-full border rounded-lg p-2" :disabled="busy" />
          <p v-if="credits" class="text-sm text-gray-500 mt-1">About {{ credits }} credits</p>
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-1">M-Pesa phone number</label>
          <input v-model="phone" type="tel" placeholder="0712345678" required
                 class="w-full border rounded-lg p-2" :disabled="busy" />
        </div>

        <p v-if="message" :class="state === 'waiting' ? 'text-blue-700' : 'text-red-600'" class="text-sm">
          {{ message }}
        </p>

        <div class="flex justify-end gap-3">
          <button type="button" class="px-4 py-2 text-gray-600" @click="close">Cancel</button>
          <button type="submit" :disabled="busy"
                  class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
            {{ state === 'sending' ? 'Sending...' : state === 'waiting' ? 'Waiting for payment...' : 'Pay with M-Pesa' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import * as smsApi from '../../api/sms.js'

const props = defineProps({
  modelValue: Boolean,
  suggestedAmount: { type: Number, default: 0 },
})
const emit = defineEmits(['update:modelValue', 'done'])

const amount = ref('')
const phone = ref('')
const state = ref('idle') // idle | sending | waiting | success
const message = ref('')
const price = ref(null)
let poll = null

const busy = computed(() => state.value === 'sending' || state.value === 'waiting')
const credits = computed(() =>
  price.value && amount.value ? Math.floor(Number(amount.value) / Number(price.value)) : 0
)

watch(() => props.modelValue, async (open) => {
  if (!open) return stopPolling()
  state.value = 'idle'
  message.value = ''
  amount.value = props.suggestedAmount ? Math.max(50, Math.ceil(props.suggestedAmount)) : ''
  try {
    price.value = (await smsApi.getWallet()).price_per_credit_kes
  } catch { /* price display is optional */ }
})

async function start() {
  state.value = 'sending'
  message.value = ''
  try {
    const topup = await smsApi.createTopUp({ amount_kes: Number(amount.value), phone: phone.value })
    state.value = 'waiting'
    message.value = 'Check your phone and enter your M-Pesa PIN.'
    pollStatus(topup.id)
  } catch (err) {
    state.value = 'idle'
    message.value = smsApi.errorText(err)
  }
}

function pollStatus(id) {
  let tries = 0
  poll = setInterval(async () => {
    tries++
    try {
      const topup = await smsApi.getTopUp(id)
      if (topup.status === 'success') {
        stopPolling()
        state.value = 'success'
        emit('done')
        setTimeout(close, 1500)
        return
      }
      if (topup.status === 'failed') {
        stopPolling()
        state.value = 'idle'
        message.value = 'Payment failed or was cancelled.'
        return
      }
    } catch { /* keep polling */ }
    if (tries >= 30) {
      stopPolling()
      state.value = 'idle'
      message.value = 'Still waiting. If you paid, your credits will appear shortly. Refresh the page to check.'
    }
  }, 3000)
}

function stopPolling() {
  if (poll) clearInterval(poll)
  poll = null
}

function close() {
  stopPolling()
  emit('update:modelValue', false)
}

onBeforeUnmount(stopPolling)
</script>