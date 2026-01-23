<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Parent Details</h2>

      <div v-if="parents && parents.length" class="space-y-6">
        <div v-for="parent in parents" :key="parent.id" class="p-4 border rounded-lg bg-gray-50">
          <h3 class="text-xl font-semibold mb-2">{{ parent.full_name }} ({{ parent.relationship }})</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="font-medium text-gray-700">Email:</p>
              <p class="text-gray-800">{{ parent.email || 'N/A' }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">Phone:</p>
              <p class="text-gray-800">{{ parent.phone || 'N/A' }}</p>
            </div>
            <div class="col-span-2">
              <p class="font-medium text-gray-700">Address:</p>
              <p class="text-gray-800">{{ parent.address || 'N/A' }}</p>
            </div>
            
            <div>
              <p class="font-medium text-gray-700">Date Joined:</p>
              <p class="text-gray-800">{{ parent.date_joined || 'N/A' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-gray-500 italic">No parents found.</div>

      <div class="mt-6">
        <button
          @click="$router.back()"
          class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
        >
          Back to Student
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import studentsApi from '../../api/Students.js'

const route = useRoute()
const parents = ref([])

onMounted(async () => {
  const studentId = route.params.id
  try {
    const student = await studentsApi.get(studentId)
    parents.value = student.parents || []
  } catch (error) {
    console.error('Failed to fetch parents:', error)
  }
})
</script>
