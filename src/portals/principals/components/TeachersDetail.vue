<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Teacher Details</h2>

      <!-- VIEW MODE -->
      <div v-if="teacher && !editMode" class="space-y-3">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="font-medium text-gray-700">First Name:</p>
            <p class="text-gray-800">{{ teacher.first_name }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Last Name:</p>
            <p class="text-gray-800">{{ teacher.last_name }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Gender:</p>
            <p class="text-gray-800">{{ teacher.gender }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">National ID:</p>
            <p class="text-gray-800">{{ teacher.national_id }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Email:</p>
            <p class="text-gray-800">{{ teacher.email || 'N/A' }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Phone:</p>
            <p class="text-gray-800">{{ teacher.phone_number || 'N/A' }}</p>
          </div>
          <div class="col-span-2">
            <p class="font-medium text-gray-700">Address:</p>
            <p class="text-gray-800">{{ teacher.address || 'N/A' }}</p>
          </div>
          <div class="col-span-2">
            <p class="font-medium text-gray-700">Assignments:</p>
            <ul class="list-disc pl-5">
              <li v-for="assignment in teacher.assignments" :key="assignment.id">
                {{ assignment.class_level }} - {{ assignment.stream }} - {{ assignment.subject }}
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-6 flex items-center gap-3">
          <button @click="editMode = true" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Edit
          </button>
          <button @click="deleteTeacher" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Delete
          </button>
        </div>
      </div>

      <!-- LOADING -->
      <div v-else-if="!teacher" class="text-gray-500 italic">Loading Teacher...</div>

      <!-- EDIT MODE -->
      <div v-if="teacher && editMode" class="mt-8 border-t pt-6">
        <h3 class="text-xl font-semibold mb-4 text-gray-800">Edit Teacher</h3>
        <form @submit.prevent="updateTeacher" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">First Name</label>
              <input v-model="teacher.first_name" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
              <input v-model="teacher.last_name" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Gender</label>
              <select v-model="teacher.gender" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">National ID</label>
              <input v-model="teacher.national_id" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input type="email" v-model="teacher.email" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              <input v-model="teacher.phone_number" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
              <input type="date" v-model="teacher.date_of_birth" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-600 mb-1">Address</label>
              <textarea v-model="teacher.address" rows="2" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>
            </div>
            <div class="flex items-center space-x-2 mt-4">
  <input
    type="checkbox"
    v-model="teacher.is_class_teacher"
    class="rounded border-gray-300"
  />
  <label class="text-sm text-gray-700">Is Class Teacher</label>
</div>

          </div>

          <!-- ASSIGNMENTS -->
          <div>
            <h4 class="text-lg font-semibold mb-2">Teaching Assignments</h4>
            <div class="space-y-3">
              <AssignmentForm
                v-for="(assignment, index) in teacher.assignments"
                :key="assignment.id || index"
                v-model="teacher.assignments[index]"
                :removable="teacher.assignments.length > 1"
                @remove="removeAssignment(index)"
              />
            </div>
            <button type="button" @click="addAssignment" class="mt-2 text-sm text-blue-600 hover:underline">
              + Add Assignment
            </button>
          </div>

          <!-- ACTION BUTTONS -->
          <div class="flex justify-end gap-3 mt-4">
            <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">Save</button>
            <button type="button" @click="editMode = false" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import teachersApi from '../api/Teachers.js'
import AssignmentForm from '../composables/AssignmentForm.vue'

const route = useRoute()
const router = useRouter()

const teacher = ref(null)
const editMode = ref(false)

onMounted(async () => {
  const id = route.params.id
  try {
    teacher.value = await teachersApi.get(id)
    // Ensure assignments array is reactive
    if (!teacher.value.assignments || !Array.isArray(teacher.value.assignments)) {
      teacher.value.assignments = []
    }
  } catch (error) {
    console.error('Failed to fetch teacher:', error)
  }
})

function addAssignment() {
  teacher.value.assignments.push({ class_level: '', stream: '', subject: '', is_class_teacher: false })
}

function removeAssignment(index) {
  teacher.value.assignments.splice(index, 1)
}

async function updateTeacher() {
  try {
    await teachersApi.update(teacher.value.id, teacher.value)
    editMode.value = false
  } catch (error) {
    console.error('Failed to update teacher:', error)
  }
}

async function deleteTeacher() {
  try {
    await teachersApi.remove(teacher.value.id)
    router.push({ name: 'TeachersPage' })
  } catch (error) {
    console.error('Failed to delete teacher:', error)
  }
}
</script>

