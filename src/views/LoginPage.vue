<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)

const error = ref('')
const loading = ref(false)
const agreedToPolicies = ref(false)
const portalRole = ref('student')

const ALLOWED_ROLES = ref(['student'])
const title = ref('Login')

onMounted(() => {
  const role = route.query.role?.toString().toLowerCase()
  if (role) {
    portalRole.value = role
    ALLOWED_ROLES.value = [role]
    title.value = role.charAt(0).toUpperCase() + role.slice(1) + ' Login'
  }
})

const handleLogin = async () => {
  if (!agreedToPolicies.value) {
    error.value = 'Please accept the Privacy Policy and Terms of Use to continue.'
    return
  }

  error.value = ''
  loading.value = true

  try {
    const user = await auth.login(username.value, password.value)

    if (!user || !user.role) {
      await auth.logout()
      error.value = 'Login failed (no user info). Try again.'
      return
    }

    const normalizedRole = user.role.toLowerCase()

    const ROLE_TO_PORTAL_PATH = {
      student: '/student',
      teacher: '/teachers',
      principal: '/principal',
      admin: '/principal',
      finance: '/finance',
      parent: '/parent',
    }

    const portalPath = ROLE_TO_PORTAL_PATH[normalizedRole]

    if (!portalPath) {
      await auth.logout()
      error.value = 'No portal configured for your role.'
      return
    }

    return router.push(portalPath)

  } catch (err) {
    if (err?.response?.status === 400) {
      error.value = 'Invalid credentials. Please try again.'
    } else if (err?.response?.status === 401) {
      error.value = 'You are not authorized.'
    } else {
      error.value = 'Login failed. Please try again.'
      console.error('Login error:', err)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-slate-50 px-4">

    <!-- BRAND HEADER -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-14 h-14 flex-shrink-0">
        <svg viewBox="0 0 56 56" fill="none" aria-hidden="true">
          <path
            d="M45 26A18 18 0 1 0 12 36"
            stroke="#1e3a8a"
            stroke-width="5.5"
            stroke-linecap="round"
          />
          <path
            d="M7 43C18 33 27 35 36 40C42 44 46 45 51 42"
            stroke="#f97316"
            stroke-width="5"
            stroke-linecap="round"
          />
          <path
            d="M12 48C23 41 32 43 39 47"
            stroke="#2563eb"
            stroke-width="3.5"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <div class="flex flex-col">
        <strong class="text-2xl font-bold tracking-tight text-slate-900">
          QRSMS
        </strong>
        <span class="text-xs text-slate-500 font-medium">
          <i>Simple.Reliable.Trusted</i>
        </span>
      </div>
    </div>

    <!-- LOGIN CARD -->
    <div class="bg-white border border-slate-200 shadow-sm rounded-xl p-6 w-full max-w-sm">

      <h2 class="text-xl font-semibold text-center text-slate-800 mb-5">
        {{ title }}
      </h2>

      <input
        v-model="username"
        type="text"
        placeholder="Username"
        class="border border-slate-300 rounded-lg w-full p-3 mb-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
      />

      <!-- Password -->
      <div class="relative mb-3">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Password"
          class="border border-slate-300 rounded-lg w-full p-3 pr-10 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
        />

        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
        >
          <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
        </button>
      </div>

      <!-- Policies -->
      <div class="mb-4 flex items-start gap-2 text-sm text-slate-600">
        <input
          id="acceptPolicies"
          v-model="agreedToPolicies"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />

        <label for="acceptPolicies" class="leading-6">
          I have read and agree to the
          <router-link to="/terms" class="font-medium text-blue-600 hover:underline">
            Terms of Use
          </router-link>
          and
          <router-link to="/privacy" class="font-medium text-blue-600 hover:underline">
            Privacy Policy
          </router-link>.
        </label>
      </div>

      <!-- Login -->
      <button
        @click="handleLogin"
        :disabled="loading || !agreedToPolicies"
        class="bg-blue-600 text-white w-full py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        <span v-if="!loading">Login</span>
        <span v-else>Signing in...</span>
      </button>

      <div class="mt-4 flex justify-end">
        <router-link
          to="/staff/password"
          class="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          Forgot password?
        </router-link>
      </div>

      <p v-if="error" class="text-red-500 text-sm mt-3">
        {{ error }}
      </p>
    </div>

    <!-- FOOTER -->
    <p class="text-xs text-slate-400 mt-6">
      A product of
      <a
        href="https://quantumripple.co.ke"
        target="_blank"
        rel="noopener noreferrer"
        class="text-blue-600 font-medium hover:text-blue-700 hover:underline"
      >
        Quantum Ripple LTD
      </a>
    </p>

  </div>
</template>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
</style>
