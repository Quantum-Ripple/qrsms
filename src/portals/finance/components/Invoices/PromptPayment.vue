<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

      <!-- HEADER -->
      <div class="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-5 py-4 flex items-start justify-between">
        <div>
          <h2 class="text-lg font-semibold">M-Pesa Prompt</h2>
          <p class="text-sm text-green-50">
            {{ invoice.student_name }} · {{ invoice.term }}
          </p>
        </div>
        <button class="text-white/80 hover:text-white text-xl leading-none" @click="close">✕</button>
      </div>

      <div class="p-5">

        <!-- FORM -->
        <div v-if="state === 'idle' || state === 'sending'" class="space-y-4">
          <div class="rounded-lg bg-gray-50 border px-3 py-2 text-sm flex justify-between">
            <span class="text-gray-500">Outstanding balance</span>
            <span class="font-semibold">KES {{ money(invoice.balance_due) }}</span>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Parent's M-Pesa number</label>
            <div class="flex">
              <span class="inline-flex items-center px-3 border border-r-0 rounded-l bg-gray-50 text-gray-600 text-sm">
                🇰🇪 +254
              </span>
              <input
                v-model="phone"
                type="tel"
                inputmode="numeric"
                placeholder="712 345 678"
                class="border rounded-r px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                :disabled="state === 'sending'"
                @keyup.enter="send"
              />
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="block text-sm font-medium">Amount (KES)</label>
              <button
                v-if="fullBalance > 0"
                type="button"
                class="text-xs text-green-700 hover:underline"
                :disabled="state === 'sending'"
                @click="amount = fullBalance"
              >
                Use full balance
              </button>
            </div>
            <input
              v-model="amount"
              type="number"
              min="1"
              step="1"
              class="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              :disabled="state === 'sending'"
              @keyup.enter="send"
            />
          </div>

          <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {{ error }}
          </p>

          <button
            class="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2"
            :disabled="state === 'sending'"
            @click="send"
          >
            <svg v-if="state === 'sending'" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
            </svg>
            {{ state === 'sending' ? 'Contacting Safaricom…' : 'Send Prompt' }}
          </button>
        </div>

        <!-- WAITING -->
        <div v-else-if="state === 'waiting'" class="text-center">
          <div class="relative mx-auto w-44 h-44 mb-3">
            <svg class="w-44 h-44 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="5" />
              <circle
                cx="50" cy="50" r="45" fill="none" stroke="#16a34a" stroke-width="5"
                stroke-linecap="round"
                :stroke-dasharray="CIRC"
                :stroke-dashoffset="dashOffset"
                style="transition: stroke-dashoffset 1s linear"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="absolute w-20 h-20 rounded-full bg-green-400/30 animate-ping"></span>
              <span class="relative text-5xl buzz">📱</span>
              <span class="relative text-xs text-gray-500 mt-1 tabular-nums">{{ secondsLeft }}s left</span>
            </div>
          </div>

          <p class="font-semibold text-gray-800">Prompt sent to +{{ phone254 }}</p>
          <p class="text-sm text-gray-500 mb-4">KES {{ money(amount) }} · waiting for the PIN</p>

          <!-- steps -->
          <ol class="text-left text-sm space-y-2 mb-4 mx-auto max-w-xs">
            <li class="flex items-center gap-2">
              <span class="step done">✓</span><span>Prompt delivered to Safaricom</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="step active"><span class="animate-pulse">●</span></span>
              <span class="font-medium">Parent enters M-Pesa PIN</span>
            </li>
            <li class="flex items-center gap-2 text-gray-400">
              <span class="step">3</span><span>Payment confirmed &amp; recorded</span>
            </li>
          </ol>

          <transition name="fade" mode="out-in">
            <p :key="tipIndex" class="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              💡 {{ TIPS[tipIndex] }}
            </p>
          </transition>

          <p class="text-xs text-gray-400 mt-3">
            You can close this window. If the parent pays, the payment is recorded automatically.
          </p>
        </div>

        <!-- SUCCESS -->
        <div v-else-if="state === 'success'" class="text-center py-2">
          <div class="relative mx-auto w-28 h-28 mb-3">
            <span
              v-for="(c, i) in CONFETTI" :key="i"
              class="confetti"
              :style="{ '--a': i * 30 + 'deg', background: c }"
            ></span>
            <svg class="pop w-28 h-28" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="24" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
              <path class="check" d="M14 27 l8 8 l16 -17" fill="none" stroke="#16a34a"
                    stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <p class="text-xl font-semibold text-green-700">Payment received!</p>
          <p class="text-gray-600 mt-1">KES {{ money(amount) }} for {{ invoice.student_name }}</p>
          <p v-if="receipt" class="mt-3 inline-block bg-green-50 border border-green-200 rounded-lg px-3 py-1 text-sm font-mono">
            {{ receipt }}
          </p>
          <div class="mt-5">
            <button class="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white" @click="close">Done</button>
          </div>
        </div>

        <!-- TIMEOUT -->
        <div v-else-if="state === 'timeout'" class="text-center py-2">
          <div class="text-5xl mb-2">⏳</div>
          <p class="text-lg font-semibold text-amber-700">Still waiting for confirmation</p>
          <p class="text-sm text-gray-600 mt-2">
            The prompt was sent, but we haven't heard back yet. Please don't send another one just yet.
            If the parent already paid, it will show on this invoice shortly.
          </p>
          <div class="mt-5 flex justify-center gap-2">
            <button class="px-4 py-2 rounded-lg bg-gray-200" @click="close">Close</button>
            <button class="px-4 py-2 rounded-lg bg-green-600 text-white" @click="keepWaiting">Keep waiting</button>
          </div>
        </div>

        <!-- FAILED -->
        <div v-else class="text-center py-2">
          <div class="text-5xl mb-2">{{ failIcon }}</div>
          <p class="text-lg font-semibold text-red-600">Payment not completed</p>
          <p class="text-sm text-gray-600 mt-2">{{ error }}</p>
          <div class="mt-5 flex justify-center gap-2">
            <button class="px-4 py-2 rounded-lg bg-gray-200" @click="close">Close</button>
            <button class="px-4 py-2 rounded-lg bg-green-600 text-white" @click="state = 'idle'">Try again</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { initiateStaffStkPush, getMpesaTransactionStatus } from '../../api/fee'

