<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">

    <!-- HEADER -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">Add New Student</h2>

      <router-link
        :to="{ name: 'PrincipalStudents' }"
        class="text-blue-600 hover:underline text-sm"
      >
        ← Back to Students
      </router-link>
    </div>

    <!-- FORM CARD -->
    <div class="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">

      <form @submit.prevent="createStudent" class="space-y-10">

        <!-- STUDENT DETAILS -->
        <div class="border rounded-xl p-6 bg-gray-50">
          <h4 class="text-md font-semibold mb-5 text-gray-700">
            Student Details
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <!-- INPUT TEMPLATE -->
            <!-- Use same pattern everywhere -->

            <div>
              <label class="label">Admission Number</label>
              <input v-model="form.admission_number" required type="text"
                class="field" />
            </div>

            <div>
              <label class="label">First Name</label>
              <input v-model="form.first_name" required type="text"
                class="field" />
            </div>

            <div>
              <label class="label">Middle Name</label>
              <input v-model="form.middle_name" type="text"
                class="field" />
            </div>

            <div>
              <label class="label">Last Name</label>
              <input v-model="form.last_name" required type="text"
                class="field" />
            </div>

            <div>
              <label class="label">Class Level</label>
              <select v-model="form.class_level" required class="field">
                <option value="">Select Class Level</option>
                <option v-for="grade in GRADES" :key="grade.value" :value="grade.value">
                  {{ grade.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="label">Stream</label>
              <select v-model="form.stream" required class="field">
                <option value="">Select Stream</option>
                <option v-for="stream in STREAMS" :key="stream.value" :value="stream.value">
                  {{ stream.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="label">Gender</label>
              <select v-model="form.gender" required class="field">
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>

            <div>
              <label class="label">Date of Birth</label>
              <input type="date" v-model="form.date_of_birth"
                class="field" />
            </div>

            <div class="md:col-span-2">
              <label class="label">Email</label>
              <input type="email" v-model="form.email"
                class="field" />
            </div>

            <div class="md:col-span-2">
              <label class="label">Phone</label>
              <input type="tel" v-model="form.phone"
                class="field" />
            </div>

            <div class="md:col-span-2">
              <label class="label">Address</label>
              <textarea v-model="form.address" rows="3"
                class="field"></textarea>
            </div>

          </div>
        </div>

        <!-- PARENT 1 -->
        <div class="border rounded-xl p-6 bg-gray-50">
          <h4 class="text-md font-semibold mb-5 text-gray-700">
            Parent 1 Details
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <input v-model="form.parent1.first_name" placeholder="First Name" class="field" />
            <input v-model="form.parent1.last_name" placeholder="Last Name" class="field" />
            <input v-model="form.parent1.email" placeholder="Email" type="email" class="field" />
            <input v-model="form.parent1.phone" placeholder="Phone" type="tel" class="field" />

            <select v-model="form.parent1.relationship" class="field">
              <option value="">Relationship</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
            </select>

            <input v-model="form.parent1.password" placeholder="Password" type="password" class="field" />

            <textarea v-model="form.parent1.address" rows="2" placeholder="Address"
              class="field md:col-span-2"></textarea>

          </div>
        </div>

        <!-- PARENT 2 -->
        <div v-if="showParent2" class="border rounded-xl p-6 bg-gray-50">
          <h4 class="text-md font-semibold mb-5 text-gray-700">
            Parent 2 Details
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <input v-model="form.parent2.first_name" placeholder="First Name" class="field" />
            <input v-model="form.parent2.last_name" placeholder="Last Name" class="field" />
            <input v-model="form.parent2.email" placeholder="Email" type="email" class="field" />
            <input v-model="form.parent2.phone" placeholder="Phone" type="tel" class="field" />

            <select v-model="form.parent2.relationship" class="field">
              <option value="">Relationship</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
            </select>

            <textarea v-model="form.parent2.address" rows="2" placeholder="Address"
              class="field md:col-span-2"></textarea>

          </div>
        </div>

        <!-- ADD PARENT -->
        <div v-if="!showParent2">
          <button
            type="button"
            @click="showParent2 = true"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            + Add Another Parent
          </button>
        </div>

        <!-- ACTIONS -->
        <div class="flex justify-end space-x-4 pt-4 border-t">
          <router-link
            :to="{ name: 'PrincipalStudents' }"
            class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </router-link>

          <button
            type="submit"
            class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition"
          >
            Create Student
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { GRADES } from '../../../constants/grades.js'
import { STREAMS } from '../../../constants/streams.js'
import studentsApi from '../api/Students.js'

const router = useRouter()
const toast = useToast()
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
  parent1: { first_name:'', last_name:'', email:'', phone:'', relationship:'', password:'', address:'' },
  parent2: { first_name:'', last_name:'', email:'', phone:'', relationship:'', password:'None', address:'' },
})

async function createStudent() {
  try {
    const payload = {
      ...form.value,
      parent1: form.value.parent1.first_name ? form.value.parent1 : undefined,
      parent2: showParent2.value && form.value.parent2.first_name ? form.value.parent2 : undefined,
    }

    await studentsApi.create(payload)

    toast.success('Student created successfully!')
    router.push({ name: 'PrincipalStudents' })

  } catch (error) {
    console.error(error)
    toast.error('Failed to create student.')
  }
}
</script>

<style>
.field {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.65rem 0.9rem;
  border-radius: 0.6rem;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  font-size: 0.875rem;
  color: #1f2937;
  transition: all 0.15s ease-in-out;
}

.field:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.field:hover {
  border-color: #9ca3af;
}

.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}
</style>
