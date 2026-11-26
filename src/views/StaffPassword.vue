
<script setup>
import {
  ref,
  computed,
  nextTick,
  onUnmounted,
} from 'vue'
import { useRouter } from 'vue-router'
import Auth from '@/api/Auth'

const router = useRouter()

// STEPS
const step = ref(1)
const loading = ref(false)
const resending = ref(false)
const error = ref('')
const success = ref('')

// ACCOUNT
const identifier = ref('')
const username = ref('')

// OTP
const challengeId = ref('')
const maskedPhone = ref('')
const expiresIn = ref(600)
const secondsLeft = ref(0)
const otp = ref('')
const otpInput = ref(null)

// PASSWORD
const resetToken = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)

let timer = null

const pageTitle = computed(() => {
  if (step.value === 1) return 'Forgot password?'
  if (step.value === 2) return 'Verify your identity'
  return 'Set new password'
})

const pageDescription = computed(() => {
  if (step.value === 1) {
    return 'Enter your registered phone number, email address or username to receive a verification code.'
  }

  if (step.value === 2) {
    const destination = maskedPhone.value || 'your registered phone'
    const minutes = Math.ceil(expiresIn.value / 60)

    return `We sent a six-digit code to ${destination}. The code expires in ${minutes} minutes.`
  }

  return 'Create a secure password for your school account.'
})

const canVerify = computed(() =>
  /^\d{6}$/.test(otp.value) && !loading.value
)

const passwordValid = computed(() =>
  password.value.length >= 8
)

const passwordsMatch = computed(() =>
  password.value === confirmPassword.value
)

const canSave = computed(() =>
  passwordValid.value &&
  passwordsMatch.value &&
  !loading.value &&
  Boolean(resetToken.value)
)

// HELPERS
function clearMessages() {
  error.value = ''
  success.value = ''
}

