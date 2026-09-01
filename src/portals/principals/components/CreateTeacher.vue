<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">

    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">Add New Teacher</h2>
      <router-link :to="{ name: 'PrincipalTeachers' }" class="text-blue-600 hover:underline text-sm">
        ← Back to Teachers
      </router-link>
    </div>

    <div class="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
      <form @submit.prevent="createTeacher" class="space-y-10">

        <!-- PERSONAL INFORMATION -->
        <div class="border rounded-xl p-6 bg-gray-50">
          <h4 class="text-md font-semibold mb-5 text-gray-700">Personal Information</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="label">First Name</label>
              <input v-model="form.first_name" required class="field" />
            </div>
            <div>
              <label class="label">Last Name</label>
              <input v-model="form.last_name" required class="field" />
            </div>
            <div class="md:col-span-2">
              <label class="label">Email</label>
              <input type="email" v-model="form.email" required class="field" />
            </div>
            <div>
              <label class="label">Phone Number</label>
              <input type="tel" v-model="form.phone_number" required class="field" />
            </div>
            <div>
              <label class="label">National ID</label>
              <input type="number" v-model="form.national_id" required class="field" />
            </div>
            <div>
              <label class="label">Gender</label>
              <select v-model="form.gender" required class="field">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label class="label">Date of Birth</label>
              <input type="date" v-model="form.date_of_birth" required class="field" />
            </div>
            <div>
              <label class="label">Hire Date</label>
              <input type="date" v-model="form.hire_date" required class="field" />
            </div>
            <div>
              <label class="label">Password</label>
              <input type="password" v-model="form.password" required class="field" />
            </div>
            <div class="md:col-span-2">
              <label class="label">Address</label>
              <textarea v-model="form.address" rows="3" class="field"></textarea>
            </div>
            <!-- REMOVED: global "Is Class Teacher" checkbox — this is now
                 set per assignment below, since a teacher can be class
                 teacher of one specific class but not others. -->
          </div>
        </div>

        <!-- TEACHING ASSIGNMENTS -->
        <div class="border rounded-xl p-6 bg-gray-50">
          <div class="flex items-center justify-between mb-5">
            <h4 class="text-md font-semibold text-gray-700">Teaching Assignments</h4>
            <button type="button" @click="addAssignment" class="text-sm text-blue-600 hover:underline">
              + Add Assignment
            </button>
          </div>

          <!-- CHANGED: reuses the same AssignmentForm component EditTeacher
               uses, instead of a second, hand-rolled set of fields. This is
               what already had the per-row "Is Class Teacher" checkbox —
               reusing it here means both screens can't drift apart again. -->
          <div class="space-y-4">
            <AssignmentForm
              v-for="(assignment, index) in assignments"
              :key="index"
              v-model="assignments[index]"
              :classLevels="classLevels"
              :removable="assignments.length > 1"
              @remove="removeAssignment(index)"
            />
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="flex justify-end space-x-4 pt-4 border-t">
          <router-link :to="{ name: 'PrincipalTeachers' }" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Cancel
          </router-link>
          <LoadingButton
            type="submit"
            :loading="loading"
            loading-text="Creating..."
            class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Teacher
          </LoadingButton>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import teachersApi from '../api/Teachers.js'
import { useToast } from 'vue-toastification'
import { fetchClassLevels } from '@/api/classes.js'
import LoadingButton from '@/components/LoadingButton.vue'
import AssignmentForm from '../composables/AssignmentForm.vue'


const loading = ref(false)
const router = useRouter()
const toast = useToast()

const classLevels = ref([])

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
  // REMOVED: is_class_teacher — no longer a global field
})

const assignments = ref([
  { class_level: '', stream: '', subject: '', is_class_teacher: false }  // NEW field
])

function addAssignment() {
  assignments.value.push({ class_level: '', stream: '', subject: '', is_class_teacher: false })
}

function removeAssignment(index) {
  assignments.value.splice(index, 1)
}

function buildAssignmentPayload() {
  return assignments.value
    .filter((assignment) => assignment.class_level && assignment.stream && assignment.subject)
    .map((assignment) => ({
      class_level: Number(assignment.class_level),
      stream: Number(assignment.stream),
      subject: assignment.subject,
      is_class_teacher: !!assignment.is_class_teacher,  // NEW: was silently dropped before
    }))
}

async function createTeacher() {
  loading.value = true
  try {
    const payload = {
      ...form.value,
      assignments: buildAssignmentPayload()
    }
    await teachersApi.create(payload)
    toast.success("Teacher created successfully!")
    router.push({ name: 'PrincipalTeachers' })
  } catch (err) {
    console.error(err)
    toast.error("Failed to create teacher.")
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await fetchClassLevels()
    const payload = Array.isArray(res.data) ? res.data : res.data?.results || res.data?.data || []
    classLevels.value = Array.isArray(payload) ? payload : []
  } catch (err) {
    console.error("Failed to load class levels", err)
  }
})
</script>