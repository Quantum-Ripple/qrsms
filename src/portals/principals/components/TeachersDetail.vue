<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">


      <!-- ================= VIEW MODE ================= -->
      <div v-if="teacher && !editMode" class="space-y-6">

        <!-- HEADER -->
        <div class="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl p-6">
          <h2 class="text-xl font-semibold">
            {{ teacher.first_name }} {{ teacher.last_name }}
          </h2>
          <p class="text-sm opacity-90">
            {{ teacher.email || 'No email' }}
          </p>
        </div>

        <!-- DETAILS -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="info-card"><span class="label">Gender</span><span>{{ teacher.gender }}</span></div>
          <div class="info-card"><span class="label">National ID</span><span>{{ teacher.national_id }}</span></div>
          <div class="info-card"><span class="label">Phone</span><span>{{ teacher.phone_number }}</span></div>
          <div class="info-card"><span class="label">DOB</span><span>{{ teacher.date_of_birth || '—' }}</span></div>

          <div class="md:col-span-2 info-card">
            <span class="label">Address</span>
            <span>{{ teacher.address || '—' }}</span>
          </div>
        </div>

        <!-- ASSIGNMENTS -->
        <div>
          <h3 class="font-semibold text-gray-700 mb-2">Teaching Assignments</h3>
          <div class="space-y-2">
            <div
              v-for="a in teacher.assignments"
              :key="a.id"
              class="bg-gray-100 px-3 py-2 rounded-lg text-sm"
            >
              {{ a.class_level_name }} • {{ a.stream_name }} • {{ a.subject }}
            </div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="flex gap-3 pt-4">
          <button @click="editMode = true" class="btn-primary">Edit</button>
          <button @click="deleteTeacher" class="btn-danger">Delete</button>
        </div>

      </div>

      <!-- ================= LOADING ================= -->
      <div v-else-if="!teacher" class="text-gray-500 italic">
        Loading Teacher...
      </div>

      <!-- ================= EDIT MODE ================= -->
      <div v-if="teacher && editMode" class="mt-8 border-t pt-6">

        <h3 class="text-xl font-semibold mb-4 text-gray-800">
          Edit Teacher
        </h3>

        <form @submit.prevent="updateTeacher" class="space-y-6">

          <!-- BASIC INFO -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input v-model="form.first_name" class="field" placeholder="First Name" />
            <input v-model="form.last_name" class="field" placeholder="Last Name" />

            <select v-model="form.gender" class="field">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <input v-model="form.national_id" class="field" placeholder="National ID" />

            <!-- READ ONLY EMAIL -->
            <input
              v-model="form.email"
              readonly
              class="field bg-gray-100 cursor-not-allowed"
            />

            <input v-model="form.phone_number" class="field" placeholder="Phone" />

            <input type="date" v-model="form.date_of_birth" class="field" />

            <textarea v-model="form.address" class="field col-span-2" placeholder="Address"></textarea>

            <label class="flex items-center gap-2 col-span-2">
              <input type="checkbox" v-model="form.is_class_teacher" />
              <span class="text-sm">Is Class Teacher</span>
            </label>

          </div>

          <!-- ASSIGNMENTS -->
          <div>
            <h4 class="text-lg font-semibold mb-2">Teaching Assignments</h4>

            <div class="space-y-3">
             <AssignmentForm
                v-for="(assignment, index) in form.assignments"
                :key="index"
                v-model="form.assignments[index]"
                :classLevels="classLevels"
                @remove="removeAssignment(index)"
              />
              </div>

            <button
              type="button"
              @click="addAssignment"
              class="mt-2 text-sm text-blue-600 hover:underline"
            >
              + Add Assignment
            </button>
          </div>

          <!-- ACTIONS -->
          <div class="flex justify-end gap-3 mt-4">
            <button type="submit" class="btn-success">Save</button>
            <button type="button" @click="editMode = false" class="btn-secondary">
              Cancel
            </button>
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
import { fetchClassLevels } from "@/api/classes.js"
import AssignmentForm from '../composables/AssignmentForm.vue'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const teacher = ref(null)
const form = ref(null)
const editMode = ref(false)

const classLevels = ref([])

/**
 * INIT
 */
