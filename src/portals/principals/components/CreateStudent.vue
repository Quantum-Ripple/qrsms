 <template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @mousedown.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" >

      <!-- Header -->
      <div class="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <h3 class="text-xl font-semibold text-gray-800">Add New Student</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="createStudent" class="px-6 py-8">

        <!-- Student Details -->
        <h4 class="text-lg font-medium mb-4">Register Student Details</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Admission Number</label>
            <input type="text" v-model="form.admission_number" required class="mt-1 block w-full px-3 py-2 border rounded-md"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">First Name</label>
            <input type="text" v-model="form.first_name" required class="mt-1 block w-full px-3 py-2 border rounded-md"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Middle Name</label>
            <input type="text" v-model="form.middle_name" class="mt-1 block w-full px-3 py-2 border rounded-md"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Last Name</label>
            <input type="text" v-model="form.last_name" required class="mt-1 block w-full px-3 py-2 border rounded-md"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Class Level</label>
            <select v-model="form.class_level" required class="mt-1 block w-full px-3 py-2 border rounded-md">
              <option value="">Select Class Level</option>
              <option v-for="n in 12" :key="n" :value="'Grade ' + n">Grade {{ n }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Stream</label>
            <select v-model="form.stream" required class="mt-1 block w-full px-3 py-2 border rounded-md">
              <option value="">Select Stream</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="West">West</option>
              <option value="East">East</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Gender</label>
            <select v-model="form.gender" required class="mt-1 block w-full px-3 py-2 border rounded-md">
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" v-model="form.date_of_birth" class="mt-1 block w-full px-3 py-2 border rounded-md"/>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" v-model="form.email" class="mt-1 block w-full px-3 py-2 border rounded-md"/>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Phone</label>
            <input type="tel" v-model="form.phone" class="mt-1 block w-full px-3 py-2 border rounded-md"/>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Address</label>
            <textarea v-model="form.address" rows="3" class="mt-1 block w-full px-3 py-2 border rounded-md"></textarea>
          </div>
        </div>

        <!-- Parent 1 -->
        <h4 class="text-lg font-medium mt-6 mb-4">Parent 1 Details</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">First Name</label>
            <input type="text" v-model="form.parent1.first_name" class="mt-1 block w-full px-3 py-2 border rounded-md"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Last Name</label>
            <input type="text" v-model="form.parent1.last_name" class="mt-1 block w-full px-3 py-2 border rounded-md"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" v-model="form.parent1.email" class="mt-1 block w-full px-3 py-2 border rounded-md"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Phone</label>
            <input type="tel" v-model="form.parent1.phone" class="mt-1 block w-full px-3 py-2 border rounded-md"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Relationship</label>
            <select v-model="form.parent1.relationship" class="mt-1 block w-full px-3 py-2 border rounded-md">
              <option value="">Select Relationship</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" v-model="form.parent1.password" class="mt-1 block w-full px-3 py-2 border rounded-md"/>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Address</label>
            <textarea v-model="form.parent1.address" rows="3" class="mt-1 block w-full px-3 py-2 border rounded-md"></textarea>
          </div>
        </div>

        <div v-if="showParent2">
          <h4 class="text-lg font-medium mt-6 mb-4">Parent 2 Details</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" v-model="form.parent2.first_name" class="mt-1 block w-full px-3 py-2 border rounded-md"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" v-model="form.parent2.last_name" class="mt-1 block w-full px-3 py-2 border rounded-md"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" v-model="form.parent2.email" class="mt-1 block w-full px-3 py-2 border rounded-md"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" v-model="form.parent2.phone" class="mt-1 block w-full px-3 py-2 border rounded-md"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Relationship</label>
              <select v-model="form.parent2.relationship" class="mt-1 block w-full px-3 py-2 border rounded-md">
                <option value="">Select Relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Address</label>
              <textarea v-model="form.parent2.address" rows="3" class="mt-1 block w-full px-3 py-2 border rounded-md"></textarea>
            </div>
          </div>
        </div>

       
        <div v-if="!showParent2" class="mt-4">
          <button type="button" @click="showParent2 = true" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Add Another Parent
          </button>
        </div>

        <div class="mt-6 flex justify-end space-x-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Create Student
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import studentsApi from '../api/Students.js'

const emit = defineEmits(['close', 'studentCreated'])
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
  parent1: { first_name:'', last_name:'', email:'', phone:'', relationship:'',password:'', address:'' },
  parent2: { first_name:'', last_name:'', email:'', phone:'', relationship:'',password:'None', address:'' },
})


async function createStudent() {
  try {
    const payload = {
      ...form.value,
     
      parent1: form.value.parent1.first_name ? form.value.parent1 : undefined,
      parent2: showParent2.value && form.value.parent2.first_name ? form.value.parent2 : undefined,
    }
    

    await studentsApi.create(payload)
    alert('Student created successfully!')
    emit('studentCreated')
    emit('close')

   
    form.value = {
      admission_number: '', first_name:'', middle_name:'', last_name:'', class_level:'', stream:'', gender:'', date_of_birth:null, email:'', phone:'', address:'',
      parent1: { first_name:'', last_name:'', email:'', phone:'', relationship:'',password:'', address:'' },
      parent2: { first_name:'', last_name:'', email:'', phone:'', relationship:'',password:'None', address:'' },
    }
    showParent2.value = false
  } catch (error) {
    console.error(error)
    alert('Failed to create student.')
  }
}
</script>

