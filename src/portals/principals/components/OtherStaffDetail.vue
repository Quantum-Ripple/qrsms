<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 border border-gray-100">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 class="text-2xl font-semibold text-gray-800">Other Staff Details</h2>
          <p class="text-sm text-gray-500">View and manage this staff member.</p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button @click="editMode = true" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit</button>
          <button @click="deleteStaff" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
          <router-link :to="{ name: 'PrincipalOtherStaff' }" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Back</router-link>
        </div>
      </div>

      <div v-if="!staff" class="text-gray-500">Loading staff data...</div>

      <div v-else>
        <div v-if="!editMode" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-500">First Name</p>
              <p class="mt-2 text-gray-800">{{ staff.first_name || '—' }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-500">Last Name</p>
              <p class="mt-2 text-gray-800">{{ staff.last_name || '—' }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-500">Email</p>
              <p class="mt-2 text-gray-800">{{ staff.email || '—' }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-500">Phone</p>
              <p class="mt-2 text-gray-800">{{ staff.phone_number || '—' }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-500">Position</p>
              <p class="mt-2 text-gray-800">{{ staff.position || '—' }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-500">Gender</p>
              <p class="mt-2 text-gray-800">{{ staff.gender || '—' }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-500">National ID</p>
              <p class="mt-2 text-gray-800">{{ staff.national_id || '—' }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-500">Hire Date</p>
              <p class="mt-2 text-gray-800">{{ staff.hire_date || '—' }}</p>
            </div>
            <div class="md:col-span-2 bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-500">Address</p>
              <p class="mt-2 text-gray-800">{{ staff.address || '—' }}</p>
            </div>
          </div>
        </div>

        <div v-else class="space-y-6">
          <form @submit.prevent="updateStaff" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="label">First Name</label>
                <input v-model="form.first_name" required class="field" />
              </div>
              <div>
                <label class="label">Last Name</label>
                <input v-model="form.last_name" required class="field" />
              </div>
              <div>
                <label class="label">Email</label>
                <input type="email" v-model="form.email" required class="field" />
              </div>
              <div>
                <label class="label">Phone Number</label>
                <input v-model="form.phone_number" required class="field" />
              </div>
              <div>
                <label class="label">Position</label>
                <input v-model="form.position" required class="field" />
              </div>
              <div>
                <label class="label">Gender</label>
                <select v-model="form.gender" class="field">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label class="label">National ID</label>
                <input v-model="form.national_id" class="field" />
              </div>
              <div>
                <label class="label">Hire Date</label>
                <input type="date" v-model="form.hire_date" class="field" />
              </div>
              <div class="md:col-span-2">
                <label class="label">Address</label>
                <textarea v-model="form.address" rows="3" class="field"></textarea>
              </div>
            </div>

            <div class="flex gap-3 justify-end">
              <button type="button" @click="cancelEdit" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
              <button type="submit" class="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import teachersApi from '../api/Teachers.js'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const staff = ref(null)
const form = ref(null)
const editMode = ref(false)

onMounted(async () => {
  try {
    const id = route.params.id
    staff.value = await teachersApi.getOtherStaff(id)
    form.value = { ...staff.value }
  } catch (error) {
    console.error('Failed to load staff details:', error)
    toast.error('Failed to load staff')
  }
})

async function updateStaff() {
  try {
    await teachersApi.updateOtherStaff(route.params.id, form.value)
    toast.success('Staff updated successfully')
    staff.value = { ...form.value }
    editMode.value = false
  } catch (error) {
    console.error('Failed to update staff:', error)
    toast.error('Failed to update staff')
  }
}

async function deleteStaff() {
  if (!confirm('Delete this staff member?')) return

  try {
    await teachersApi.removeOtherStaff(route.params.id)
    toast.success('Staff deleted successfully')
    router.push({ name: 'PrincipalOtherStaff' })
  } catch (error) {
    console.error('Failed to delete staff:', error)
    toast.error('Failed to delete staff')
  }
}

function cancelEdit() {
  editMode.value = false
  form.value = { ...staff.value }
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