onMounted(async () => {
  try {
    const res = await fetchClassLevels()
    const payload = Array.isArray(res.data)
      ? res.data
      : res.data?.results || res.data?.data || []

    classLevels.value = Array.isArray(payload) ? payload : []

    const id = route.params.id
    teacher.value = await teachersApi.get(id)

    normalizeForm()

  } catch (error) {
    console.error(error)
    toast.error("Failed to load teacher")
  }
})

/**
 * Normalize backend → form
 */
function normalizeForm() {
  form.value = {
    ...teacher.value,

    assignments: teacher.value.assignments?.map(a => ({
      id: a.id,
      class_level: a.class_level_id || resolveClassLevelId(a.class_level_name || a.class_level),
      stream: a.stream_id || resolveStreamId(a.stream_name || a.stream, a.class_level_id || a.class_level_name || a.class_level),
      subject: a.subject,
      is_class_teacher: a.is_class_teacher || false
    })) || []
  }
}

function resolveClassLevelId(value) {
  if (!value) return ''

  const normalizedValue = String(value).trim().toLowerCase()

  const match = classLevels.value.find((level) => {
    const levelName = String(level.name || level.class_level_name || level.class_level || '').trim().toLowerCase()
    return levelName === normalizedValue || String(level.id) === normalizedValue
  })

  return match ? Number(match.id) : ''
}

function resolveStreamId(value, classLevelValue) {
  if (!value) return ''

  const normalizedValue = String(value).trim().toLowerCase()
  const classLevelId = resolveClassLevelId(classLevelValue)

  const selectedClass = classLevels.value.find((level) => Number(level.id) === Number(classLevelId))
  const match = Array.isArray(selectedClass?.streams)
    ? selectedClass.streams.find((stream) => {
        const streamName = String(stream.name || stream.stream_name || stream.label || '').trim().toLowerCase()
        return streamName === normalizedValue || String(stream.id) === normalizedValue
      })
    : null

  return match ? Number(match.id) : ''
}

/**
 * Assignment controls
 */
function addAssignment() {
  form.value.assignments.push({
    class_level: '',
    stream: '',
    subject: '',
    is_class_teacher: false
  })
}

function removeAssignment(index) {
  form.value.assignments.splice(index, 1)
}

function buildAssignmentPayload() {
  return form.value.assignments
    .filter(a => a.class_level && a.stream && a.subject)
    .map((assignment) => {
      const selectedClass = Array.isArray(classLevels.value)
        ? classLevels.value.find((level) => Number(level.id) === Number(assignment.class_level))
        : null

      const selectedStream = Array.isArray(selectedClass?.streams)
        ? selectedClass.streams.find((stream) => Number(stream.id) === Number(assignment.stream))
        : null

      return {
        id: assignment.id,
        class_level: assignment.class_level,
        stream: assignment.stream,
        subject: assignment.subject
    }
    })
}

async function updateTeacher() {
  try {
    const payload = {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      email: form.value.email,
      phone_number: form.value.phone_number,
      gender: form.value.gender,
      date_of_birth: form.value.date_of_birth,
      address: form.value.address,
      is_active: teacher.value.is_active,
      school: teacher.value.school,
      is_class_teacher: form.value.is_class_teacher,
      national_id: form.value.national_id,
      assignments: buildAssignmentPayload()
    }

    console.log("Final payload:", payload)

    await teachersApi.update(teacher.value.id, payload)

    toast.success("Updated successfully")
    editMode.value = false

    teacher.value = await teachersApi.get(teacher.value.id)
    normalizeForm()

  } catch (error) {
  console.log(error.response?.data)
  console.log(JSON.stringify(error.response?.data, null, 2))
  toast.error("Update failed")
}
}


async function deleteTeacher() {
  const confirmed = confirm("Are you sure you want to delete this teacher?")
  if (!confirmed) return

  try {
    await teachersApi.remove(teacher.value.id)
    toast.success("Teacher deleted")
    router.push({ name: 'PrincipalTeachers' })
  } catch (error) {
    console.error(error)
    toast.error("Delete failed")
  }
}
</script>

<style scoped>
.field {
  width: 100%;
  border: 1px solid #e5e7eb;
  padding: 8px;
  border-radius: 8px;
}

.info-card {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 12px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
}

.label {
  font-size: 12px;
  color: #6b7280;
}

/* Buttons */
.btn-primary {
  background: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}

.btn-danger {
  background: #dc2626;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}

.btn-success {
  background: #16a34a;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}

.btn-secondary {
  background: #d1d5db;
  padding: 8px 16px;
  border-radius: 8px;
}
</style>