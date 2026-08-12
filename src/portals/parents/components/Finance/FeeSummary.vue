
<template>
  <div class="p-6 space-y-6">
    
    <h1 class="text-2xl font-bold text-gray-800">Student Fee Overview</h1>

    
    <div class="mb-4">
      
      <div v-if="studentsLoading" class="text-gray-500">Loading students...</div>

      
      <div v-else-if="students.length === 0" class="text-yellow-600">
        No students found for this parent.
      </div>

      
      <div v-else-if="students.length > 1" class="flex items-center gap-3">
        <label class="font-medium">Select student:</label>
        <select v-model="selectedStudentId" @change="onStudentChange" class="border px-3 py-1 rounded">
          <option value="" disabled>Select a student</option>
          <option v-for="s in students" :key="s.id" :value="s.id">
            {{ s.full_name }}
          </option>
        </select>
      </div>

      
      <div v-else class="text-gray-700">
        <span class="font-medium">Student:</span>
        <span class="ml-2">{{ students[0].full_name }}</span>
      </div>
    </div>

    
    <div v-if="loading" class="text-center py-10 text-gray-500">
      Loading fee details...
    </div>

    
    <div v-if="error" class="text-center py-4 text-red-600 font-semibold">
      {{ error }}
    </div>

    
    <div v-if="data" class="space-y-6">
      <div class="bg-white p-4 rounded-xl shadow border">
        <h2 class="text-lg font-semibold text-gray-700 mb-3">Student Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
          <p><span class="font-medium">Name:</span> {{ data.student.full_name }}</p>
          <p><span class="font-medium">Admission No:</span> {{ data.student.admission_number }}</p>
          <p><span class="font-medium">Class:</span> {{ data.student.current_class_level }}</p>
          <p><span class="font-medium">Stream:</span> {{ data.student.current_stream }}</p>
        </div>
      </div>

      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-blue-100 p-4 rounded-xl shadow text-center">
          <p class="text-gray-600">Total Billed</p>
          <p class="text-xl font-bold">{{ formatAmount(data.total_billed) }}</p>
        </div>
        <div class="bg-green-100 p-4 rounded-xl shadow text-center">
          <p class="text-gray-600">Total Paid</p>
          <p class="text-xl font-bold">{{ formatAmount(data.total_paid) }}</p>
        </div>
        <div class="bg-red-100 p-4 rounded-xl shadow text-center">
          <p class="text-gray-600">Balance</p>
          <p class="text-xl font-bold">{{ formatAmount(data.balance) }}</p>
        </div>
        <div v-if="overpayment > 0" class="bg-yellow-100 p-4 rounded-xl shadow text-center">
          <p class="text-gray-600">Overpayment</p>
          <p class="text-xl font-bold">{{ formatAmount(overpayment) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getStudent } from "../../api/Students";  
import { getStudentFinanceDetails } from "../../api/Finance";


const students = ref([]);
const studentsLoading = ref(true);
const selectedStudentId = ref('');
const data = ref(null);
const loading = ref(false);
const error = ref(null);


const fetchFinance = async (studentId) => {
  if (!studentId) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await getStudentFinanceDetails(studentId);
   
    data.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load finance details.";
  } finally {
    loading.value = false;
  }
};


const onStudentChange = async () => {
  if (!selectedStudentId.value) return;
  await fetchFinance(selectedStudentId.value);
};


const overpayment = computed(() => {
  if (!data.value) return 0;
  const bal = parseFloat(data.value.balance);
  return bal < 0 ? Math.abs(bal) : 0;
});


const formatAmount = (amount) => Number(amount).toLocaleString("en-KE");


onMounted(async () => {
  studentsLoading.value = true;
  error.value = null;

  try {
    const res = await getStudent();
    students.value = res;



    if (!students.value.length) {
      error.value = "No students found for this parent.";
      return;
    }

    
    selectedStudentId.value = students.value[0].id;
    await fetchFinance(selectedStudentId.value);

  } catch (err) {
    console.error(err);
    error.value = "Failed to load students.";
  } finally {
    studentsLoading.value = false;
  }
});
</script>

<style scoped></style>
