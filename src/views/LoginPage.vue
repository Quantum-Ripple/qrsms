<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Auth from '../api/Auth'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
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

   
    if (!ALLOWED_ROLES.value.includes(user.role.toLowerCase())) {
      Auth.logout()
      error.value = `Your account does not have access to the ${portalRole.value} portal.`
      return
    }

    if (portalRole.value === 'student') {
       return router.push('/student')
      }

    else if(portalRole.value === 'teacher') {
      return router.push('/teachers')
    }
    else if(portalRole.value === 'principal'){
      return router.push('/principal')
    }
    else if(portalRole.value === 'finance'){
      return router.push('/finance')
    }
    else if(portalRole.value === 'parent'){
      return router.push('/parent')
    }

    else{
      router.push('/')
    }

    

  } catch (err) {

    if (err?.response?.status === 401) {
      error.value = 'Invalid credentials. Please try again.'
    } else if (err?.response?.status === 403) {
      error.value = 'You are not authorized to access this portal.'
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
      <h2 class="text-xl font-semibold text-center mb-4">{{ title }}</h2>

      <input
        v-model="username"
        type="text"
        placeholder="Username"
        class="border rounded w-full p-2 mb-3"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="border rounded w-full p-2 mb-3"
      />

      <button
        @click="handleLogin"
        :disabled="loading"
        class="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:opacity-60"
      >
        <span v-if="!loading">Login</span>
        <span v-else>Signing in...</span>
      </button>

      <p v-if="error" class="text-red-500 text-sm mt-3">{{ error }}</p>
    </div>
  </div>
</template>
