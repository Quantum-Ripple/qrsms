
<template>
  <div class="w-full max-w-full min-w-0 overflow-x-hidden bg-gray-50 min-h-screen p-3 sm:p-4 md:p-6">
    
    <div class="w-full max-w-3xl mx-auto min-w-0 bg-white rounded-2xl shadow p-4 sm:p-6 overflow-hidden">

      <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-5 sm:mb-6">
        Parent Details
      </h2>

      <div
        v-if="parents && parents.length"
        class="w-full min-w-0 space-y-4 sm:space-y-6"
      >

        <div
          v-for="parent in parents"
          :key="parent.id"
          class="w-full min-w-0 max-w-full p-4 border rounded-xl bg-gray-50 overflow-hidden"
        >

          <h3
            class="w-full min-w-0 max-w-full text-lg sm:text-xl font-semibold mb-4 text-gray-800 break-words overflow-wrap-anywhere"
          >
            {{ parent.full_name }}
            <span class="text-gray-500 font-normal">
              ({{ parent.relationship }})
            </span>
          </h3>

          <div class="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Email -->
            <div class="w-full min-w-0 max-w-full overflow-hidden">
              <p class="font-medium text-gray-700 text-sm">
                Email:
              </p>

              <p
                class="w-full min-w-0 max-w-full text-gray-800 mt-1 break-words overflow-wrap-anywhere"
              >
                {{ parent.email || 'N/A' }}
              </p>
            </div>


            <!-- Phone -->
            <div class="w-full min-w-0 max-w-full overflow-hidden">
              <p class="font-medium text-gray-700 text-sm">
                Phone:
              </p>

              <p
                class="w-full min-w-0 max-w-full text-gray-800 mt-1 break-words overflow-wrap-anywhere"
              >
                {{ parent.phone || 'N/A' }}
              </p>
            </div>


            <!-- Address -->
            <div class="w-full min-w-0 max-w-full sm:col-span-2 overflow-hidden">
              <p class="font-medium text-gray-700 text-sm">
                Address:
              </p>

              <p
                class="w-full min-w-0 max-w-full text-gray-800 mt-1 break-words overflow-wrap-anywhere"
              >
                {{ parent.address || 'N/A' }}
              </p>
            </div>


            <!-- Date Joined -->
            <div class="w-full min-w-0 max-w-full overflow-hidden">
              <p class="font-medium text-gray-700 text-sm">
                Date Joined:
              </p>

              <p
                class="w-full min-w-0 max-w-full text-gray-800 mt-1 break-words overflow-wrap-anywhere"
              >
                {{ parent.date_joined || 'N/A' }}
              </p>
            </div>

          </div>

        </div>

      </div>


      <!-- No Parents -->
      <div
        v-else
        class="w-full min-w-0 text-gray-500 italic py-4"
      >
        No parents found.
      </div>


      <!-- Back Button -->
      <div class="w-full min-w-0 mt-5 sm:mt-6">
        <button
          @click="backToStudent"
          class="w-full sm:w-auto max-w-full bg-gray-300 text-gray-800 px-4 py-2.5 rounded-lg hover:bg-gray-400 transition"
        >
          Back to Student
        </button>
      </div>

    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import studentsApi from '../../api/Students.js'

const route = useRoute()
const router = useRouter()

const parents = ref([])

const studentId = route.params.id

onMounted(async () => {
  try {
    const student = await studentsApi.get(studentId)
    parents.value = student.parents || []
  } catch (error) {
    console.error('Failed to fetch parents:', error)
  }
})

function backToStudent() {
  router.push({
    name: 'PrincipalStudentDetail',
    params: {
      id: studentId
    }
  })
}
</script>

<style scoped>
.overflow-wrap-anywhere {
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>

