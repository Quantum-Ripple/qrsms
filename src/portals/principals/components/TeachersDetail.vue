<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-6">

    <div
      v-if="teacher"
      class="mx-auto max-w-5xl space-y-6"
    >

      <!-- ================= VIEW MODE ================= -->
      <template v-if="!editMode">

        <!-- HEADER -->
        <div class="rounded-2xl bg-white p-6 shadow">

          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div class="flex items-center gap-4">

              <!-- Avatar -->
              <div
                class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
              >
                {{ teacher.first_name?.charAt(0) }}
              </div>

              <div>
                <h2 class="text-2xl font-bold text-gray-800">
                  {{ teacher.first_name }} {{ teacher.last_name }}
                </h2>

                <p class="text-gray-500">
                  {{ teacher.email || 'No email' }}
                </p>
              </div>

            </div>

            <!-- Status -->
            <div>
              <span
                v-if="teacher.is_active"
                class="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
              >
                Active Teacher
              </span>

              <span
                v-else
                class="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600"
              >
                Inactive Teacher
              </span>
            </div>

          </div>

        </div>


        <!-- TEACHER INFORMATION -->
        <section class="rounded-2xl bg-white p-6 shadow">

          <h3 class="mb-5 text-lg font-semibold text-gray-800">
            Teacher Information
          </h3>

          <div class="grid gap-5 md:grid-cols-2">

            <InfoItem
              label="First Name"
              :value="teacher.first_name"
            />

            <InfoItem
              label="Last Name"
              :value="teacher.last_name"
            />

            <InfoItem
              label="Gender"
              :value="teacher.gender || 'N/A'"
            />

            <InfoItem
              label="National ID"
              :value="teacher.national_id || 'N/A'"
            />

            <InfoItem
              label="Phone"
              :value="teacher.phone_number || 'N/A'"
            />

            <InfoItem
              label="Date of Birth"
              :value="teacher.date_of_birth || 'N/A'"
            />

            <InfoItem
              label="Email"
              :value="teacher.email || 'N/A'"
            />

            <InfoItem
              label="Address"
              :value="teacher.address || 'N/A'"
            />

          </div>

        </section>


        <!-- TEACHING INFORMATION -->
        <section class="rounded-2xl bg-white p-6 shadow">

          <h3 class="mb-5 text-lg font-semibold text-gray-800">
            Teaching Information
          </h3>

          <div class="grid gap-5 md:grid-cols-2">

            <InfoItem
              label="Class Teacher"
              :value="teacher.is_class_teacher ? 'Yes' : 'No'"
            />

            <InfoItem
              label="Number of Assignments"
              :value="teacher.assignments?.length || 0"
            />

          </div>

        </section>


        <!-- TEACHING ASSIGNMENTS -->
        <section class="rounded-2xl bg-white p-6 shadow">

          <h3 class="mb-5 text-lg font-semibold text-gray-800">
            Teaching Assignments
          </h3>

          <div
            v-if="teacher.assignments?.length"
            class="space-y-3"
          >

            <div
              v-for="assignment in teacher.assignments"
              :key="assignment.id"
              class="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >

              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                <div>
                  <p class="font-semibold text-gray-800">
                    {{ assignment.class_level_name || assignment.class_level }}
                  </p>

                  <p class="text-sm text-gray-500">
                    Stream:
                    {{ assignment.stream_name || assignment.stream || 'N/A' }}
                  </p>
                </div>

                <span
                  class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                >
                  {{ assignment.subject || 'No subject' }}
                </span>

              </div>

            </div>

          </div>

          <div
            v-else
            class="rounded-xl bg-gray-50 p-5 text-center text-gray-500"
          >
            No teaching assignments found.
          </div>

        </section>


        <!-- Teacher Account -->
        <section class="rounded-2xl bg-white p-6 shadow">

          <h3 class="mb-5 text-lg font-semibold text-gray-800">
            Teacher Account
          </h3>

          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <p class="text-sm text-gray-500">
                Account Status
              </p>

              <span
                v-if="hasAccount"
                class="inline-block mt-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
              >
                Active
              </span>

              <span
                v-else
                class="inline-block mt-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600"
              >
                No Account
              </span>
            </div>

            <button
              v-if="hasAccount"
              @click="openResetPassword"
              class="rounded-lg bg-green-600 px-5 py-3 text-white transition hover:bg-green-700"
            >
              Reset Teacher Password
            </button>

          </div>

        </section>


        <!-- ACTIONS -->
        <section class="rounded-2xl bg-white p-6 shadow">

          <div class="flex flex-col sm:flex-row gap-3">

            <button
              @click="editMode = true"
              class="rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
            >
              Edit Teacher
            </button>

            <button
              @click="deleteTeacher"
              class="rounded-lg bg-red-600 px-5 py-3 text-white transition hover:bg-red-700"
            >
              Delete Teacher
            </button>

          </div>

        </section>

      </template>


      <!-- ================= LOADING ================= -->
      <div
        v-if="!teacher"
        class="text-center text-gray-500"
      >
        Loading teacher...
      </div>


      <!-- ================= EDIT MODE ================= -->
      <section
        v-if="teacher && editMode"
        class="rounded-2xl bg-white p-6 shadow"
      >

        <div class="mb-6">

          <h2 class="text-2xl font-bold text-gray-800">
            Edit Teacher
          </h2>

          

        </div>


        <form
          @submit.prevent="updateTeacher"
          class="space-y-8"
        >

          <!-- BASIC INFORMATION -->
          <div>

            <h3 class="mb-4 text-lg font-semibold text-gray-800">
              Teacher Information
            </h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">

              <input
                v-model="form.first_name"
                class="field"
                placeholder="First Name"
              />

              <input
                v-model="form.last_name"
                class="field"
                placeholder="Last Name"
              />

              <select
                v-model="form.gender"
                class="field"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <input
                v-model="form.national_id"
                class="field"
                placeholder="National ID"
              />

              <input
                v-model="form.email"
                readonly
                class="field bg-gray-100 cursor-not-allowed"
              />

              <input
                v-model="form.phone_number"
                class="field"
                placeholder="Phone"
              />

              <input
                type="date"
                v-model="form.date_of_birth"
                class="field"
              />

              <textarea
                v-model="form.address"
                class="field md:col-span-2"
                placeholder="Address"
              ></textarea>

              <label class="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  v-model="form.is_class_teacher"
                />

                <span class="text-sm text-gray-700">
                  Is Class Teacher
                </span>
              </label>

            </div>

          </div>


          <!-- ASSIGNMENTS -->
          <div>

            <div class="flex items-center justify-between mb-4">

              <h3 class="text-lg font-semibold text-gray-800">
                Teaching Assignments
              </h3>

              <button
                type="button"
                @click="addAssignment"
                class="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                + Add Assignment
              </button>

            </div>


            <div
              v-if="form.assignments?.length"
              class="space-y-4"
            >

              <AssignmentForm
                v-for="(assignment, index) in form.assignments"
                :key="index"
                v-model="form.assignments[index]"
                :classLevels="classLevels"
                @remove="removeAssignment(index)"
              />

            </div>


            <div
              v-else
              class="rounded-xl bg-gray-50 p-5 text-center text-gray-500"
            >
              No teaching assignments.
            </div>

          </div>


          <!-- EDIT ACTIONS -->
          <div
            class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t pt-6"
          >

            <button
              type="button"
              @click="editMode = false"
              class="rounded-lg border border-gray-300 px-5 py-3 text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="rounded-lg bg-green-600 px-5 py-3 text-white transition hover:bg-green-700"
            >
              Save Changes
            </button>

          </div>

        </form>

      </section>

    </div>


    <!-- Password Reset Modal -->
