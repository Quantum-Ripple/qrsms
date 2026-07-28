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

            <div class="flex items-center space-x-3 md:col-span-2">
              <input type="checkbox" v-model="form.is_class_teacher" />
              <label class="text-sm text-gray-700">Is Class Teacher</label>
            </div>

          </div>
        </div>

        <!-- TEACHING ASSIGNMENTS -->
        <div class="border rounded-xl p-6 bg-gray-50">
          <h4 class="text-md font-semibold mb-5 text-gray-700">
            Teaching Assignments
          </h4>

          <div class="space-y-6">

            <div
              v-for="(assignment, index) in assignments"
              :key="index"
              class="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg bg-white"
            >

              <!-- CLASS LEVEL -->
              <div>
                <label class="label">Class Level</label>
                <select v-model="assignment.class_level" class="field">
                  <option value="">Select Class</option>
                  <option v-for="cls in classLevels" :key="cls.id" :value="cls.id">
                    {{ cls.name || cls.class_level_name || cls.class_level || `Class ${cls.id}` }}
                  </option>
                </select>
              </div>

              <!-- STREAM -->
              <div>
                <label class="label">Stream</label>
                <select
                    v-model="assignment.stream"
                    class="field"
                    :disabled="!assignment.class_level"
                  >
                    <option value="">Select Stream</option>
                    <option
                      v-for="stream in getStreams(assignment.class_level)"
                      :key="stream.id"
                      :value="stream.id"
                    >
                      {{ stream.name || stream.stream_name || stream.label || `Stream ${stream.id}` }}
                    </option>
                  </select>
              </div>

              <!-- SUBJECT -->
              <div>
                <label class="label">Subject</label>
                <select v-model="assignment.subject" class="field">
                    <option value="">Select Subject</option>
                    <option
                      v-for="sub in subjects"
                      :key="sub.value"
                      :value="sub.value"
                    >
                      {{ sub.label }}
                    </option>
                  </select>
                </div>

              <button
                v-if="assignments.length > 1"
                type="button"
                @click="removeAssignment(index)"
                class="text-red-500 text-sm"
              >
                Remove
              </button>

            </div>

          </div>

          <button
            type="button"
            @click="addAssignment"
            class="mt-4 text-sm text-blue-600 hover:underline"
          >
            + Add Assignment
          </button>
        </div>

        <!-- ACTIONS -->
        <div class="flex justify-end space-x-4 pt-4 border-t">

          <router-link
            :to="{ name: 'PrincipalTeachers' }"
            class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </router-link>

          <button
            type="submit"
            class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Teacher
          </button>

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
import { SUBJECTS } from '@/constants/subjects.js'

const router = useRouter()
const toast = useToast()

const classLevels = ref([])
const subjects = SUBJECTS

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
  is_class_teacher: false,
})

const assignments = ref([
  { class_level: '', stream: '', subject: '' }
])

function addAssignment() {
  assignments.value.push({ class_level: '', stream: '', subject: '' })
}

function removeAssignment(index) {
  assignments.value.splice(index, 1)
}


 
function getStreams(classId) {
  const selected = Array.isArray(classLevels.value)
    ? classLevels.value.find(cls => Number(cls.id) === Number(classId))
    : null

  return Array.isArray(selected?.streams) ? selected.streams : []
}
function buildAssignmentPayload() {
  return assignments.value
    .filter((assignment) => assignment.class_level && assignment.stream && assignment.subject)
    .map((assignment) => {
      const selectedClass = Array.isArray(classLevels.value)
        ? classLevels.value.find((level) => Number(level.id) === Number(assignment.class_level))
        : null

      const selectedStream = Array.isArray(selectedClass?.streams)
        ? selectedClass.streams.find((stream) => Number(stream.id) === Number(assignment.stream))
        : null

      return {
        class_level: [selectedClass?.name || selectedClass?.class_level_name || assignment.class_level],
        stream: [selectedStream?.name || selectedStream?.stream_name || assignment.stream],
        subject: assignment.subject,
      }
    })
}

async function createTeacher() {
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
  }
}

onMounted(async () => {
  try {
    const res = await fetchClassLevels()
    const payload = Array.isArray(res.data)
      ? res.data
      : res.data?.results || res.data?.data || []

    classLevels.value = Array.isArray(payload) ? payload : []
  } catch (err) {
    console.error("Failed to load class levels", err)
  }
})
</script>