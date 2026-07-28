<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-800">Student Details</h2>
        <router-link
          :to="{ name: 'ParentDetails', params: { id: student?.id } }"
          class="text-blue-600 hover:underline text-sm"
        >
          View Parents →
        </router-link>
      </div>

      <div v-if="student && !editMode" class="space-y-6">

            <!-- PROFILE HEADER -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl p-6">
              <h2 class="text-xl font-semibold">{{ student.full_name }}</h2>
              <p class="text-sm opacity-90">
                Admission No: {{ student.admission_number }}
              </p>
            </div>

            <!-- INFO GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div class="info-card">
                <span class="label">Grade</span>
                <span>{{ student.current_class_level }}</span>
              </div>

              <div class="info-card">
                <span class="label">Stream</span>
                <span>{{ student.current_stream }}</span>
              </div>

              <div class="info-card">
                <span class="label">Gender</span>
                <span>{{ student.gender }}</span>
              </div>

              <div class="info-card">
                <span class="label">Date of Birth</span>
                <span>{{ student.date_of_birth || '—' }}</span>
              </div>

              <div class="info-card">
                <span class="label">Phone</span>
                <span>{{ student.phone }}</span>
              </div>

              <div class="info-card">
                <span class="label">Email</span>
                <span>{{ student.email }}</span>
              </div>

              <div class="md:col-span-2 info-card">
                <span class="label">Address</span>
                <span>{{ student.address }}</span>
              </div>

            </div>

            <!-- ACTIONS -->
            <div class="flex gap-3 pt-4">
              <button
                @click="editMode = true"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Edit
              </button>

              <button
                @click="deleteStudent"
                class="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
              <router-link :to="{ name: 'PrincipalStudents'}" class="text-blue-600 hover:underline text-sm ml-auto">
                      <- Back to students
                    </router-link>
            </div>

          </div>

                


   


      <div v-else-if="!student" class="text-gray-500 italic">Loading student...</div>

      
      <div v-if="editMode" class="mt-8 border-t pt-6">
        <h3 class="text-xl font-semibold mb-4 text-gray-800">Edit Student</h3>

        <form @submit.prevent="updateStudent" class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">First Name</label>
            <input v-model="form.first_name" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
            <input v-model="form.last_name" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Admission Number</label>
            <input
            :value="form.admission_number"
            class="w-full border rounded-lg px-3 py-2 bg-gray-100"
            readonly
          />
          </div>


          <div>
              <label class="label">Grade</label>
              <select v-model="form.class_level" required class="field">
                <option value="">Select Grade</option>
                <option
                  v-for="grade in classLevels"
                  :key="grade.id"
                  :value="grade.id"
                >
                  {{ grade.name }}
                </option>
              </select>
            </div>

            <div>
            <label class="label">Stream</label>
            <select
              v-model="form.stream"
              required
              class="field"
              
            >
              <option value="">Select Stream</option>
              <option
                v-for="stream in streams"
                :key="stream.id"
                :value="stream.id"
              >
                {{ stream.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Gender</label>
            <select v-model="form.gender" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
            <input type="date" v-model="form.date_of_birth" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input type="email" v-model="form.email" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <input type="tel" v-model="form.phone" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-600 mb-1">Address</label>
            <textarea v-model="form.address" rows="3" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>
          </div>

          <h4 class="text-lg font-medium mt-6 mb-4 md:col-span-2">Parent 1 Details</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">First Name</label>
              <input v-model="form.parent1.first_name" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
              <input v-model="form.parent1.last_name" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input v-model="form.parent1.email" type="email" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              <input v-model="form.parent1.phone" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Relationship</label>
              <select v-model="form.parent1.relationship" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select Relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-600 mb-1">Address</label>
              <textarea v-model="form.parent1.address" rows="2" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>
            </div>
          </div>

         
          <div v-if="showParent2">
            <h4 class="text-lg font-medium mt-6 mb-4 md:col-span-2">Parent 2 Details</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                <input v-model="form.parent2.first_name" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                <input v-model="form.parent2.last_name" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input v-model="form.parent2.email" type="email" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <input v-model="form.parent2.phone" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Relationship</label>
                <select v-model="form.parent2.relationship" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select Relationship</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <textarea v-model="form.parent2.address" rows="2" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>
              </div>
            </div>
          </div>

          <div v-if="!showParent2" class="md:col-span-2 mt-4">
            <button type="button" @click="showParent2 = true" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Add Another Parent
            </button>
          </div>

          
          <div class="md:col-span-2 flex justify-end gap-3 mt-4">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Save
            </button>
            <button type="button" @click="editMode = false" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>

      </div>
    </div>
    
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import studentsApi from '../api/Students.js'
import { fetchClassLevels } from "@/api/classes.js"

const route = useRoute()
const router = useRouter()
const toast = useToast()

const student = ref(null)
const editMode = ref(false)
const showParent2 = ref(false)

/**
 * Class & Stream state
 */
const classLevels = ref([])
const streams = ref([])

/**
 * Main form (single source of truth)
 */
const form = ref({
  admission_number: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  class_level: '',
  stream: '',
  gender: '',
  date_of_birth: null,
  email: '',
  phone: '',
  address: '',
  parent1: {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    relationship: '',
    address: '',
    id: null
  },
  parent2: {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    relationship: '',
    address: '',
    id: null
  },
})

function resolveClassLevelId(value) {
  if (!value) return ''

  const normalizedValue = String(value).trim().toLowerCase()

  const match = Array.isArray(classLevels.value)
    ? classLevels.value.find((level) => {
        const levelName = String(level.name || level.class_level_name || '').trim().toLowerCase()
        return levelName === normalizedValue || String(level.id) === normalizedValue
      })
    : null

  return match ? Number(match.id) : ''
}

function resolveStreamId(value, classLevelId) {
  if (!value) return ''

  const normalizedValue = String(value).trim().toLowerCase()
  const selectedClass = Array.isArray(classLevels.value)
    ? classLevels.value.find((level) => Number(level.id) === Number(classLevelId))
    : null

  const match = Array.isArray(selectedClass?.streams)
    ? selectedClass.streams.find((stream) => {
        const streamName = String(stream.name || stream.stream_name || '').trim().toLowerCase()
        return streamName === normalizedValue || String(stream.id) === normalizedValue
      })
    : null

  return match ? Number(match.id) : ''
}

watch(
  () => form.value.class_level,
  (newValue) => {
    const selected = Array.isArray(classLevels.value)
      ? classLevels.value.find(cls => cls.id === Number(newValue))
      : null

    streams.value = Array.isArray(selected?.streams) ? selected.streams : []

    if (!streams.value.some(s => s.id === form.value.stream)) {
      form.value.stream = ""
    }
  }
)


onMounted(async () => {
  try {
    const res = await fetchClassLevels()
    const classLevelData = Array.isArray(res.data)
      ? res.data
      : res.data?.results || []

    classLevels.value = classLevelData

    const id = route.params.id
    student.value = await studentsApi.get(id)

    const s = student.value

    const classLevelId = resolveClassLevelId(s.current_class_level || s.class_level || s.class_level_name)
    const streamId = resolveStreamId(s.current_stream || s.stream || s.stream_name, classLevelId)

    form.value = {
      admission_number: s.admission_number,
      first_name: s.first_name,
      middle_name: s.middle_name,
      last_name: s.last_name,

      class_level: classLevelId,
      stream: streamId,

      gender: s.gender,
      date_of_birth: s.date_of_birth,
      email: s.email,
      phone: s.phone,
      address: s.address,

      parent1: s.parents?.[0] || {},
      parent2: s.parents?.[1] || {},
    }

    if (s.parents?.length > 1) {
      showParent2.value = true
    }

    const selectedClass = Array.isArray(classLevels.value)
      ? classLevels.value.find(c => Number(c.id) === Number(classLevelId))
      : null

    streams.value = Array.isArray(selectedClass?.streams) ? selectedClass.streams : []

  } catch (error) {
    console.error(error)
    toast.error('Failed to load student data')
  }
})
async function updateStudent() {
  try {
    const payload = {
      ...form.value,

      parent1: form.value.parent1.first_name
        ? form.value.parent1
        : undefined,

      parent2: showParent2.value && form.value.parent2.first_name
        ? form.value.parent2
        : undefined,
    }

    await studentsApi.update(student.value.id, payload)

    toast.success('Student updated successfully!')
    editMode.value = false

    student.value = await studentsApi.get(student.value.id)

  } catch (error) {
    console.error(error)
    toast.error('Failed to update student.')
  }
}

/**
 * Delete student
 */
async function deleteStudent() {
  try {
    await studentsApi.remove(student.value.id)
    router.push({ name: 'PrincipalStudents' })
  } catch (error) {
    console.error('Failed to delete student:', error)
    toast.error('Failed to delete student.')
  }
}
</script>
<style scoped>
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
</style>