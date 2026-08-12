
<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">Fee Structure</h1>

    
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

    
    <div v-if="loading" class="text-gray-500 py-10 text-center">
      Loading fee structure...
    </div>

    
    <div v-if="error" class="text-red-600 font-semibold text-center py-4">
      {{ error }}
    </div>

    
    <div v-if="feeStructure" class="bg-white p-4 rounded-xl shadow border">
      <h2 class="text-lg font-semibold text-gray-700 mb-3">
        {{ feeStructure.class_level_name }} - {{ feeStructure.term_name }} {{ feeStructure.year }}
      </h2>
      <p class="text-gray-800">
        <span class="font-medium">School:</span> {{ feeStructure.school_name }}
      </p>
      <p class="text-gray-800">
        <span class="font-medium">Amount:</span> KES {{ formatAmount(feeStructure.amount) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getStudent } from "../../api/Students";
import { getStudentFinanceDetails, getFeeStructures } from "../../api/Finance";


const students = ref([]);
const studentsLoading = ref(true);
const selectedStudentId = ref('');
const feeStructure = ref(null);
const loading = ref(false);
const error = ref(null);

const formatAmount = (amount) => Number(amount).toLocaleString("en-KE");


const fetchFeeStructure = async (studentId) => {
  if (!studentId) return;

  loading.value = true;
  error.value = null;
  feeStructure.value = null;

  try {
    
    const financeRes = await getStudentFinanceDetails(studentId);
    const invoices = financeRes.data.invoices;

    if (!invoices.length) {
      error.value = "No invoices found for this student.";
      return;
    }

    
    const feeStructureId = invoices[0].fee_structure;

    
    const feeRes = await getFeeStructures(feeStructureId);
    feeStructure.value = feeRes.data;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load fee structure.";
  } finally {
    loading.value = false;
  }
};


const onStudentChange = async () => {
  if (!selectedStudentId.value) return;
  await fetchFeeStructure(selectedStudentId.value);
};


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
    await fetchFeeStructure(selectedStudentId.value);

  } catch (err) {
    console.error(err);
    error.value = "Failed to load students.";
  } finally {
    studentsLoading.value = false;
  }
});
</script>

<style scoped></style>
