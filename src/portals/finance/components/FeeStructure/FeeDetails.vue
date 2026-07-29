<template>
  <div class="max-w-5xl mx-auto p-6 space-y-6">

    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Fee Structure</h1>
       
      </div>

      <div class="flex gap-3">
        <button
          @click="goBack"
          class="px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          Back
        </button>

        <button
          @click="toggleEdit"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {{ editing ? 'Cancel Edit' : 'Edit' }}
        </button>

        <button
          @click="goToPrint"
          class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
        >
          Print
        </button>
      </div>
    </div>

  
    <div v-if="fee" class="bg-white border rounded-lg p-6 grid grid-cols-2 gap-6">
      
      <div>
        <p class="text-xs text-gray-500">Class Level</p>
        <div v-if="editing">
          <select
                v-model="editableFee.class_level"
                class="w-full border rounded px-2 py-1"
              >
                <option
                  v-for="cls in classLevels"
                  :key="cls.id"
                  :value="cls.id"
                >
                  {{ cls.name }}
                </option>
              </select>
        </div>
        <p v-else class="text-lg font-medium">{{ fee.class_level_name }}</p>
      </div>

    
      <div>
        <p class="text-xs text-gray-500">Term</p>
        <div v-if="editing">
          <select
              v-model="editableFee.term"
              class="w-full border rounded px-2 py-1"
            >
              <option
                v-for="term in terms"
                :key="term.id"
                :value="term.id"
              >
                {{ term.name }}
              </option>
            </select>
        </div>
        <p v-else class="text-lg font-medium">{{ fee.term_name}}</p>
      </div>

     
      <div>
        <p class="text-xs text-gray-500">Academic Year</p>
        <div v-if="editing">
          <input type="number" v-model.number="editableFee.year" class="w-full border rounded px-2 py-1" />
        </div>
        <p v-else class="text-lg font-medium">{{ fee.academic_year }}</p>
      </div>

    
      <div>
        <p class="text-xs text-gray-500">Total Amount</p>
        <div v-if="editing">
          <input type="number" step="0.01" v-model.number="editableFee.amount" class="w-full border rounded px-2 py-1" />
        </div>
        <p v-else class="text-lg font-semibold text-green-700">{{ formatCurrency(fee.amount) }}</p>
      </div>

     
      <div v-if="editing" class="col-span-2 flex justify-end mt-4">
        <button
          @click="saveChanges"
          class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Save Changes
        </button>
      </div>
    </div>

    <div class="border border-red-200 rounded-lg p-4 bg-red-50">
      <p class="font-medium text-red-700 mb-2">Danger Zone</p>
      <p class="text-sm text-red-600 mb-4">
        Deleting this fee structure is permanent and cannot be undone.
      </p>

      <button
        @click="confirmDelete"
        class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Delete Fee Structure
      </button>
    </div>


    <div v-if="loading" class="text-center text-gray-500">
      Loading fee details...
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFeeById, updateFee, deleteFee } from '../../api/fee'
import { getClassLevels } from '@/api/classes'
import { listTerms } from '../../api/term'
import { useToast } from 'vue-toastification'


const toast=useToast()
const route = useRoute()
const router = useRouter()

const fee = ref(null)
const editableFee = reactive({ class_level: '', term: '', year: null, amount: null })
const loading = ref(false)
const editing = ref(false)

const classLevels = ref([])
const terms = ref([])

const fetchFee = async () => {
  try {
    loading.value = true
    fee.value = await getFeeById(route.params.id)
    Object.assign(editableFee, fee.value)
  } catch (error) {
    console.error('Failed to load fee:', error)
  } finally {
    loading.value = false
  }
}

const loadClassLevels = async () => {
  classLevels.value = await getClassLevels()
}

const loadTerms = async () => {
  terms.value = await listTerms()
}

const toggleEdit = () => {
  editing.value = !editing.value
  if (editing.value) {
    Object.assign(editableFee, fee.value)
  }
}

const saveChanges = async () => {
  try {
    await updateFee(route.params.id, editableFee)
    Object.assign(fee.value, editableFee)
    editing.value = false

    toast.success("Fee structure edited successfully!")
  } catch (error) {
    console.error('Failed to update fee:', error)
    toast.error("Failed to edit the fee structure.")
  }
}

const goBack = () => router.back()

const goToPrint = () => {
  router.push({ name: 'FeePrint', params: { id: route.params.id } })
}

const confirmDelete = async () => {
  if (!confirm('This action is irreversible. Continue?')) return
  try {
    await deleteFee(route.params.id)
    router.push({ name: 'FinanceFeeStructure' })
    toast.success("Fee structure deleted successfully!")
  } catch (error) {
    toast.error("Error deleting the fee structure!")
    console.error('Failed to delete fee:', error)
  }
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount)

onMounted(async () => {
  await loadClassLevels()
  await loadTerms()
  await fetchFee()
})
</script>
