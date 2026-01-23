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

      <div v-if="student && !editMode" class="space-y-3">
        <div class="grid grid-cols-2 gap-4">
          <div>
          <p class="font-medium text-gray-700">Admission Number:</p>
            <p class="text-gray-800">{{ student.admission_number }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">First Name:</p>
            <p class="text-gray-800">{{ student.first_name }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Middle Name:</p>
            <p class="text-gray-800">{{ student.middle_name }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Last Name:</p>
            <p class="text-gray-800">{{ student.last_name }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Full Name:</p>
            <p class="text-gray-800">{{ student.full_name }}</p>
          </div>
            
          <div>
            <p class="font-medium text-gray-700">Grade:</p>
            <p class="text-gray-800">{{ student.class_level }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Stream:</p>
            <p class="text-gray-800">{{ student.stream }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Gender:</p>
            <p class="text-gray-800">{{ student.gender }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Date of Birth:</p>
            <p class="text-gray-800">{{ student.date_of_birth || ' Hidden ' }}</p>
          </div>
          <div>
          <p class="font-medium text-gray-700">Phone Number:</p>
            <p class="text-gray-800">{{ student.phone }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Email:</p>
            <p class="text-gray-800">{{ student.email }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Date Joined:</p>
            <p class="text-red-800">{{ student.date_joined }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Address:</p>
            <p class="text-gray-800">{{ student.address }}</p>
          </div>
          
        </div>
      

        <div class="mt-6 flex items-center gap-3">
          <button @click="editMode = true" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Edit
          </button>
          <button @click="deleteStudent" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Delete
          </button>
          <router-link :to="{ name: 'StudentsPage'}" class="text-blue-600 hover:underline text-sm ml-auto">
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
            <input v-model="form.admission_number" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Class Level</label>
            <select v-model="form.class_level" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Select Class Level</option>
              <option v-for="n in 12" :key="n" :value="'Grade ' + n">Grade {{ n }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Stream</label>
            <select v-model="form.stream" class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Select Stream</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import studentsApi from '../api/Students.js'

const route = useRoute()
const router = useRouter()
const student = ref(null)
const editMode = ref(false)
const showParent2 = ref(false)

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
  parent1: { first_name:'', last_name:'', email:'', phone:'', relationship:'', address:'', id:null },
  parent2: { first_name:'', last_name:'', email:'', phone:'', relationship:'', address:'', id:null },
})

onMounted(async () => {
  const id = route.params.id
  try {
    student.value = await studentsApi.get(id)

    form.value = {
      admission_number: student.value.admission_number,
      first_name: student.value.first_name,
      middle_name: student.value.middle_name,
      last_name: student.value.last_name,
      class_level: student.value.class_level,
      stream: student.value.stream,
      gender: student.value.gender,
      date_of_birth: student.value.date_of_birth,
      email: student.value.email,
      phone: student.value.phone,
      address: student.value.address,
      parent1: student.value.parents?.[0] || { first_name:'', last_name:'', email:'', phone:'', relationship:'', address:'', id:null },
      parent2: student.value.parents?.[1] || { first_name:'', last_name:'', email:'', phone:'', relationship:'', address:'', id:null },
    }

    if (student.value.parents?.length > 1) showParent2.value = true
  } catch (error) {
    console.error('Failed to fetch student:', error)
  }
})

async function updateStudent() {
  try {
    const payload = {
      ...form.value,
      parent1: form.value.parent1.first_name ? form.value.parent1 : undefined,
      parent2: showParent2.value && form.value.parent2.first_name ? form.value.parent2 : undefined,
    }
    await studentsApi.update(student.value.id, payload)
    alert('Student updated successfully!')
    editMode.value = false
    student.value = await studentsApi.get(student.value.id)
  } catch (error) {
    console.error(error)
    alert('Failed to update student.')
  }
}

async function deleteStudent() {
  try {
    await studentsApi.remove(student.value.id)
    router.push({ name: 'StudentsPage' })
  } catch (error) {
    console.error('Failed to delete student:', error)
  }
}
</script>
