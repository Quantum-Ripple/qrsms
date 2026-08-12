<template>
  <div class="p-6 bg-gray-50 min-h-screen space-y-6">

    <!-- HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h2 class="text-2xl font-semibold text-gray-800">Students</h2>

      <button
        @click="goToCreateStudents"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto"
      >
        + Add Student
      </button>
    </div>

    <!-- SEARCH -->
    <div class="max-w-md">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search students..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <!-- TABLE CARD -->
    <div class="bg-white rounded-xl shadow overflow-hidden">

      <!-- DESKTOP TABLE -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-100 text-gray-700">
            <tr>
              <th class="px-4 py-3">Full Name</th>
              <th class="px-4 py-3">Admission No.</th>
              <th class="px-4 py-3">Class Level</th>
              <th class="px-4 py-3">Stream</th>
              <th class="px-4 py-3">Gender</th>
              <th class="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="student in students"
              :key="student.id"
              class="border-t hover:bg-gray-50 cursor-pointer"
              @click="viewStudent(student)"
            >
              <td class="px-4 py-3">{{ student.full_name }}</td>
              <td class="px-4 py-3">{{ student.admission_number }}</td>
              <td class="px-4 py-3">{{ student.class_level }}</td>
              <td class="px-4 py-3">{{ student.stream }}</td>
              <td class="px-4 py-3">{{ student.gender }}</td>
              <td class="px-4 py-3 text-center">
                <button
                  @click.stop="viewStudent(student)"
                  class="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
                >
                  View
                </button>
              </td>
            </tr>

            <tr v-if="students.length === 0">
              <td colspan="6" class="text-center py-6 text-gray-500">
                No students found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE CARDS -->
      <div class="sm:hidden divide-y">
        <div
          v-for="student in students"
          :key="student.id"
          class="p-4 space-y-2"
        >
          <div class="flex justify-between items-center">
            <p class="font-semibold">{{ student.full_name }}</p>
            <span class="text-xs bg-gray-100 px-2 py-1 rounded">
              {{ student.gender }}
            </span>
          </div>

          <p class="text-sm text-gray-600">
            Adm: {{ student.admission_number }}
          </p>

          <p class="text-sm text-gray-600">
            {{ student.class_level_name }} - {{ student.stream_name }}
          </p>

          <button
            @click="viewStudent(student)"
            class="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
          >
            View
          </button>
        </div>
      </div>

      <!-- PAGINATION FOOTER -->
      <div class="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
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

  </div>
</template>

<script setup>

import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import studentsApi from '../api/Students.js'

const router = useRouter()

const searchQuery = ref('')
const debouncedSearch = ref('')
const page = ref(1)

let searchTimeout = null

// Debounce search so we don't send an API request for every keystroke.
watch(searchQuery, (value) => {
  clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    debouncedSearch.value = value.trim()
    page.value = 1
  }, 300)
})
/*
const { data } = useQuery({
  queryKey: ['students', page, debouncedSearch],

  queryFn: () =>
    studentsApi.listpaginate(
      page.value,
      debouncedSearch.value
    ),

  keepPreviousData: true,
})*/
const { data, isLoading, isFetching } = useQuery({
  queryKey: ['students', page, debouncedSearch],

  queryFn: () =>
    studentsApi.listpaginate(
      page.value,
      debouncedSearch.value
    ),

  keepPreviousData: true,

  staleTime:5 * 60 * 1000,
  refetchOnMount: 'always',
})

const students = computed(() => data.value?.results || [])

function goToCreateStudents() {
  router.push({ name: 'CreateStudent' })
}

function viewStudent(student) {
  router.push({
    name: 'PrincipalStudentDetail',
    params: { id: student.id }
  })
}

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
})

</script>

<style scoped>

</style>