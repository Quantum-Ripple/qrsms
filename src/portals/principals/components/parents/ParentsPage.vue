<template>
  <div class="min-h-screen bg-gray-100 p-6">

    <div
      v-if="parent"
      class="mx-auto max-w-5xl space-y-6"
    >

      <!-- Header -->
      <div class="rounded-2xl bg-white p-6 shadow">

        <div class="flex items-center justify-between">

          <div class="flex items-center gap-4">

            <!-- Avatar -->
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
            >
              {{ parent.first_name?.charAt(0) }}
            </div>

            <div>
              <h2 class="text-2xl font-bold text-gray-800">
                {{ parent.full_name }}
              </h2>

              <p class="text-gray-500">
                {{ parent.relationship }}
              </p>
            </div>

          </div>


          <!-- Status -->
          <div>
            <span
              v-if="parent.is_active"
              class="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
            >
              Active Parent
            </span>

            <span
              v-else
              class="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700"
            >
              Inactive Parent
            </span>
          </div>

        </div>

      </div>


      <!-- Parent Information -->
      <section class="rounded-2xl bg-white p-6 shadow">

        <div class="mb-5 flex items-center justify-between">

          <h3 class="text-lg font-semibold text-gray-800">
            Parent Information
          </h3>

          <button
            @click="editParent"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Edit Parent
          </button>

        </div>


        <div class="grid gap-5 md:grid-cols-2">

          <InfoItem
            label="First Name"
            :value="parent.first_name"
          />

          <InfoItem
            label="Middle Name"
            :value="parent.middle_name || '-'"
          />

          <InfoItem
            label="Last Name"
            :value="parent.last_name"
          />

          <InfoItem
            label="Relationship"
            :value="parent.relationship"
          />

          <InfoItem
            label="Email"
            :value="parent.email || 'N/A'"
          />

          <InfoItem
            label="Phone"
            :value="parent.phone || 'N/A'"
          />

          <InfoItem
            label="Address"
            :value="parent.address || 'N/A'"
          />

          <InfoItem
            label="Date Joined"
            :value="parent.date_joined || 'N/A'"
          />

        </div>

      </section>


      <!-- Parent Account -->
      <section class="rounded-2xl bg-white p-6 shadow">

        <h3 class="mb-5 text-lg font-semibold text-gray-800">
          Parent Account
        </h3>


        <div class="mb-5">

          <div
            v-if="hasAccount"
            class="rounded-lg bg-green-50 p-4"
          >
            <p class="font-medium text-green-800">
              Parent account exists
            </p>

            <p class="mt-1 text-sm text-green-700">
              {{ parent.user_details }}
            </p>
          </div>


          <div
            v-else
            class="rounded-lg bg-yellow-50 p-4"
          >
            <p class="font-medium text-yellow-800">
              No parent account
            </p>

            <p class="mt-1 text-sm text-yellow-700">
              This parent does not currently have a user account.
            </p>
          </div>

        </div>


        <button
          v-if="hasAccount"
          @click="openResetPassword"
          class="rounded-lg bg-green-600 px-5 py-3 text-white transition hover:bg-green-700"
        >
          Reset Parent Password
        </button>


        <button
          v-else
          @click="createAccount"
          class="rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
        >
          Create Parent Account
        </button>

      </section>


      <!-- Students -->
      <section class="rounded-2xl bg-white p-6 shadow">

        <div class="mb-5 flex items-center justify-between">

          <h3 class="text-lg font-semibold text-gray-800">
            Students
          </h3>

          <span
            class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
          >
            {{ parent.students?.length || 0 }}
            {{ parent.students?.length === 1 ? 'Student' : 'Students' }}
          </span>

        </div>


        <!-- Students exist -->
        <div
          v-if="parent.students?.length"
          class="overflow-x-auto"
        >

          <table class="w-full text-left border-collapse">

            <thead class="bg-gray-100">

              <tr>

                <th class="py-3 px-4 text-gray-700 font-medium border-b">
                  Student
                </th>

                <th class="py-3 px-4 text-gray-700 font-medium border-b">
                  Admission No.
                </th>

                <th class="py-3 px-4 text-gray-700 font-medium border-b">
                  Class
                </th>

                <th class="py-3 px-4 text-gray-700 font-medium border-b">
                  Stream
                </th>

                <th class="py-3 px-4 text-gray-700 font-medium border-b">
                  Status
                </th>

                

              </tr>

            </thead>


            <tbody>

              <tr
                v-for="student in parent.students"
                :key="student.id"
                class="hover:bg-gray-50 transition"
              >

                <td class="py-3 px-4 border-b">
                  {{ student.full_name }}
                </td>

                <td class="py-3 px-4 border-b">
                  {{ student.admission_number }}
                </td>

                <td class="py-3 px-4 border-b">
                  {{ student.class_level || 'N/A' }}
                </td>

                <td class="py-3 px-4 border-b">
                  {{ student.stream || 'N/A' }}
                </td>

                <td class="py-3 px-4 border-b">

                  <span
                    v-if="student.is_active"
                    class="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                  >
                    Active
                  </span>

                  <span
                    v-else
                    class="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                  >
                    Inactive
                  </span>

                </td>

               

              </tr>

            </tbody>

          </table>

        </div>


        <!-- No students -->
        <div
          v-else
          class="rounded-lg bg-gray-50 py-8 text-center text-gray-500"
        >
          This parent is not currently associated with any students.
        </div>

      </section>


      <!-- Password Reset Modal -->
      <div
        v-if="resetModalVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >

        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

          <h3 class="text-xl font-semibold text-gray-800">
            Reset Parent Password
          </h3>

          <p class="mt-2 text-sm text-gray-500">
            Enter a new password for {{ parent.full_name }}.
          </p>


          <div class="mt-5">
            <label class="mb-2 block text-sm font-medium text-gray-700">
                New Password
            </label>

            <input
                v-model="newPassword"
                type="password"
                placeholder="Enter new password"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>

            <div class="mt-4">
            <label class="mb-2 block text-sm font-medium text-gray-700">
                Confirm Password
            </label>

            <input
                v-model="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>

          <div class="mt-6 flex justify-end gap-3">

            <button
              @click="closeResetPassword"
              class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              @click="resetPassword"
              :disabled="!newPassword || resetting"
              class="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ resetting ? 'Resetting...' : 'Reset Password' }}
            </button>

          </div>

        </div>

      </div>

    </div>


    <!-- Loading -->
    <div
      v-else
      class="text-center text-gray-500"
    >
      Loading parent...
    </div>

  </div>
