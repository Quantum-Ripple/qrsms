<template>
  <div class="min-h-screen bg-gray-100 p-6">

    <div
      v-if="parent"
      class="mx-auto max-w-4xl"
    >

      <!-- Header -->
      <div class="mb-6 rounded-2xl bg-white p-6 shadow">

        <div class="flex items-center gap-4">

          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
          >
            {{ parent.first_name?.charAt(0) }}
          </div>

          <div>
            <h2 class="text-2xl font-bold text-gray-800">
              Edit Parent
            </h2>

            <p class="text-gray-500">
              Update {{ parent.full_name }}'s information
            </p>
          </div>

        </div>

      </div>


      <!-- Edit Form -->
      <form
        @submit.prevent="saveParent"
        class="rounded-2xl bg-white p-6 shadow"
      >

        <h3 class="mb-5 text-lg font-semibold text-gray-800">
          Parent Information
        </h3>


        <div class="grid gap-5 md:grid-cols-2">

          <!-- First Name -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              First Name
            </label>

            <input
              v-model="form.first_name"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>


          <!-- Middle Name -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Middle Name
            </label>

            <input
              v-model="form.middle_name"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <!-- Last Name -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Last Name
            </label>

            <input
              v-model="form.last_name"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>


          <!-- Email -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              v-model="form.email"
              type="email"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>


          <!-- Phone -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Phone
            </label>

            <input
              v-model="form.phone"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <!-- Relationship -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Relationship
            </label>

            <select
              v-model="form.relationship"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
            </select>
          </div>


          <!-- Address -->
          <div class="md:col-span-2">

            <label class="mb-2 block text-sm font-medium text-gray-700">
              Address
            </label>

            <textarea
              v-model="form.address"
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>

          </div>


          <!-- Active Status -->
          <div class="md:col-span-2">

            <label class="flex items-center gap-3 cursor-pointer">

              <input
                v-model="form.is_active"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              <span class="text-sm font-medium text-gray-700">
                Parent is active
              </span>

            </label>

          </div>

        </div>


        <!-- Actions -->
        <div class="mt-8 flex justify-end gap-3">

          <button
            type="button"
            @click="cancel"
            class="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="saving"
            class="rounded-lg bg-blue-600 px-5 py-2.5 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>

        </div>

      </form>

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

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import parentsApi from '../../api/parents.js'


const route = useRoute()
const router = useRouter()
const toast = useToast()


const parent = ref(null)
const saving = ref(false)


const form = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  relationship: 'Father',
  is_active: true,
})


function populateForm(data) {
  form.value = {
    first_name: data.first_name || '',
    middle_name: data.middle_name || '',
    last_name: data.last_name || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    relationship: data.relationship || 'Father',
    is_active: data.is_active ?? true,
  }
}


async function saveParent() {

  if (!parent.value) return

  try {

    saving.value = true

    const updatedParent = await parentsApi.update(
      parent.value.id,
      form.value
    )

    parent.value = updatedParent

    toast.success('Parent details updated successfully.')

    router.push({
      name: 'ParentPage',
      params: {
        id: parent.value.id,
      },
    })

  } catch (error) {

    console.error('Failed to update parent:', error)

    const data = error?.response?.data

    if (data?.email?.length) {
      toast.error(data.email[0])
    } else if (data?.detail) {
      toast.error(data.detail)
    } else {
      toast.error('Failed to update parent details.')
    }

  } finally {

    saving.value = false

  }
}


function cancel() {

  router.push({
    name: 'ParentPage',
    params: {
      id: route.params.id,
    },
  })

}


onMounted(async () => {

  const id = route.params.id

  try {

    parent.value = await parentsApi.get(id)

    populateForm(parent.value)

  } catch (error) {

    console.error('Failed to fetch parent:', error)

    toast.error(
      error?.response?.data?.detail ||
      'Failed to load parent.'
    )

  }

})

</script>