
<template>
  <div class="w-full max-w-full min-w-0 overflow-x-hidden bg-gray-100 min-h-screen p-3 sm:p-4 md:p-6">

    <div
      v-if="parent"
      class="w-full max-w-5xl mx-auto min-w-0 space-y-4 sm:space-y-6"
    >

      <!-- Header -->
      <div class="w-full min-w-0 rounded-2xl bg-white p-4 sm:p-6 shadow overflow-hidden">

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div class="flex items-center gap-3 sm:gap-4 min-w-0">

            <!-- Avatar -->
            <div
              class="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl sm:text-2xl font-bold text-white"
            >
              {{ parent.first_name?.charAt(0) }}
            </div>

            <div class="min-w-0">
              <h2
                class="text-xl sm:text-2xl font-bold text-gray-800 break-words"
              >
                {{ parent.full_name }}
              </h2>

              <p class="text-sm sm:text-base text-gray-500 break-words">
                {{ parent.relationship }}
              </p>
            </div>

          </div>


          <!-- Status -->
          <div class="shrink-0">

            <span
              v-if="parent.is_active"
              class="inline-flex rounded-full bg-green-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-green-700"
            >
              Active Parent
            </span>

            <span
              v-else
              class="inline-flex rounded-full bg-red-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-700"
            >
              Inactive Parent
            </span>

          </div>

        </div>

      </div>


      <!-- Parent Information -->
      <section
        class="w-full min-w-0 rounded-2xl bg-white p-4 sm:p-6 shadow overflow-hidden"
      >

        <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <h3 class="text-lg font-semibold text-gray-800">
            Parent Information
          </h3>

          <button
            @click="editParent"
            class="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Edit Parent
          </button>

        </div>


        <div class="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">

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
      <section
        class="w-full min-w-0 rounded-2xl bg-white p-4 sm:p-6 shadow overflow-hidden"
      >

        <h3 class="mb-5 text-lg font-semibold text-gray-800">
          Parent Account
        </h3>


        <div class="mb-5">

          <div
            v-if="hasAccount"
            class="w-full min-w-0 rounded-lg bg-green-50 p-4 overflow-hidden"
          >
            <p class="font-medium text-green-800">
              Parent account exists
            </p>

            <p class="mt-1 text-sm text-green-700 break-words overflow-wrap-anywhere">
              {{ parent.user_details }}
            </p>
          </div>


          <div
            v-else
            class="w-full min-w-0 rounded-lg bg-yellow-50 p-4 overflow-hidden"
          >
            <p class="font-medium text-yellow-800">
              No parent account
            </p>

            <p class="mt-1 text-sm text-yellow-700 break-words">
              This parent does not currently have a user account.
            </p>
          </div>

        </div>


        <button
          v-if="hasAccount"
          @click="openResetPassword"
          class="w-full sm:w-auto rounded-lg bg-green-600 px-5 py-3 text-white transition hover:bg-green-700"
        >
          Reset Parent Password
        </button>


        <button
        v-else
        @click="openCreateAccount"
        class="w-full sm:w-auto rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
      >
        Create Parent Account
      </button>
      </section>


      <!-- Students -->
      <section
        class="w-full min-w-0 rounded-2xl bg-white p-4 sm:p-6 shadow overflow-hidden"
      >

        <div class="mb-5 flex items-center justify-between gap-3">

          <h3 class="text-lg font-semibold text-gray-800">
            Students
          </h3>

          <span
            class="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs sm:text-sm text-gray-600"
          >
            {{ parent.students?.length || 0 }}
            {{ parent.students?.length === 1 ? 'Student' : 'Students' }}
          </span>

        </div>


        <!-- ========================= -->
        <!-- DESKTOP STUDENT TABLE -->
        <!-- ========================= -->
        <div
          v-if="parent.students?.length"
          class="hidden md:block w-full min-w-0 overflow-x-auto"
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

                <td class="py-3 px-4 border-b break-words">
                  {{ student.full_name }}
                </td>

                <td class="py-3 px-4 border-b break-words">
                  {{ student.admission_number }}
                </td>

                <td class="py-3 px-4 border-b break-words">
                  {{ student.class_level || 'N/A' }}
                </td>

                <td class="py-3 px-4 border-b break-words">
                  {{ student.stream || 'N/A' }}
                </td>

                <td class="py-3 px-4 border-b">

                  <span
                    v-if="student.is_active"
                    class="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                  >
                    Active
                  </span>

                  <span
                    v-else
                    class="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                  >
                    Inactive
                  </span>

                </td>

              </tr>

            </tbody>

          </table>

        </div>


        <!-- ========================= -->
        <!-- MOBILE STUDENT CARDS -->
        <!-- ========================= -->
        <div
          v-if="parent.students?.length"
          class="md:hidden w-full min-w-0 space-y-3"
        >

          <div
            v-for="student in parent.students"
            :key="student.id"
            class="w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-4 overflow-hidden"
          >

            <!-- Student name + status -->
            <div class="flex items-start justify-between gap-3 mb-4">

              <div class="min-w-0">
                <p class="font-semibold text-gray-800 break-words">
                  {{ student.full_name }}
                </p>

                <p class="mt-1 text-xs text-gray-500 break-words">
                  Admission No. {{ student.admission_number }}
                </p>
              </div>


              <span
                v-if="student.is_active"
                class="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
              >
                Active
              </span>

              <span
                v-else
                class="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
              >
                Inactive
              </span>

            </div>


            <!-- Student details -->
            <div class="grid grid-cols-2 gap-3">

              <div class="min-w-0">
                <p class="text-xs text-gray-500">
                  Class
                </p>

                <p class="mt-1 text-sm font-medium text-gray-800 break-words">
                  {{ student.class_level || 'N/A' }}
                </p>
              </div>


              <div class="min-w-0">
                <p class="text-xs text-gray-500">
                  Stream
                </p>

                <p class="mt-1 text-sm font-medium text-gray-800 break-words">
                  {{ student.stream || 'N/A' }}
                </p>
              </div>

            </div>

          </div>

        </div>


        <!-- No students -->
        <div
          v-else
          class="rounded-lg bg-gray-50 py-8 px-4 text-center text-sm text-gray-500"
        >
          This parent is not currently associated with any students.
        </div>

      </section>


      <!-- Password Reset Modal -->
      <div
        v-if="resetModalVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 overflow-y-auto"
      >

        <div
          class="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-xl"
        >

          <h3 class="text-lg sm:text-xl font-semibold text-gray-800">
            Reset Parent Password
          </h3>

          <p class="mt-2 text-sm text-gray-500 break-words">
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
              class="w-full min-w-0 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              class="w-full min-w-0 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>


          <div class="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

            <button
              @click="closeResetPassword"
              class="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              @click="resetPassword"
              :disabled="!newPassword || resetting"
              class="w-full sm:w-auto rounded-lg bg-green-600 px-4 py-2.5 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ resetting ? 'Resetting...' : 'Reset Password' }}
            </button>

          </div>

        </div>

      </div>

        <!-- Create Parent Account Modal -->
  <div
    v-if="createAccountModalVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 overflow-y-auto"
  >

    <div
      class="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-xl"
    >

      <h3 class="text-lg sm:text-xl font-semibold text-gray-800">
        Create Parent Account
      </h3>

      <p class="mt-2 text-sm text-gray-500 break-words">
        Set login credentials for {{ parent.full_name }}.
      </p>


      <div class="mt-5">

        <label class="mb-2 block text-sm font-medium text-gray-700">
          Username / Email
        </label>

        <input
          v-model="newUsername"
          type="text"
          placeholder="Enter username or email"
          class="w-full min-w-0 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>


      <div class="mt-4">

        <label class="mb-2 block text-sm font-medium text-gray-700">
          Password
        </label>

        <input
          v-model="accountPassword"
          type="password"
          placeholder="Enter password"
          class="w-full min-w-0 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>


      <div class="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

        <button
          @click="closeCreateAccount"
          class="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          @click="submitCreateAccount"
          :disabled="!newUsername || !accountPassword || creatingAccount"
          class="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ creatingAccount ? 'Creating...' : 'Create Account' }}
        </button>

      </div>

    </div>

  </div>

    </div>


    <!-- Loading -->
    <div
      v-else
      class="w-full min-w-0 text-center text-gray-500 py-10"
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


const createAccountModalVisible = ref(false)
const creatingAccount = ref(false)
const newUsername = ref('')
const accountPassword = ref('')


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


function openCreateAccount() {
  newUsername.value = parent.value.email || ''
  accountPassword.value = ''
  createAccountModalVisible.value = true
}

function closeCreateAccount() {
  createAccountModalVisible.value = false
  newUsername.value = ''
  accountPassword.value = ''
}

async function submitCreateAccount() {
  if (accountPassword.value.length < 8) {
    toast.error('Password must be at least 8 characters.')
    return
  }

  try {
    creatingAccount.value = true

    console.log('Creating account for parent', parent.value.id, {
      username: newUsername.value
    }) // temporary — remove once confirmed working

    parent.value = await parentsApi.createAccount(parent.value.id, {
      username: newUsername.value,
      password: accountPassword.value
    })

    toast.success('Parent account created successfully.')
    createAccountModalVisible.value = false

  } catch (error) {
    console.error('createAccount failed:', error) // temporary — shows the real cause in devtools

    const data = error.response?.data
    toast.error(data?.email?.[0] || data?.username?.[0] || data?.detail || 'Failed to create parent account.')

  } finally {
    creatingAccount.value = false
  }
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


<style scoped>
.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
