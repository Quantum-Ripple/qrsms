<template>
  <div class="p-6 space-y-6">
 
   

   
    <div class="flex flex-wrap gap-4 mb-4 items-center justify-between">
      <div class="flex flex-wrap gap-2 md:gap-4">
      <input
        v-model="search"
        type="text"
        placeholder="Search by class level..."
        class="border rounded px-3 py-2 w-64"
      />

      <select v-model="selectedClass" class="border rounded px-3 py-2">
          <option value="">All Classes</option>

          <option
            v-for="cls in classLevels"
            :key="cls.id"
            :value="cls.name"
          >
            {{ cls.name }}
          </option>
        </select>
      </div>
      <button
        @click="goToCreate"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Fee Structure
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto border rounded">
      <table class="w-full border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-left">Class</th>
            <th class="p-3 text-left">Term</th>
            <th class="p-3 text-left">Year</th>
            <th class="p-3 text-left">Amount</th>
            <th class="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="fee in filteredFees"
            :key="fee.id"
            class="border-t hover:bg-gray-50"
          >
            <td class="p-3">{{ fee.class_level_name }}</td>
            <td class="p-3">{{ fee.term_name }}</td>
            <td class="p-3">{{ fee.academic_year }}</td>
            <td class="p-3 font-medium">
              {{ formatCurrency(fee.amount) }}
            </td>
            <td class="p-3 text-center">
              <button
                @click="viewFee(fee.id)"
                class="text-blue-600 hover:underline"
              >
                View
              </button>
            </td>
          </tr>

          <tr v-if="!filteredFees.length">
            <td colspan="5" class="text-center p-4 text-gray-500">
              No fee structures found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFees } from '../api/fee'

import { getClassLevels } from '@/api/classes'

const classLevels = ref([])

const loadClassLevels = async () => {
  try {
    const data = await getClassLevels()

    console.log("Class Levels:", data)
    console.log("Is Array?", Array.isArray(data))

    classLevels.value = data
  } catch (err) {
    console.error("Failed to load class levels:", err)
  }
}



const router = useRouter()
const fees = ref([])
const search = ref('')
const selectedClass = ref('')

const fetchFees = async () => {
  try {
    const data = await getFees()

    console.log("Fees from API:", data)
    console.log("Is Array?", Array.isArray(data))

    fees.value = data
  } catch (err) {
    console.error("Failed to fetch fees:", err)
  }
}


onMounted(async () => {
    await loadClassLevels()
    await fetchFees()
})


/*const classLevels = computed(() => {
  return [...new Set(fees.value.map(f => f.class_level))]
})
*/

const filteredFees = computed(() => {
  return fees.value.filter(fee => {
    const className = fee.class_level_name || ""

    const matchesSearch =
      className.toLowerCase().includes(search.value.toLowerCase())

    const matchesClass =
      !selectedClass.value ||
      className === selectedClass.value

    return matchesSearch && matchesClass
  })
})

const goToCreate = () => {
  router.push({ name: 'FeeCreate'})
}

const viewFee = (id) => {
  router.push({
    name: 'FeeDetails',
    params: { id }
  })
}


const formatCurrency = (value) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(value)
</script>
