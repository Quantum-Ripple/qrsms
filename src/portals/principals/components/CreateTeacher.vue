<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">

    <!-- HEADER -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">Add New Teacher</h2>

      <router-link
        :to="{ name: 'PrincipalTeachers' }"
        class="text-blue-600 hover:underline text-sm"
      >
        ← Back to Teachers
      </router-link>
    </div>

    <!-- FORM CARD -->
    <div class="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">

      <form @submit.prevent="createTeacher" class="space-y-10">

        <!-- PERSONAL INFORMATION -->
        <div class="border rounded-xl p-6 bg-gray-50">
          <h4 class="text-md font-semibold mb-5 text-gray-700">
            Personal Information
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label class="block text-sm font-medium text-gray-600">First Name</label>
              <input v-model="form.first_name" required type="text"
                class="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">Last Name</label>
              <input v-model="form.last_name" required type="text"
                class="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-600">Email</label>
              <input type="email" v-model="form.email" required
                class="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">Phone Number</label>
              <input type="tel" v-model="form.phone_number" required
                class="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">National ID</label>
              <input type="number" v-model="form.national_id" required
                class="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">Gender</label>
              <select v-model="form.gender" required
                class="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">Date of Birth</label>
              <input type="date" v-model="form.date_of_birth" required
                class="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">Hire Date</label>
              <input type="date" v-model="form.hire_date" required
                class="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600">Password</label>
              <input type="password" v-model="form.password" required
                class="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-600">Address</label>
              <textarea v-model="form.address" rows="3"
                class="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"></textarea>
            </div>

            <div class="flex items-center space-x-3 md:col-span-2">
              <input type="checkbox" v-model="form.is_class_teacher"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label class="text-sm text-gray-700">Is Class Teacher</label>
            </div>

          </div>
        </div>

        <!-- TEACHING ASSIGNMENTS -->
        <div class="border rounded-xl p-6 bg-gray-50">
          <h4 class="text-md font-semibold mb-5 text-gray-700">
            Teaching Assignments
          </h4>

          <div class="space-y-4">
            <AssignmentForm
              v-for="(assignment, index) in assignments"
              :key="index"
              v-model="assignments[index]"
              :removable="assignments.length > 1"
              @remove="removeAssignment(index)"
            />
          </div>

          <button
            type="button"
            @click="addAssignment"
            class="mt-4 text-sm text-blue-600 hover:underline"
          >
            + Add Assignment
          </button>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="flex justify-end space-x-4 pt-4 border-t">
          <router-link
            :to="{ name: 'PrincipalTeachers' }"
            class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </router-link>

          <button
            type="submit"
            class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition"
          >
            Create Teacher
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import teachersApi from '../api/Teachers.js'
import AssignmentForm from '../composables/AssignmentForm.vue'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()

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
    const payload = {
      ...form.value,
      school: schoolId,
      assignments: assignments.value
    }

    await teachersApi.create(payload)

    toast.success("Teacher created successfully!")
    router.push({ name: 'PrincipalTeachers' })

  } catch (error) {
    console.error('Error creating teacher:', error)
    toast.error("Failed to create teacher.")
  }
}
</script>

