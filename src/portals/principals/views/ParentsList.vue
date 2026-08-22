<template>
  <div class="p-4 sm:p-6 bg-gray-50 min-h-screen">

    <!-- HEADER -->
    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0"
    >
      <div>
        <h2 class="text-2xl font-semibold text-gray-800">
          Parents
        </h2>
      </div>
    </div>


    <!-- SEARCH -->
    <div class="mb-6 flex justify-center sm:justify-start">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search parents by name, email or phone..."
        class="w-full sm:w-2/3 md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>


    <!-- TABLE CARD -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">

      <!-- DESKTOP TABLE -->
      <div class="hidden sm:block overflow-x-auto">

        <table
          class="w-full text-left border-collapse min-w-[850px] text-sm md:text-base"
        >

          <thead class="bg-gray-100">

            <tr>

              <th class="py-3 px-4 text-gray-700 font-medium border-b">
                Full Name
              </th>

              <th class="py-3 px-4 text-gray-700 font-medium border-b">
                Relationship
              </th>

              <th class="py-3 px-4 text-gray-700 font-medium border-b">
                Phone
              </th>

              <th class="py-3 px-4 text-gray-700 font-medium border-b">
                Email
              </th>

              <th class="py-3 px-4 text-gray-700 font-medium border-b">
                Students
              </th>

              <th class="py-3 px-4 text-gray-700 font-medium border-b">
                Account
              </th>

              <th class="py-3 px-4 text-gray-700 font-medium border-b text-center">
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            <tr
              v-for="parent in parents"
              :key="parent.id"
              class="hover:bg-gray-50 transition cursor-pointer"
              @click="viewParent(parent)"
            >

              <td class="py-3 px-4 border-b font-medium text-gray-800">
                {{ parent.full_name }}
              </td>

              <td class="py-3 px-4 border-b">
                {{ parent.relationship }}
              </td>

              <td class="py-3 px-4 border-b">
                {{ parent.phone || '—' }}
              </td>

              <td class="py-3 px-4 border-b">
                {{ parent.email || '—' }}
              </td>

              <td class="py-3 px-4 border-b">
                {{ parent.students?.length || 0 }}
              </td>

              <td class="py-3 px-4 border-b">

                <span
                  v-if="parent.user"
                  class="text-green-700 bg-green-100 px-2 py-1 rounded-md text-xs font-medium"
                >
                  Active
                </span>

                <span
                  v-else
                  class="text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs font-medium"
                >
                  No Account
                </span>

              </td>

              <td class="py-3 px-4 border-b text-center">

                <button
                  @click.stop="viewParent(parent)"
                  class="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm px-3 py-1 rounded transition"
                >
                  View
                </button>

              </td>

            </tr>


            <tr v-if="parents.length === 0 && !isLoading">

              <td
                colspan="7"
                class="text-center py-6 text-gray-500"
              >
                No parents found.
              </td>

            </tr>


            <tr v-if="isLoading">

              <td
                colspan="7"
                class="text-center py-6 text-gray-500"
              >
                Loading parents...
              </td>

            </tr>

          </tbody>

        </table>

      </div>


      <!-- MOBILE CARDS -->
      <div class="sm:hidden divide-y">

        <div
          v-for="parent in parents"
          :key="parent.id"
          class="p-4 hover:bg-gray-50 transition"
          @click="viewParent(parent)"
        >

          <div class="flex justify-between items-center">

            <h3 class="font-semibold text-gray-800">
              {{ parent.full_name }}
            </h3>

            <span
              class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md"
            >
              {{ parent.relationship }}
            </span>

          </div>


          <div class="mt-3 text-sm text-gray-600 space-y-1">

            <p>
              <strong>Phone:</strong>
              {{ parent.phone || '—' }}
            </p>

            <p>
              <strong>Email:</strong>
              {{ parent.email || '—' }}
            </p>

            <p>
              <strong>Students:</strong>
              {{ parent.students?.length || 0 }}
            </p>

            <p>
              <strong>Account:</strong>

              <span
                v-if="parent.user"
                class="text-green-700 font-medium"
              >
                Active
              </span>

              <span
                v-else
                class="text-gray-500 font-medium"
              >
                No Account
              </span>

            </p>

          </div>


          <button
            @click.stop="viewParent(parent)"
            class="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1.5 rounded transition w-full"
          >
            View
          </button>

        </div>


        <div
          v-if="parents.length === 0 && !isLoading"
          class="text-center text-gray-500 py-8"
        >
          No parents found.
        </div>


        <div
          v-if="isLoading"
          class="text-center text-gray-500 py-8"
        >
          Loading parents...
        </div>

      </div>


      <!-- PAGINATION -->
      <div
        class="flex items-center justify-between px-4 py-3 border-t bg-gray-50"
      >

        <button
          :disabled="!data?.previous || isFetching"
          @click="page--"
          class="px-3 py-1 bg-white border rounded disabled:opacity-40"
        >
          Previous
        </button>


        <div class="text-sm text-gray-600">

          Page {{ page }}

          <span
            v-if="isFetching"
            class="ml-2 text-gray-400"
          >
            Loading...
          </span>

        </div>


        <button
          :disabled="!data?.next || isFetching"
          @click="page++"
          class="px-3 py-1 bg-white border rounded disabled:opacity-40"
        >
          Next
        </button>

      </div>

    </div>

  </div>
</template>


<script setup>

import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'

import parentsApi from '../api/parents.js'


const router = useRouter()


const searchQuery = ref('')
const debouncedSearch = ref('')
const page = ref(1)


let searchTimeout = null


/*
 * Debounce search.
 *
 * This prevents an API request from being
 * sent for every character typed.
 */
watch(searchQuery, (value) => {

  clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {

    debouncedSearch.value = value.trim()

    // Always return to page 1
    // when a new search begins.
    page.value = 1

  }, 300)

})


/*
 * Parents query.
 *
 * Vue Query caches each combination of:
 *
 * parents + page + search
 *
 * Example:
 *
 * ['parents', 1, 'john']
 * ['parents', 2, 'john']
 * ['parents', 1, 'musyoka']
 *
 * These are separate cached queries.
 */
const {
  data,
  isLoading,
  isFetching
} = useQuery({

  queryKey: [
    'parents',
    page,
    debouncedSearch
  ],

  queryFn: () =>
    parentsApi.listPaginated(
      page.value,
      debouncedSearch.value
    ),

  keepPreviousData: true,

  staleTime: 5 * 60 * 1000,

  refetchOnMount: 'always'

})


/*
 * DRF pagination returns:
 *
 * {
 *   count,
 *   next,
 *   previous,
 *   results
 * }
 *
 * So the actual parents are inside results.
 */
const parents = computed(() => {
  return data.value?.results || []
})


function viewParent(parent) {

  router.push({
    name: 'ParentPage',
    params: {
      id: parent.id
    }
  })

}


onBeforeUnmount(() => {

  clearTimeout(searchTimeout)

})

</script>