function getErrorMessage(err) {
  const data = err?.response?.data ?? err

  if (typeof data === 'string') {
    return data
  }

  if (data && typeof data === 'object') {
    for (const key of [
      'detail',
      'message',
      'error',
      'non_field_errors',
      'identifier',
      'challenge_id',
      'code',
      'password',
      'confirm_password',
      'reset_token',
    ]) {
      const value = data[key]

      if (typeof value === 'string') return value

      if (Array.isArray(value) && value.length) {
        return String(value[0])
      }
    }
  }

  if (err?.response?.status === 429) {
    return 'Too many attempts. Please try again later.'
  }

  return 'Unable to complete the request. Please try again.'
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer(seconds) {
  stopTimer()

  secondsLeft.value = Math.max(0, Number(seconds) || 0)

  if (!secondsLeft.value) return

  timer = setInterval(() => {
    secondsLeft.value--

    if (secondsLeft.value <= 0) {
      secondsLeft.value = 0
      stopTimer()
    }
  }, 1000)
}

function applyChallenge(data) {
  const challenge = data?.challenge ?? data

  if (!challenge?.challenge_id) {
    throw new Error('Invalid OTP challenge response.')
  }

  challengeId.value = challenge.challenge_id
  maskedPhone.value = challenge.masked_phone || ''
  expiresIn.value = Number(challenge.expires_in ?? 600)

  startTimer(challenge.resend_after ?? 60)
}

function updateOTP(event) {
  otp.value = event.target.value
    .replace(/\D/g, '')
    .slice(0, 6)

  error.value = ''
}

function focusOTP() {
  otpInput.value?.focus()
}

// STEP 1 - REQUEST CODE
async function requestOTP() {
  if (loading.value) return

  clearMessages()

  const value = identifier.value.trim()

  if (!value) {
    error.value = 'Enter your registered phone number, email or username.'
    return
  }

  loading.value = true

  try {
    const response = await Auth.requestStaffOTP(value)

    applyChallenge(response)

    otp.value = ''
    step.value = 2

    await nextTick()
    focusOTP()
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

// STEP 2 - VERIFY CODE
async function verifyOTP() {
  if (!canVerify.value) return

  clearMessages()
  loading.value = true

  try {
    const response = await Auth.verifyStaffOTP(
      challengeId.value,
      otp.value
    )

    const verified = response?.verified ?? response

    if (!verified?.reset_token) {
      throw new Error('Verification response is incomplete.')
    }

    resetToken.value = verified.reset_token
    username.value = verified.username || ''

    password.value = ''
    confirmPassword.value = ''
    otp.value = ''

    stopTimer()
    step.value = 3
  } catch (err) {
    otp.value = ''
    error.value = getErrorMessage(err)

    await nextTick()
    focusOTP()
  } finally {
    loading.value = false
  }
}

// RESEND CODE
async function resendOTP() {
  if (
    resending.value ||
    loading.value ||
    secondsLeft.value > 0
  ) return

  clearMessages()
  resending.value = true

  try {
    const response = await Auth.requestStaffOTP(
      identifier.value.trim()
    )

    applyChallenge(response)

    otp.value = ''
    success.value = 'A new verification code has been sent.'

    await nextTick()
    focusOTP()
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    resending.value = false
  }
}

// STEP 3 - SAVE PASSWORD
async function savePassword() {
  if (loading.value) return

  clearMessages()

  if (!passwordValid.value) {
    error.value = 'Password must contain at least 8 characters.'
    return
  }

  if (!passwordsMatch.value) {
    error.value = 'Passwords do not match.'
    return
  }

  if (!resetToken.value) {
    error.value = 'Your verification has expired. Please start again.'
    return
  }

  loading.value = true

  try {
    await Auth.setStaffPassword({
      resetToken: resetToken.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    })

    // Remove sensitive values from memory.
    resetToken.value = ''
    challengeId.value = ''
    otp.value = ''
    password.value = ''
    confirmPassword.value = ''

    await router.replace({
      path: '/login',
      query: { password_updated: '1' },
    })
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (loading.value || resending.value) return

  if (step.value === 2) {
    stopTimer()
    challengeId.value = ''
    otp.value = ''
    clearMessages()
    step.value = 1
    return
  }

  if (step.value === 3) {
    resetToken.value = ''
    password.value = ''
    confirmPassword.value = ''
    step.value = 1
    clearMessages()
    return
  }

  router.push('/login')
}

onUnmounted(() => {
  stopTimer()
  resetToken.value = ''
  password.value = ''
  confirmPassword.value = ''
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">

    <!-- HEADER -->
    <header class="px-5 py-5 sm:px-8">
      <div
        class="max-w-5xl mx-auto flex items-center justify-between gap-4"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-blue-600
                   flex items-center justify-center"
          >
            <span class="text-white text-lg font-bold">Q</span>
          </div>

          <div>
            <p class="text-sm font-bold text-slate-900">
              QRSMS
            </p>
            <p class="text-xs text-slate-500">
              <i>Simple.Reliable.Trusted</i>
            </p>
          </div>
        </div>

        <router-link
          to="/login"
          class="text-sm font-medium text-slate-600
                 hover:text-blue-600 transition-colors"
        >
          Back to login
        </router-link>
      </div>
    </header>

    <!-- MAIN -->
    <main
      class="flex-1 flex items-center justify-center
             px-4 py-8 sm:py-12"
    >
      <div class="w-full max-w-md">

        <!-- PROGRESS -->
        <div class="flex justify-center items-center gap-2 mb-8">
          <div
            v-for="n in 3"
            :key="n"
            class="h-1.5 rounded-full transition-all duration-300"
            :class="n <= step
              ? 'w-12 bg-blue-600'
              : 'w-8 bg-slate-200'"
          />
        </div>

        <!-- CARD -->
        <div
          class="bg-white rounded-2xl border border-slate-200
                 shadow-sm p-6 sm:p-9"
        >

          <!-- ICON -->
          <div
            class="w-14 h-14 rounded-2xl bg-blue-50
                   text-blue-600 flex items-center
                   justify-center mx-auto mb-6"
          >
            <svg
              v-if="step === 1"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>

            <svg
              v-else-if="step === 2"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
              />
              <path d="m9 12 2 2 4-4" />
            </svg>

            <svg
              v-else
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="10" width="18" height="11" rx="2" />
              <path d="M7 10V7a5 5 0 0 1 10 0v3" />
              <path d="M12 14v3" />
            </svg>
          </div>

          <!-- TITLE -->
          <div class="text-center mb-8">
            <p
              class="text-xs font-semibold text-blue-600
                     uppercase tracking-wider mb-2"
            >
              Step {{ step }} of 3
            </p>

            <h1
              class="text-2xl font-bold tracking-tight text-slate-900"
            >
              {{ pageTitle }}
            </h1>

            <p class="mt-3 text-sm text-slate-500 leading-6">
              {{ pageDescription }}
            </p>
          </div>

          <!-- ERROR -->
          <div
            v-if="error"
            role="alert"
            class="mb-5 p-3 rounded-xl border border-red-100
                   bg-red-50 text-red-700 text-sm"
          >
            {{ error }}
          </div>

          <!-- SUCCESS -->
          <div
            v-if="success"
            role="status"
            class="mb-5 p-3 rounded-xl border border-emerald-100
                   bg-emerald-50 text-emerald-700 text-sm"
          >
            {{ success }}
          </div>

          <!-- STEP 1: IDENTIFIER -->
          <form
            v-if="step === 1"
            @submit.prevent="requestOTP"
            class="space-y-5"
          >
            <div>
              <label
                for="identifier"
                class="block text-sm font-semibold text-slate-700 mb-2"
              >
                Registered phone, email or username
              </label>

              <input
                id="identifier"
                v-model="identifier"
                type="text"
                autocomplete="username"
                placeholder="Enter your account details"
                :disabled="loading"
                required
                autofocus
                class="w-full h-12 px-4 rounded-xl border border-slate-300
                       bg-white text-sm text-slate-900 outline-none
                       placeholder:text-slate-400
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                       disabled:bg-slate-50 disabled:cursor-not-allowed
                       transition-all"
              />

              <p class="mt-2 text-xs text-slate-400 leading-5">
                We'll send a verification code to the phone
                number registered with your school account.
              </p>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full h-12 rounded-xl bg-blue-600 text-white
                     font-semibold text-sm hover:bg-blue-700
                     focus:outline-none focus:ring-4 focus:ring-blue-100
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all"
            >
              {{ loading ? 'Sending code...' : 'Send verification code' }}
            </button>
          </form>

          <!-- STEP 2: OTP -->
          <form
            v-else-if="step === 2"
            @submit.prevent="verifyOTP"
            class="space-y-6"
          >
            <div>
              <label
                for="otp"
                class="block text-sm font-semibold
                       text-slate-700 text-center mb-4"
              >
                Verification code
              </label>

              <div
                class="relative"
                @click="focusOTP"
              >
                <!-- SIX VISUAL BOXES -->
                <div
                  class="flex gap-2 justify-center pointer-events-none"
                  aria-hidden="true"
                >
                  <div
                    v-for="n in 6"
                    :key="n"
                    class="flex-1 min-w-0 max-w-12 h-12 sm:h-14
                           rounded-xl border-2 flex items-center
                           justify-center text-xl font-bold
                           text-slate-900 transition-all"
                    :class="otp.length === n - 1
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-300'"
                  >
                    {{ otp[n - 1] || '' }}
                  </div>
                </div>

                <!-- REAL INPUT FOR TYPING AND PASTE -->
                <input
                  id="otp"
                  ref="otpInput"
                  :value="otp"
                  @input="updateOTP"
                  type="text"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  maxlength="6"
                  pattern="[0-9]{6}"
                  aria-label="Six digit verification code"
                  :disabled="loading || resending"
                  class="absolute inset-0 w-full h-full
                         opacity-0 cursor-text"
                />
              </div>

              <p class="mt-3 text-xs text-slate-400 text-center">
                Enter the six-digit code sent by SMS.
              </p>
            </div>

            <button
              type="submit"
              :disabled="!canVerify || resending"
              class="w-full h-12 rounded-xl bg-blue-600 text-white
                     font-semibold text-sm hover:bg-blue-700
                     focus:outline-none focus:ring-4 focus:ring-blue-100
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all"
            >
              {{ loading ? 'Verifying...' : 'Verify code' }}
            </button>

            <div class="text-center">
              <p class="text-sm text-slate-500">
                Didn't receive the code?
              </p>

              <button
                type="button"
                @click="resendOTP"
                :disabled="
                  secondsLeft > 0 ||
                  resending ||
                  loading
                "
                class="mt-2 text-sm font-semibold
                       text-blue-600 hover:text-blue-700
                       disabled:text-slate-400
                       disabled:cursor-not-allowed"
              >
                {{
                  resending
                    ? 'Sending...'
                    : secondsLeft > 0
                      ? `Resend in ${secondsLeft}s`
                      : 'Resend code'
                }}
              </button>
            </div>
          </form>

          <!-- STEP 3: PASSWORD -->
          <form
            v-else
            @submit.prevent="savePassword"
            class="space-y-5"
          >

            <!-- ACCOUNT USERNAME -->
            <div v-if="username">
              <label class="block text-sm font-semibold text-slate-700 mb-2">
                Account username
              </label>

              <div
                class="h-12 flex items-center px-4 rounded-xl
                       bg-slate-50 border border-slate-200
                       text-sm font-medium text-slate-700"
              >
                {{ username }}
              </div>
            </div>

            <!-- NEW PASSWORD -->
            <div>
              <label
                for="newPassword"
                class="block text-sm font-semibold text-slate-700 mb-2"
              >
                New password
              </label>

              <div class="relative">
                <input
                  id="newPassword"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Enter your new password"
                  :disabled="loading"
                  minlength="8"
                  required
                  class="w-full h-12 px-4 rounded-xl border border-slate-300
                         bg-white text-sm text-slate-900 outline-none
                         placeholder:text-slate-400
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                         disabled:bg-slate-50 disabled:cursor-not-allowed
                         transition-all pr-16"
                />

                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  class="absolute right-4 top-1/2 -translate-y-1/2
                         text-xs font-semibold text-slate-500
                         hover:text-blue-600"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>

              <p
                class="mt-2 text-xs"
                :class="passwordValid
                  ? 'text-emerald-600'
                  : 'text-slate-400'"
              >
                Minimum 8 characters
              </p>
            </div>

            <!-- CONFIRM PASSWORD -->
            <div>
              <label
                for="confirmPassword"
                class="block text-sm font-semibold text-slate-700 mb-2"
              >
                Confirm new password
              </label>

              <div class="relative">
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  :type="showConfirm ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Confirm your new password"
                  :disabled="loading"
                  required
                  class="w-full h-12 px-4 rounded-xl border border-slate-300
                         bg-white text-sm text-slate-900 outline-none
                         placeholder:text-slate-400
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                         disabled:bg-slate-50 disabled:cursor-not-allowed
                         transition-all pr-16"
                />

                <button
                  type="button"
                  @click="showConfirm = !showConfirm"
                  :aria-label="showConfirm ? 'Hide password' : 'Show password'"
                  class="absolute right-4 top-1/2 -translate-y-1/2
                         text-xs font-semibold text-slate-500
                         hover:text-blue-600"
                >
                  {{ showConfirm ? 'Hide' : 'Show' }}
                </button>
              </div>

              <p
                v-if="confirmPassword && !passwordsMatch"
                class="mt-2 text-xs text-red-500"
              >
                Passwords do not match.
              </p>
            </div>

            <button
              type="submit"
              :disabled="!canSave"
              class="w-full h-12 rounded-xl bg-blue-600 text-white
                     font-semibold text-sm hover:bg-blue-700
                     focus:outline-none focus:ring-4 focus:ring-blue-100
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all"
            >
              {{ loading ? 'Saving password...' : 'Save new password' }}
            </button>
          </form>

          <!-- BACK -->
          <button
            v-if="step !== 3"
            type="button"
            @click="goBack"
            :disabled="loading || resending"
            class="mt-6 w-full text-sm font-medium
                   text-slate-500 hover:text-slate-900
                   disabled:opacity-50"
          >
            Back
          </button>

        </div>

        <p class="mt-6 text-center text-xs text-slate-400">
          Secured by  <a
          href="https://quantumripple.co.ke"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 font-medium hover:text-blue-700 hover:underline"
        > Quantum Ripple LTD </a>
        </p>
      </div>
    </main>
  </div>
</template>