const props = defineProps({ invoice: { type: Object, required: true } })
const emit = defineEmits(['close', 'paymentRecorded'])

const TOTAL_SECONDS = 90
const EXTRA_SECONDS = 60
const POLL_EVERY = 3
const CIRC = 2 * Math.PI * 45

const TIPS = [
  'Ask the parent to check their phone for the M-Pesa pop-up.',
  'The prompt asks for the M-Pesa PIN, not the phone unlock code.',
  "If nothing appears, the phone may be off or the SIM menu may be busy.",
  'Tell the parent the amount on screen should match what you sent.',
  'Payments are recorded automatically; no need to enter anything here.',
]

const CONFETTI = ['#16a34a', '#facc15', '#38bdf8', '#f472b6', '#fb923c', '#a78bfa',
                  '#16a34a', '#facc15', '#38bdf8', '#f472b6', '#fb923c', '#a78bfa']

// Safaricom STK result codes -> friendly text
const REASONS = {
  '1': "The parent's M-Pesa balance is too low.",
  '1019': 'The prompt expired before it was answered.',
  '1025': "The prompt couldn't be sent. Please try again.",
  '1032': 'The parent cancelled the prompt on their phone.',
  '1037': "The phone couldn't be reached. Check that it's on, has signal, and the SIM menu isn't busy.",
  '2001': 'The wrong M-Pesa PIN was entered.',
  '9999': "Safaricom couldn't push the request to this number. Confirm it is an active M-Pesa line.",
}

const fullBalance = computed(() => {
  const b = Math.floor(Number(props.invoice.balance_due) || 0)
  return b > 0 ? b : 0
})

const phone = ref('')
const amount = ref(fullBalance.value || '')
const state = ref('idle') // idle | sending | waiting | success | timeout | failed
const error = ref('')
const receipt = ref('')
const failCode = ref('')

const secondsLeft = ref(TOTAL_SECONDS)
const tipIndex = ref(0)

const money = (v) => Number(v || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })

// Same normalisation idea as the backend, only for display
const phone254 = computed(() => {
  let p = String(phone.value).replace(/[\s\-+]/g, '')
  if (p.startsWith('254')) return p
  if (p.startsWith('0')) return '254' + p.slice(1)
  return '254' + p
})

