<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Create Fee Structure</h1>
      <button @click="goBack" class="text-gray-600 hover:text-gray-800">
        ← Back
      </button>
    </div>

    <div class="bg-white shadow rounded-lg p-6 space-y-6">
      <form @submit.prevent="submitForm" class="space-y-5">

        
        <div>
          <label class="block mb-1 font-medium">Class Level</label>
         <select
              v-model="form.class_level"
              class="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select class</option>

              <option
                v-for="cls in classLevels"
                :key="cls.id"
                :value="cls.id"
              >
                {{ cls.name }}
              </option>
            </select>
        </div>

      
        <div>
          <label class="block mb-1 font-medium">Term</label>
          <select
              v-model="form.term"
              class="w-full border p-2 rounded"
              required
              >

              <option disabled value="">
              Select Term
              </option>

              <option
              v-for="term in terms"
              :key="term.id"
              :value="term.id"
              >
              {{term.name}}
              </option>

              </select>
        </div>
            <div>
              <label class="block mb-1 font-medium">Academic Year</label>
              <input
                type="number"
                v-model.number="form.year"
                class="w-full border rounded px-3 py-2"
                placeholder="2026"
                required
              />
            </div>


        <div>
          <label class="block mb-1 font-medium">Fee Amount</label>
          <input
            type="number"
            v-model.number="form.amount"
            step="0.01"
            class="w-full border rounded px-3 py-2"
            placeholder="36000"
            required
          />
        </div>

      
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="goBack"
            class="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            :disabled="loading"
          >
            {{ loading ? 'Saving...' : 'Save Fee Structure' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createFee } from '../../api/fee'
import { listTerms } from '../../api/term'
import { useToast } from 'vue-toastification'

import { getClassLevels } from '@/api/classes'

const academicYear = ref(null)

const loadCurrentYear = async()=>{
   academicYear.value = await getCurrentAcademicYear()
}

const terms = ref([])

const loadTerms = async () => {
  try {
    const data = await listTerms()

    console.log("Terms from API:", data)

    terms.value = data

  } catch(error) {
    console.error("Loading terms failed:", error)
  }
}

const classLevels = ref([])

const loadClassLevels = async () => {
  classLevels.value = await getClassLevels()
}

onMounted(async () => {
  await loadClassLevels()
  await loadTerms()
})

const router = useRouter()
const loading = ref(false)
const toast = useToast()


const form = ref({
  class_level: '',
  term: '',
  year: null,
  amount: null
})

const submitForm = async () => {
  try {
    loading.value = true

    await createFee({
      class_level: form.value.class_level,
      term: form.value.term,
      year: Number(form.value.year),
      amount: Number(form.value.amount)
    })
    toast.success("Fee structure added successfully!")

    router.push({ name: 'FinanceFeeStructure' })
  } catch (error) {
    toast.error("Fee structure creation failed!")
    console.error('Failed to create fee structure:', error.response?.data || error)
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()
</script>
