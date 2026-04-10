<template>
  <div class="p-4 md:p-6">
   
    

  
    <div class="flex flex-wrap gap-4 mb-4 items-center justify-between">
      <div class="flex flex-wrap gap-2 md:gap-4">
      <select v-model="filters.category" class="border p-2 rounded">
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>

      <input type="date" v-model="filters.date" class="border p-2 rounded" />
      <input type="number" v-model="filters.amount" placeholder="Amount" class="border p-2 rounded" />

      </div>
      <button
        @click="openAddModal"
        class="bg-blue-600 text-white px-3 md:px-4 py-1 md:py-2 rounded hover:bg-blue-700 text-sm md:text-base"
      >
        Add New Expenditure
      </button>
    </div>

    
    <div class="hidden md:block overflow-x-auto bg-white rounded shadow">
      <table class="min-w-full">
        <thead class="bg-gray-100 text-left">
          <tr>
            <th class="p-3">Category</th>
            <th class="p-3">Amount</th>
            <th class="p-3">Date</th>
            <th class="p-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="expense in filteredExpenses"
            :key="expense.id"
            class="border-t hover:bg-gray-50"
          >
            <td class="p-3">{{ expense.expense_category }}</td>
            <td class="p-3">{{ expense.amount }}</td>
            <td class="p-3">{{ expense.date }}</td>
            <td class="p-3 text-right">
              <button
                @click="viewExpense(expense.id)"
                class="text-blue-600 hover:underline"
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  
    <div class="md:hidden space-y-4">
      <div
        v-for="expense in filteredExpenses"
        :key="expense.id"
        class="border rounded p-4 shadow-sm bg-white"
      >
        <div class="flex justify-between">
          <div class="font-semibold">{{ expense.expense_category }}</div>
          <div class="text-sm text-gray-600">{{ expense.date }}</div>
        </div>

        <div class="mt-2 text-sm">
          <div><span class="font-medium">Amount:</span> {{ expense.amount }}</div>
        </div>

        <button
          @click="viewExpense(expense.id)"
          class="mt-3 w-full bg-blue-600 text-white py-2 rounded"
        >
          View
        </button>
      </div>
    </div>

        <ExpenseModal
        v-if="showExpenseModal"
          :expense="editingExpense"
          @close="showExpenseModal = false"
          @refresh="refreshExpenses"
        />
      </div>
   
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getExpense } from '../api/expense.js'
import ExpenseModal from '../components/Expenses/ExpenseModal.vue'
import { useQuery } from '@tanstack/vue-query'
import { useToast } from 'vue-toastification'


const toast=useToast()
const router = useRouter()


const expenses = ref([])
const filters = ref({ category: '', date: '', amount: '' })
const categories = ['Utilities', 'Salary', 'Maintenance', 'Miscellaneous']


const showExpenseModal = ref(false)
const editingExpense = ref({})
/*
const {data: expenses,isLoading,isError}=useQuery({
  queryKey: ['expenses'],
  queryFn: getExpense(),
  staleTime: 1000*60*5
})
*/
const fetchExpenses = async () => {
  try {
    const data = await getExpense()
    expenses.value = data.sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (err) {
    console.error(err)
  }
}


const filteredExpenses = computed(() => {
  return expenses.value.filter(exp => {
    const matchesCategory = filters.value.category
      ? exp.expense_category === filters.value.category
      : true
    const matchesDate = filters.value.date ? exp.date === filters.value.date : true
    const matchesAmount = filters.value.amount
      ? Number(exp.amount) === Number(filters.value.amount)
      : true
    return matchesCategory && matchesDate && matchesAmount
  })
})


const openAddModal = () => {
  editingExpense.value = {}
  showExpenseModal.value = true
}

const viewExpense = (id) => {
  router.push({ name: 'ExpenseDetails', params: { id } })
}

const refreshExpenses = () => fetchExpenses()

const applyFilters = () => {}
onMounted(fetchExpenses)
</script>

<style scoped>

</style>