<div
  v-if="resetModalVisible"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
>
  <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

    <h3 class="text-xl font-semibold text-gray-800">
      Reset Teacher Password
    </h3>

    <p class="mt-2 text-sm text-gray-500">
      Enter a new password for {{ teacher.email}}.
    </p>

    <!-- New Password -->
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

    <!-- Confirm Password -->
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

    <!-- Actions -->
    <div class="mt-6 flex justify-end gap-3">

      <button
        @click="closeResetPassword"
        class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
      >
        Cancel
      </button>

      <button
        @click="resetPassword"
        :disabled="!newPassword || !confirmPassword || resetting"
        class="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ resetting ? 'Resetting...' : 'Reset Password' }}
      </button>

    </div>

  </div>
</div>

  </div>
</template>


<script setup>

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import teachersApi from '../api/Teachers.js'
import { fetchClassLevels } from "@/api/classes.js"
import AssignmentForm from '../composables/AssignmentForm.vue'
import InfoItem from '../../teachers/components/InfoItem.vue'


const route = useRoute()
const router = useRouter()
const toast = useToast()


const teacher = ref(null)
const form = ref(null)
const editMode = ref(false)

const classLevels = ref([])

const resetModalVisible = ref(false)
const resetting = ref(false)

const newPassword = ref('')
const confirmPassword = ref('')

const hasAccount = true


/**
 * INIT
 */
