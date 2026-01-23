<template>
  <div class="p-6 max-w-2xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">Create Announcement</h2>
      <button
        @click="router.push({ name: 'Events' })"
        class="text-blue-600 hover:underline"
      >
        ← Back to Announcements
      </button>
    </div>

    <!-- Success message -->
    <div
      v-if="successMessage"
      class="bg-green-100 text-green-700 p-3 rounded mb-4"
    >
      {{ successMessage }}
    </div>

    <!-- Error message -->
    <div
      v-if="errorMessage"
      class="bg-red-100 text-red-700 p-3 rounded mb-4"
    >
      {{ errorMessage }}
    </div>

    <!-- Create form -->
    <form @submit.prevent="createEvent" class="space-y-5">
      <!-- Title -->
      <div>
        <label class="block text-gray-700 font-medium mb-2">Title</label>
        <input
          v-model="form.title"
          type="text"
          placeholder="Enter announcement title"
          class="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
          required
        />
      </div>

      <!-- Message -->
      <div>
        <label class="block text-gray-700 font-medium mb-2">Message</label>
        <textarea
          v-model="form.message"
          placeholder="Write the announcement message here..."
          class="w-full border rounded-lg p-2 h-32 focus:ring focus:ring-blue-300"
          required
        ></textarea>
      </div>

      <!-- Target Audience -->
      <div>
        <label class="block text-gray-700 font-medium mb-2">Target Audience</label>
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center space-x-2">
            <input
              type="radio"
              value="students"
              v-model="form.target_audience"
            />
            <span>Students</span>
          </label>
          <label class="flex items-center space-x-2">
            <input
              type="radio"
              value="teachers"
              v-model="form.target_audience"
            />
            <span>Teachers</span>
          </label>
          <label class="flex items-center space-x-2">
            <input
              type="radio"
              value="parents"
              v-model="form.target_audience"
            />
            <span>Parents</span>
          </label>
          <label class="flex items-center space-x-2">
            <input
              type="radio"
              value="all"
              v-model="form.target_audience"
            />
            <span>All</span>
          </label>
        </div>
      </div>

      <!-- Submit -->
      <div>
        <button
          type="submit"
          :disabled="loading"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {{ loading ? 'Creating...' : 'Create Announcement' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import * as eventApi from '../../api/events.js'

const router = useRouter()

// form data
const form = ref({
  title: '',
  message: '',
  target_audience: '',
})

// states
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// assume user info is stored in localStorage after login
const user = JSON.parse(localStorage.getItem('user')) || {}
const school_id = user.school?.id || user.school_id || 1 // fallback for testing


// handle submit
async function createEvent() {
  if (!form.value.title || !form.value.message || !form.value.target_audience) {
    errorMessage.value = 'Please fill in all required fields.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = {
      title: form.value.title,
      message: form.value.message,
      target_audience: form.value.target_audience, // if backend expects comma-separated
      school: school_id,
      
    }
    console.log('Creating announcement with payload:', payload)

    await eventApi.createEvent(payload)
    successMessage.value = 'Announcement created successfully!'
    form.value = { title: '', message: '', target_audience: '' }

    // optionally redirect after a short delay
    setTimeout(() => {
      router.push({ name: 'Events' })
    }, 1500)
  } catch (err) {
    console.error('Failed to create announcement:', err)
    errorMessage.value = err.message || 'Error creating announcement.'
  } finally {
    loading.value = false
  }
}
</script>