<template>
  <div class="p-4 sm:p-6 bg-gray-50 min-h-screen">

    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0"
    >
      <h2 class="text-2xl font-semibold text-gray-800">
        Other Staff
      </h2>

      <button
        @click="goToCreateOtherStaff"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto"
      >
        + Add Staff
      </button>
    </div>

    <!-- Search -->
    <div class="mb-6 flex justify-center sm:justify-start">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search staff by name..."
        class="w-full sm:w-2/3 md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Desktop Table -->
    <div class="hidden sm:block overflow-x-auto bg-white rounded-lg shadow-md">

      <table
        class="w-full text-left border-collapse min-w-[700px] text-sm md:text-base"
      >
        <thead class="bg-gray-100">
          <tr>
            <th class="py-3 px-4 border-b">First Name</th>
            <th class="py-3 px-4 border-b">Last Name</th>
            <th class="py-3 px-4 border-b">Position</th>
            <th class="py-3 px-4 border-b">Phone</th>
            <th class="py-3 px-4 border-b">Email</th>
            <th class="py-3 px-4 border-b text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-if="isLoading"
          >
            <td colspan="6" class="text-center py-6">
              Loading...
            </td>
          </tr>

          <tr
            v-else-if="isError"
          >
            <td colspan="6" class="text-center py-6 text-red-500">
              Failed to load staff.
            </td>
          </tr>

          <tr
            v-for="member in filteredStaff"
            :key="member.id"
            class="hover:bg-gray-50 transition cursor-pointer"
            @click="viewOtherStaff(member)"
          >
            <td class="py-3 px-4 border-b">
              {{ member.first_name }}
            </td>

            <td class="py-3 px-4 border-b">
              {{ member.last_name }}
            </td>

            <td class="py-3 px-4 border-b">
              {{ member.position }}
            </td>

            <td class="py-3 px-4 border-b">
              {{ member.phone_number }}
            </td>

            <td class="py-3 px-4 border-b">
              {{ member.email }}
            </td>

            <td class="py-3 px-4 border-b text-center">

              <button
                @click.stop="viewOtherStaff(member)"
                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                View
              </button>

            </td>

          </tr>

          <tr
            v-if="!isLoading && filteredStaff.length === 0"
          >
            <td
              colspan="6"
              class="text-center py-6 text-gray-500"
            >
              No staff found.
            </td>
          </tr>

        </tbody>

      </table>

    </div>

    <!-- Mobile Cards -->

    <div class="sm:hidden space-y-4">

      <div
        v-for="member in filteredStaff"
        :key="member.id"
        class="bg-white rounded-lg shadow border p-4"
      >

        <h3 class="font-semibold text-gray-800">
          {{ member.first_name }} {{ member.last_name }}
        </h3>

        <div class="mt-2 text-sm text-gray-600 space-y-1">

          <p>
            <strong>Position:</strong>
            {{ member.position }}
          </p>

          <p>
            <strong>Phone:</strong>
            {{ member.phone_number }}
          </p>

          <p>
            <strong>Email:</strong>
            {{ member.email }}
          </p>

        </div>

        <button
          @click="viewOtherStaff(member)"
          class="mt-3 bg-blue-500 hover:bg-blue-600 text-white w-full py-2 rounded"
        >
          View
        </button>

      </div>

      <div
        v-if="!isLoading && filteredStaff.length === 0"
        class="text-center py-8 text-gray-500"
      >
        No staff found.
      </div>

    </div>

    <!-- Pagination -->

    <div
      class="flex items-center justify-between px-4 py-3 border-t bg-gray-50 mt-6"
    >

      <button
        :disabled="!data?.previous"
        @click="page--"
        class="px-3 py-1 bg-white border rounded disabled:opacity-40"
      >
        Previous
      </button>

      <span class="text-sm text-gray-600">
        Page {{ page }}
      </span>

      <button
        :disabled="!data?.next"
        @click="page++"
        class="px-3 py-1 bg-white border rounded disabled:opacity-40"
      >
        Next
      </button>

    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import teachersApi from '../api/Teachers'

const router = useRouter()

const page = ref(1)
const searchQuery = ref('')

const {
  data,
  isLoading,
  isError
} = useQuery({
  queryKey: ['other-staff', page],
  queryFn: () => teachersApi.listOtherStaff(page.value),
  keepPreviousData: true
})

const staff = computed(() => data.value?.results || [])

const filteredStaff = computed(() =>
  staff.value.filter(member =>
    `${member.first_name} ${member.last_name}`
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())
  )
)

function goToCreateOtherStaff() {
  router.push({
    name: 'PrincipalCreateOtherStaff'
  })
}

function viewOtherStaff(member) {
  router.push({
    name: 'OtherStaffDetail',
    params: {
      id: member.id
    }
  })
}
</script>

<style scoped>

</style>