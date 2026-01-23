<template>
  <div class="p-4 sm:p-6 bg-gray-50 min-h-screen">

    <div
      class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0"
    >
      <h2 class="text-2xl font-semibold text-gray-800">Teachers</h2>
      <button
        @click="showCreateForm = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto"
      >
        + Add Teacher
      </button>
    </div>

  
    <div class="mb-6 flex justify-center sm:justify-start">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search teachers by name..."
        class="w-full sm:w-2/3 md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div class="hidden sm:block overflow-x-auto bg-white rounded-lg shadow-md">
      <table
        class="w-full text-left border-collapse min-w-[600px] text-sm md:text-base"
      >
        <thead class="bg-gray-100">
          <tr>
            <th class="py-3 px-4 text-gray-700 font-medium border-b">First Name</th>
            <th class="py-3 px-4 text-gray-700 font-medium border-b">Last Name</th>
            <th class="py-3 px-4 text-gray-700 font-medium border-b">Phone</th>
            <th class="py-3 px-4 text-gray-700 font-medium border-b">Email</th>
            <th class="py-3 px-4 text-gray-700 font-medium border-b text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="teacher in filteredTeachers"
            :key="teacher.id"
            class="hover:bg-gray-50 transition cursor-pointer"
            @click="viewTeachers(teacher)"
          >
            <td class="py-3 px-4 border-b">{{ teacher.first_name }}</td>
            <td class="py-3 px-4 border-b">{{ teacher.last_name }}</td>
            <td class="py-3 px-4 border-b">{{ teacher.phone_number }}</td>
            <td class="py-3 px-4 border-b">{{ teacher.email }}</td>
            <td class="py-3 px-4 border-b text-center">
              <button
                @click.stop="viewTeachers(teacher)"
                class="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm px-3 py-1 rounded transition"
              >
                View
              </button>
            </td>
          </tr>

          <tr v-if="filteredTeachers.length === 0">
            <td colspan="5" class="text-center py-4 text-gray-500">
              No teachers found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Card View (Mobile) -->
    <div class="sm:hidden space-y-4">
      <div
        v-for="teacher in filteredTeachers"
        :key="teacher.id"
        class="bg-white rounded-lg shadow border p-4 hover:shadow-md transition"
      >
        <div class="flex justify-between items-center">
          <h3 class="font-semibold text-gray-800">
            {{ teacher.first_name }} {{ teacher.last_name }}
          </h3>
        </div>
        <div class="mt-2 text-sm text-gray-600 space-y-1">
          <p><strong>Phone:</strong> {{ teacher.phone_number }}</p>
          <p><strong>Email:</strong> {{ teacher.email }}</p>
        </div>
        <button
          @click="viewTeachers(teacher)"
          class="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1.5 rounded transition w-full"
        >
          View
        </button>
      </div>

      <div
        v-if="filteredTeachers.length === 0"
        class="text-center text-gray-500 py-8"
      >
        No teachers found.
      </div>
    </div>

    <CreateTeacher
      v-if="showCreateForm"
      @close="showCreateForm = false"
      @teacherCreated="fetchTeachers"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CreateTeacher from '../components/CreateTeacher.vue'
import { useRouter } from 'vue-router'
import teachersApi from '../api/Teachers.js'

const router = useRouter()

const teachers = ref([])
const searchQuery = ref('')
const showCreateForm = ref(false)

onMounted(() => {
  fetchTeachers()
})

async function fetchTeachers() {
  try {
    teachers.value = await teachersApi.list()
  } catch (error) {
    console.error('Failed to fetch teachers:', error)
  }
}

const filteredTeachers = computed(() =>
  teachers.value.filter((t) =>
    `${t.first_name} ${t.last_name}`
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())
  )
)

function viewTeachers(teacher) {
  router.push({ name: 'TeachersDetail', params: { id: teacher.id } })
}
</script>

<style scoped>

</style>

