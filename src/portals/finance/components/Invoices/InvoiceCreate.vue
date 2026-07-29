<template>
  <div class="p-6 max-w-lg mx-auto">
    <h1 class="text-2xl font-semibold mb-6">Generate Invoices</h1>

    <form @submit.prevent="submitForm" class="space-y-4">

      <div>
        <label class="block mb-1">Class</label>
        <select v-model="classLevel" class="border rounded px-3 py-2 w-full">
          <option value="">Select Class</option>
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
  <label class="block mb-1">Term</label>
  <select v-model="term" class="border rounded px-3 py-2 w-full">
    <option value="">Select Term</option>
      <option
        v-for="t in terms"
        :key="t.id"
        :value="t.id"
      >
        {{ t.name }}
      </option>
        </select>
</div>


      <div>
        <label class="block mb-1">Fee Structure</label>
        <select v-model="feeStructure" class="border rounded px-3 py-2 w-full">
          <option value="">Select Fee Structure</option>
          <option v-for="f in feeStructures" :key="f.id" :value="f.id">
            {{ f.class_level_name }} - {{ f.term_name }} - {{ f.amount }}
          </option>
        </select>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        {{ loading ? 'Generating...' : 'Generate Invoices' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFees, createBulkInvoices } from '../../api/fee'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getClassLevels } from '@/api/classes'
import { listTerms } from '../../api/term'

const router = useRouter()
const toast=useToast()
const feeStructures = ref([])

const classLevel = ref('')
const feeStructure = ref('')

const loading = ref(false)
const term = ref('')
const classLevels = ref([])
const terms = ref([])


const loadClassLevels = async () => {
  classLevels.value = await getClassLevels()
}

const loadTerms = async () => {
  terms.value = await listTerms()
}

onMounted(async () => {
  await loadClassLevels()
  await loadTerms()
  feeStructures.value = await getFees()
})

const submitForm = async () => {
  if (!classLevel.value || !feeStructure.value) {
    toast.error('Please select class and fee structure')
    return
  }

  const payload = {
    class_level: classLevel.value,
    fee_structure: feeStructure.value,
    term: term.value
  }

  loading.value = true
  try {
    await createBulkInvoices(payload)
    router.push({name: 'FinanceInvoices'})
    toast.success('Invoices generated successfully')
    
  } catch (err) {
    console.error(err)
    //toast.error('Failed to generate invoices')
  } finally {
    loading.value = false
  }
}
</script>
