<!--<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Student Details</h2>

      <div v-if="student" class="space-y-3">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="font-medium text-gray-700">Full Name:</p>
            <p class="text-gray-800">{{ student.full_name }}</p>
          </div>
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
            <p class="text-gray-800">{{ student.middle_name || '-' }}</p>
          </div>

          <div>
            <p class="font-medium text-gray-700">Last Name:</p>
            <p class="text-gray-800">{{ student.last_name }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Grade:</p>
            <p class="text-gray-800">{{ student.current_class_level }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Stream</p>
            <p class="text-gray-800">{{ student.current_stream }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Gender:</p>
            <p class="text-gray-800">{{ student.gender }}</p>
          </div>

          <div>
            <p class="font-medium text-gray-700">Date of Birth:</p>
            <p class="text-gray-800">{{ student.date_of_birth || 'N/A' }}</p>
          </div>
          <div>
            <p class="font-medium text-gray-700">Guardian Name:</p>
            <p class="text-gray-800">
              {{ student.parents?.[0]?.full_name || 'N/A' }}
            </p>
          </div>

            <div>
              <p class="font-medium text-gray-700">Relationship:</p>
              <p class="text-gray-800">
                {{ student.parents?.[0]?.relationship || 'N/A' }}
              </p>
            </div>

            <div>
              <p class="font-medium text-gray-700">Guardian Email:</p>
              <p class="text-gray-800">
                {{ student.parents?.[0]?.email || 'N/A' }}
              </p>
            </div>

            <div>
              <p class="font-medium text-gray-700">Guardian Phone:</p>
              <p class="text-gray-800">
                {{ student.parents?.[0]?.phone || 'N/A' }}
              </p>
            </div>

            <div>
              <p class="font-medium text-gray-700">Guardian Address:</p>
              <p class="text-gray-800">
                {{ student.parents?.[0]?.address || 'N/A' }}
              </p>
            </div>
          
          <div>
            <p class="font-medium text-gray-700">Date Joined:</p>
            <p class="text-gray-800">{{ student.date_joined }}</p>
          </div>
           <div>
    <button
      v-if="!hasAccount"
      @click="openModal('create')"
      class="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
    >
      Create Student Account
    </button>

    <button
      v-else
      @click="openModal('reset')"
      class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full sm:w-auto transition"
    >
      Reset Student Password
    </button>
  </div>

 
  <StudentAccountModal
    v-if="modalVisible"
    :mode="modalMode"
    :student="student"
    :onSubmit="handleModalSubmit"
    @close="modalVisible = false"
  />
        </div>
      </div>

      <div v-else class="text-gray-500 italic">Loading student...</div>

      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import studentsApi from '../api/Students.js'
import StudentAccountModal from './StudentAccountModal.vue'

const route = useRoute()
const router = useRouter()

const hasAccount = ref(false)

const student = ref(null)
const editMode = ref(false)

const modalVisible = ref(false)
const modalMode = ref('create') 

const openModal = (mode) => {
  modalMode.value = mode
  modalVisible.value = true
}

const handleModalSubmit = async (password) => {
  if (modalMode.value === 'create') {
    await studentsApi.createAccount({ student_id: student.value.id, password })
    hasAccount.value = true
    alert('Student account created!')
  } else if (modalMode.value === 'reset') {
    await studentsApi.resetPassword({ student_id: student.value.id, new_password: password })
    alert('Student password reset!')
  }
}

onMounted(async () => {
  const id = route.params.id
  try {
    student.value = await studentsApi.get(id)
    console.log("STUDENT DETAILS:", student.value)
    console.log(JSON.stringify(student.value.parents[0], null, 2))
    hasAccount.value = student.value.has_account
  } catch (error) {
    console.error('Failed to fetch student:', error)
  }
})



</script>
-->

<template>
  <div class="min-h-screen bg-gray-100 p-6">

    <div
      v-if="student"
      class="mx-auto max-w-5xl space-y-6"
    >

      <!-- Header -->
      <div class="rounded-2xl bg-white p-6 shadow">

        <div class="flex items-center justify-between">

          <div class="flex items-center gap-4">

            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
            >
              {{ student.first_name?.charAt(0) }}
            </div>

            <div>
              <h2 class="text-2xl font-bold text-gray-800">
                {{ student.full_name }}
              </h2>

              <p class="text-gray-500">
                Admission No:
                <span class="font-medium text-gray-700">
                  {{ student.admission_number }}
                </span>
              </p>
            </div>

          </div>


          <div>
            <span
              class="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
            >
              Active Student
            </span>
          </div>

        </div>

      </div>


      <!-- Student Information -->
      <section class="rounded-2xl bg-white p-6 shadow">

        <h3 class="mb-5 text-lg font-semibold text-gray-800">
          Student Information
        </h3>


        <div class="grid gap-5 md:grid-cols-2">

          <InfoItem label="First Name" :value="student.first_name"/>

          <InfoItem 
            label="Middle Name"
            :value="student.middle_name || '-'"
          />

          <InfoItem 
            label="Last Name"
            :value="student.last_name"
          />

          <InfoItem 
            label="Gender"
            :value="student.gender"
          />

          <InfoItem
            label="Date of Birth"
            :value="student.date_of_birth || 'N/A'"
          />

          <InfoItem
            label="Date Joined"
            :value="student.date_joined"
          />

        </div>

      </section>


      <!-- Academic Information -->
      <section class="rounded-2xl bg-white p-6 shadow">

        <h3 class="mb-5 text-lg font-semibold text-gray-800">
          Academic Information
        </h3>


        <div class="grid gap-5 md:grid-cols-3">

          <InfoItem
            label="Grade"
            :value="student.current_class_level"
          />

          <InfoItem
            label="Stream"
            :value="student.current_stream"
          />

          <InfoItem
            label="Academic Year"
            :value="student.academic_year"
          />

        </div>

      </section>



      <!-- Guardian Information -->
      <section class="rounded-2xl bg-white p-6 shadow">

        <h3 class="mb-5 text-lg font-semibold text-gray-800">
          Guardian Information
        </h3>


        <div class="grid gap-5 md:grid-cols-2">

          <InfoItem
            label="Name"
            :value="student.parents?.[0]?.full_name || 'N/A'"
          />

          <InfoItem
            label="Relationship"
            :value="student.parents?.[0]?.relationship || 'N/A'"
          />

          <InfoItem
            label="Phone"
            :value="student.parents?.[0]?.phone || 'N/A'"
          />

          <InfoItem
            label="Email"
            :value="student.parents?.[0]?.email || 'N/A'"
          />

          <InfoItem
            label="Address"
            :value="student.parents?.[0]?.address || 'N/A'"
          />

        </div>

      </section>



      <!-- Account Actions -->
      <section class="rounded-2xl bg-white p-6 shadow">

        <h3 class="mb-5 text-lg font-semibold text-gray-800">
          Student Account
        </h3>


        <button
          v-if="!hasAccount"
          @click="openModal('create')"
          class="rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
        >
          Create Student Account
        </button>


        <button
          v-else
          @click="openModal('reset')"
          class="rounded-lg bg-green-600 px-5 py-3 text-white transition hover:bg-green-700"
        >
          Reset Student Password
        </button>


      </section>



      <StudentAccountModal
        v-if="modalVisible"
        :mode="modalMode"
        :student="student"
        :onSubmit="handleModalSubmit"
        @close="modalVisible = false"
      />

    </div>


    <div
      v-else
      class="text-center text-gray-500"
    >
      Loading student...
    </div>


  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import studentsApi from '../api/Students.js'
import StudentAccountModal from './StudentAccountModal.vue'
import InfoItem from './InfoItem.vue'

const route = useRoute()
const router = useRouter()

const hasAccount = ref(false)

const student = ref(null)
const editMode = ref(false)

const modalVisible = ref(false)
const modalMode = ref('create') 

const openModal = (mode) => {
  modalMode.value = mode
  modalVisible.value = true
}

const handleModalSubmit = async (password) => {
  if (modalMode.value === 'create') {
    await studentsApi.createAccount({ student_id: student.value.id, password })
    hasAccount.value = true
    alert('Student account created!')
  } else if (modalMode.value === 'reset') {
    await studentsApi.resetPassword({ student_id: student.value.id, new_password: password })
    alert('Student password reset!')
  }
}

onMounted(async () => {
  const id = route.params.id
  try {
    student.value = await studentsApi.get(id)
    
    hasAccount.value = student.value.has_account
  } catch (error) {
    console.error('Failed to fetch student:', error)
  }
})


</script>