const dashOffset = computed(() => CIRC * (1 - secondsLeft.value / currentTotal))
const failIcon = computed(() => (failCode.value === '1032' ? '🙅' : failCode.value === '2001' ? '🔑' : '😕'))

let currentTotal = TOTAL_SECONDS
let timer = null
let startedAt = 0
let lastPoll = -POLL_EVERY
let txnId = null
let polling = false

const stop = () => { if (timer) { clearInterval(timer); timer = null } }

const send = async () => {
  error.value = ''
  if (!phone.value || !amount.value) {
    error.value = "Enter the parent's phone number and the amount."
    return
  }
  state.value = 'sending'
  try {
    const res = await initiateStaffStkPush({
      invoice: props.invoice.id,
      phone_number: phone.value,
      amount: amount.value,
    })
    txnId = res.transaction_id
    begin(TOTAL_SECONDS)
  } catch (e) {
    state.value = 'idle'
    const data = e.response?.data
    error.value =
      data?.detail ||
      Object.values(data || {}).flat().join(' ') ||
      'Could not send the prompt. Please try again.'
  }
}

const begin = (seconds) => {
  currentTotal = seconds
  secondsLeft.value = seconds
  startedAt = Date.now()
  lastPoll = -POLL_EVERY
  tipIndex.value = 0
  state.value = 'waiting'
  stop()
  timer = setInterval(onTick, 1000)
}

const keepWaiting = () => begin(EXTRA_SECONDS)

const onTick = async () => {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000)
  secondsLeft.value = Math.max(0, currentTotal - elapsed)
  tipIndex.value = Math.floor(elapsed / 6) % TIPS.length

  if (elapsed - lastPoll >= POLL_EVERY) {
    lastPoll = elapsed
    await poll()
  }

  if (state.value === 'waiting' && secondsLeft.value === 0) {
    stop()
    state.value = 'timeout'
  }
}

const poll = async () => {
  if (polling || state.value !== 'waiting') return
  polling = true
  try {
    const res = await getMpesaTransactionStatus(txnId)
    const status = String(res.status).toLowerCase()
    if (status === 'success') {
      stop()
      receipt.value = res.receipt || ''
      state.value = 'success'
      emit('paymentRecorded')
    } else if (status === 'failed') {
      stop()
      failCode.value = String(res.result_code || '')
      error.value = REASONS[failCode.value] || res.result_description || 'The payment did not go through.'
      state.value = 'failed'
    }
    // initiated / stk_sent / unknown -> keep waiting
  } catch (_) {
    // network blip: try again on the next poll
  } finally {
    polling = false
  }
}

const close = () => { stop(); emit('close') }

onBeforeUnmount(stop)
</script>

<style scoped>
.step {
  width: 1.5rem; height: 1.5rem; border-radius: 9999px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.75rem; background: #f3f4f6; color: #9ca3af;
}
.step.done { background: #16a34a; color: #fff; }
.step.active { background: #dcfce7; color: #16a34a; }

.buzz { display: inline-block; animation: buzz 2.2s ease-in-out infinite; transform-origin: 50% 80%; }
@keyframes buzz {
  0%, 60%, 100% { transform: rotate(0); }
  10%, 30%, 50% { transform: rotate(-9deg); }
  20%, 40% { transform: rotate(9deg); }
}

.pop { animation: pop 0.5s cubic-bezier(.2, 1.4, .4, 1) both; }
@keyframes pop { 0% { transform: scale(.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

.check { stroke-dasharray: 40; stroke-dashoffset: 40; animation: draw 0.5s 0.3s ease-out forwards; }
@keyframes draw { to { stroke-dashoffset: 0; } }

.confetti {
  position: absolute; left: 50%; top: 50%; width: 8px; height: 8px; border-radius: 2px;
  margin: -4px 0 0 -4px; opacity: 0;
  animation: burst 0.9s 0.35s ease-out forwards;
}
@keyframes burst {
  0%   { transform: rotate(var(--a)) translateY(0) scale(1); opacity: 1; }
  100% { transform: rotate(var(--a)) translateY(-78px) scale(.4); opacity: 0; }
}

.fade-enter-active, .fade-leave-active { transition: opacity .3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .buzz, .pop, .confetti { animation: none; }
  .check { animation: none; stroke-dashoffset: 0; }
}
</style>