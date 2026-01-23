<template>
  <!-- OVERLAY -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="$emit('close')"
  >
    <!-- MODAL -->
    <div
      class="bg-white rounded-lg shadow-xl w-full max-w-4xl"
      @click.stop
    >
      <!-- HEADER -->
      <div class="flex justify-between items-center px-6 py-4 border-b">
        <h3 class="text-xl font-semibold text-gray-800">Add New Teacher</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <!-- BODY -->
      <div class="px-6 py-6 max-h-[70vh] overflow-y-auto">
        <form @submit.prevent="createTeacher" class="space-y-8">
          
          <!-- PERSONAL INFORMATION -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Personal Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label class="block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" v-model="form.first_name" required class="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" v-model="form.last_name" required class="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" v-model="form.email" class="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" v-model="form.phone_number" class="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">National ID</label>
                <input type="number" v-model="form.national_id" class="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Gender</label>
                <select v-model="form.gender" required class="mt-1 w-full border rounded-lg px-3 py-2">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input type="date" v-model="form.date_of_birth" class="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Hire Date</label>
                <input type="date" v-model="form.hire_date" class="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" v-model="form.password" required class="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>

              

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Address</label>
                <textarea v-model="form.address" rows="3" class="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>
              <div class="flex items-center space-x-2 mt-4">
  <input
    type="checkbox"
    v-model="form.is_class_teacher"
    class="rounded border-gray-300"
  />
  <label class="text-sm text-gray-700">Is Class Teacher</label>
</div>

              
 


            </div>
          </div>

          <!-- TEACHING ASSIGNMENTS -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Teaching Assignments</h4>
            <div class="space-y-4">
              <AssignmentForm
                v-for="(assignment, index) in assignments"
                :key="index"
                v-model="assignments[index]"
                :removable="assignments.length > 1"
                @remove="removeAssignment(index)"
              />
            </div>

            <button type="button" @click="addAssignment" class="mt-4 text-sm text-blue-600 hover:underline">
              + Add Assignment
            </button>
          </div>

          <!-- ACTION BUTTONS -->
          <div class="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create Teacher</button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import teachersApi from '../api/Teachers.js'
import AssignmentForm from '../composables/AssignmentForm.vue'

const emit = defineEmits(['close', 'teacherCreated'])

const user = JSON.parse(localStorage.getItem('user'))
const schoolId = user?.school

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  gender: '',
  date_of_birth: null,
  hire_date: null,
  national_id: '',
  password: '',
  address: '',
  is_active: true,
})

const assignments = ref([
  { class_level: '', stream: '', subject: '', is_class_teacher: false },
])

function addAssignment() {
  assignments.value.push({ class_level: '', stream: '', subject: '', is_class_teacher: false })
}

function removeAssignment(index) {
  assignments.value.splice(index, 1)
}

async function createTeacher() {
  try {
    const payload = { ...form.value, school: schoolId, assignments: assignments.value }
    await teachersApi.create(payload)
    emit('teacherCreated')
    emit('close')
  } catch (error) {
    console.error('Error creating teacher:', error)
    alert('Failed to create teacher.')
  }
}
</script>