</template>


<script setup>

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import parentsApi from '../../api/parents.js'
import InfoItem from '../../../teachers/components/InfoItem.vue'


const route = useRoute()
const router = useRouter()
const toast = useToast()


const parent = ref(null)

const resetModalVisible = ref(false)

const resetting = ref(false)

const newPassword = ref('')
const confirmPassword = ref('')


const hasAccount = computed(() => {
  return !!parent.value?.user
})


function editParent() {
  router.push({
    name: 'ParentEdit',
    params: {
      id: parent.value.id
    }
  })
}


function viewStudent(student) {
  router.push({
    name: 'StudentDetail',
    params: {
      id: student.id
    }
  })
}


function openResetPassword() {
  newPassword.value = ''
  resetModalVisible.value = true
}

function closeResetPassword() {
  resetModalVisible.value = false
  newPassword.value = ''
  confirmPassword.value = ''
}

async function resetPassword() {
  if (newPassword.value.length < 8) {
    toast.error('Password must be at least 8 characters.')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    toast.error('Passwords do not match.')
    return
  }

  try {
    resetting.value = true

    await parentsApi.resetPassword(parent.value.id, {
      password: newPassword.value,
      confirm_password: confirmPassword.value
    })

    toast.success('Parent password reset successfully.')

    newPassword.value = ''
    confirmPassword.value = ''
    resetModalVisible.value = false

  } catch (error) {
    const data = error.response?.data

    if (data?.password?.length) {
      toast.error(data.password[0])
    } else if (data?.confirm_password?.length) {
      toast.error(data.confirm_password[0])
    } else if (data?.detail) {
      toast.error(data.detail)
    } else {
      toast.error('Failed to reset parent password.')
    }
  } finally {
    resetting.value = false
  }
}



function createAccount() {
  /*
   * We will connect this once the backend
   * has a dedicated parent-account creation endpoint.
   */
  toast.info('Parent account creation will be added here.')
}


onMounted(async () => {

  const id = route.params.id

  try {

    parent.value = await parentsApi.get(id)

  } catch (error) {

    console.error('Failed to fetch parent:', error)

    toast.error(
      error?.response?.data?.detail ||
      'Failed to load parent.'
    )

  }

})

</script>