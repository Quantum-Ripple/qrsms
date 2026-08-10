<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8 border border-gray-100">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-semibold text-gray-800">Add Non-Teaching Staff</h2>
          <p class="text-sm text-gray-500">Create a new non-teaching staff profile.</p>
        </div>
        <router-link
          :to="{ name: 'PrincipalOtherStaff' }"
          class="text-blue-600 hover:underline text-sm"
        > ← Back to Staff</router-link>
      </div>

      <form @submit.prevent="createOtherStaff" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- First Name -->
          <div>
            <label class="label">First Name</label>
            <input
              v-model="form.first_name"
              type="text"
              required
              class="field"
            />
          </div>

          <!-- Last Name -->
          <div>
            <label class="label">Last Name</label>
            <input
              v-model="form.last_name"
              type="text"
              required
              class="field"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="label">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="field"
            />
          </div>

          <!-- Phone Number -->
          <div>
            <label class="label">Phone Number</label>
            <input
              v-model="form.phone_number"
              type="tel"
              required
              class="field"
            />
          </div>

          <!-- Position -->
          <div>
            <label class="label">Position</label>

            <select
              v-model="form.position"
              required
              class="field"
            >
              <option value="">Select Position</option>
              <option value="Bursar">Bursar</option>
              <option value="Driver">Driver</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Cook">Cook</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <!-- Other Position -->
          <div v-if="form.position === 'Other'">
            <label class="label">Specify Position</label>

            <input
              v-model="form.other_position"
              type="text"
              required
              class="field"
              placeholder="e.g. Gardener"
            />
          </div>

          <!-- National ID -->
          <div>
            <label class="label">National ID</label>
            <input
              v-model="form.national_id"
              type="text"
              class="field"
            />
          </div>

          <!-- Gender -->
          <div>
            <label class="label">Gender</label>

            <select
              v-model="form.gender"
              class="field"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <!-- Hire Date -->
          <div>
            <label class="label">Hire Date</label>

            <input
              v-model="form.hire_date"
              type="date"
              required
              class="field"
            />
          </div>

          <!-- Address -->
          <div class="md:col-span-2">
            <label class="label">Address</label>

            <textarea
              v-model="form.address"
              rows="3"
              class="field"
            ></textarea>
          </div>

        </div>


        <!-- ===================================================== -->
        <!-- BURSAR ACCOUNT SECTION                                -->
        <!-- ===================================================== -->

        <div
          v-if="form.position === 'Bursar'"
          class="border border-blue-200 bg-blue-50 rounded-lg p-5"
        >

          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-800">
              Login Account
            </h3>

            <p class="text-sm text-gray-600 mt-1">
              This bursar will be able to log in to the finance portal.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <!-- Username -->
            <div>
              <label class="label">Username</label>

              <input
                v-model="form.username"
                type="text"
                required
                autocomplete="username"
                class="field"
                placeholder="e.g. mary.bursar"
              />
            </div>

            <!-- Password -->
            <div>
              <label class="label">Password</label>

              <input
                v-model="form.password"
                type="password"
                required
                autocomplete="new-password"
                class="field"
                placeholder="Enter temporary password"
              />
            </div>

          </div>

          <div class="mt-4 text-sm text-blue-700">
            The account will automatically be assigned the
            <strong>Finance</strong> role.
          </div>

        </div>


        <!-- ===================================================== -->
        <!-- ACTIONS                                               -->
        <!-- ===================================================== -->

        <div class="flex justify-end gap-3 pt-4 border-t">

          <router-link
            :to="{ name: 'PrincipalOtherStaff' }"
            class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </router-link>

          <button
            type="submit"
            class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Staff
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
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  position: '',
  national_id: '',
  gender: '',
  hire_date: '',
  address: '',

  username: '',
  password: '',
})


async function createOtherStaff() {
  try {
    const payload = {
      ...form.value,
      position:
        form.value.position === 'Other'
          ? form.value.other_position
          : form.value.position,
    }

    await teachersApi.createOtherStaff(payload)

    toast.success('Non-teaching staff created successfully')
    router.push({ name: 'PrincipalOtherStaff' })

  } catch (error) {
    console.error('Create other staff failed:', error)
    toast.error('Failed to create staff')
  }

}

</script>

<style scoped>
.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #334155;
}
.field {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
}
</style>
