<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Auth from '../api/Auth'

const router = useRouter()
const route = useRoute()

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
    await Auth.login(username.value, password.value)

    const user = Auth.getUser()

    if (!user || !user.role) {
      Auth.logout()
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
      Auth.logout()
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
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-100">
    <div class="bg-white shadow-md rounded-lg p-6 w-full max-w-sm">

      <h2 class="text-xl font-semibold text-center mb-4">
        {{ title }}
      </h2>

      <input
        v-model="username"
        type="text"
        placeholder="Username"
        class="border rounded w-full p-2 mb-3"
      />

      <!-- Password -->
      <div class="relative mb-3">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Password"
          class="border rounded w-full p-2 pr-10"
        />

        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
        >
          <i
            :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"
          ></i>
        </button>
      </div>

      <div class="mb-4 flex items-start gap-2 text-sm text-slate-600">
        <input
          id="acceptPolicies"
          v-model="agreedToPolicies"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />

        <label for="acceptPolicies" class="leading-6">
          I have read and agree to the
          <router-link
            to="/terms"
            class="font-medium text-blue-600 hover:underline"
          >
            Terms of Use
          </router-link>
          and
          <router-link
            to="/privacy"
            class="font-medium text-blue-600 hover:underline"
          >
            Privacy Policy
          </router-link>.
        </label>
      </div>

      <button
        @click="handleLogin"
        :disabled="loading || !agreedToPolicies"
        class="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:opacity-60"
      >
        <span v-if="!loading">Login</span>
        <span v-else>Signing in...</span>
      </button>

      <p v-if="error" class="text-red-500 text-sm mt-3">
        {{ error }}
      </p>

    </div>
  </div>
</template>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
</style>