onMounted(async () => {

  try {

    const res = await fetchClassLevels()

    const payload = Array.isArray(res.data)
      ? res.data
      : res.data?.results || res.data?.data || []

    classLevels.value = Array.isArray(payload)
      ? payload
      : []

    const id = route.params.id

    teacher.value = await teachersApi.get(id)

    normalizeForm()

  } catch (error) {

    console.error(error)

    toast.error("Failed to load teacher")

  }

})

function openResetPassword() {
  newPassword.value = ''
  confirmPassword.value = ''
  resetModalVisible.value = true
}

function closeResetPassword() {
  resetModalVisible.value = false
  newPassword.value = ''
  confirmPassword.value = ''
}


/**
 * Normalize backend → form
 */
function normalizeForm() {

  form.value = {

    ...teacher.value,

    assignments:
      teacher.value.assignments?.map(a => ({

        id: a.id,

        class_level:
          a.class_level_id ||
          resolveClassLevelId(
            a.class_level_name ||
            a.class_level
          ),

        stream:
          a.stream_id ||
          resolveStreamId(
            a.stream_name ||
            a.stream,
            a.class_level_id ||
            a.class_level_name ||
            a.class_level
          ),

        subject: a.subject,

        is_class_teacher:
          a.is_class_teacher || false

      })) || []

  }

}


function resolveClassLevelId(value) {

  if (!value) return ''

  const normalizedValue =
    String(value).trim().toLowerCase()

  const match =
    classLevels.value.find(level => {

      const levelName =
        String(
          level.name ||
          level.class_level_name ||
          level.class_level ||
          ''
        )
        .trim()
        .toLowerCase()

      return (
        levelName === normalizedValue ||
        String(level.id) === normalizedValue
      )

    })

  return match
    ? Number(match.id)
    : ''

}


function resolveStreamId(value, classLevelValue) {

  if (!value) return ''

  const normalizedValue =
    String(value).trim().toLowerCase()

  const classLevelId =
    resolveClassLevelId(classLevelValue)

  const selectedClass =
    classLevels.value.find(
      level =>
        Number(level.id) === Number(classLevelId)
    )

  const match =
    Array.isArray(selectedClass?.streams)
      ? selectedClass.streams.find(stream => {

          const streamName =
            String(
              stream.name ||
              stream.stream_name ||
              stream.label ||
              ''
            )
            .trim()
            .toLowerCase()

          return (
            streamName === normalizedValue ||
            String(stream.id) === normalizedValue
          )

        })
      : null

  return match
    ? Number(match.id)
    : ''

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

    .filter(
      a =>
        a.class_level &&
        a.stream &&
        a.subject
    )

    .map(assignment => ({

      id: assignment.id,

      class_level: assignment.class_level,

      stream: assignment.stream,

      subject: assignment.subject

    }))

}


/**
 * Update teacher
 */
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


    await teachersApi.update(
      teacher.value.id,
      payload
    )


    toast.success("Teacher updated successfully")

    editMode.value = false


    teacher.value =
      await teachersApi.get(
        teacher.value.id
      )

    normalizeForm()

  } catch (error) {

    console.error(
      error.response?.data || error
    )

    toast.error("Update failed")

  }

}


/**
 * Delete teacher
 */
async function deleteTeacher() {

  const confirmed =
    confirm(
      "Are you sure you want to delete this teacher?"
    )

  if (!confirmed) return


  try {

    await teachersApi.remove(
      teacher.value.id
    )

    toast.success("Teacher deleted")

    router.push({
      name: 'PrincipalTeachers'
    })

  } catch (error) {

    console.error(error)

    toast.error("Delete failed")

  }
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

    await teachersApi.resetPassword(teacher.value.id, {
      password: newPassword.value,
      confirm_password: confirmPassword.value
    })

    toast.success('Teacher password reset successfully.')

    closeResetPassword()

  } catch (error) {
    const data = error.response?.data

    if (data?.password?.length) {
      toast.error(data.password[0])
    } else if (data?.confirm_password?.length) {
      toast.error(data.confirm_password[0])
    } else if (data?.detail) {
      toast.error(data.detail)
    } else {
      toast.error('Failed to reset teacher password.')
    }

  } finally {
    resetting.value = false
  }
}



</script>


<style scoped>

.field {

  width: 100%;

  border: 1px solid #e5e7eb;

  padding: 10px 12px;

  border-radius: 8px;

  background: white;

  outline: none;

  transition: border-color 0.2s, box-shadow 0.2s;

}

.field:focus {

  border-color: #3b82f6;

  box-shadow:
    0 0 0 2px
    rgba(59, 130, 246, 0.15);

}


</style>