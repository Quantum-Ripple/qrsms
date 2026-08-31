<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">Fee Structure</h1>

    
    <div v-if="studentsLoading" class="text-gray-500">Loading students...</div>

    <div v-else-if="students.length === 0" class="text-yellow-600">
      No students found for this parent.
    </div>

    <div v-else class="flex flex-wrap items-center gap-4">
      <div v-if="students.length > 1" class="flex items-center gap-3">
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

      <div v-if="terms.length" class="flex items-center gap-3">
        <label class="font-medium">Term:</label>
        <select v-model="selectedTerm" class="border px-3 py-1 rounded">
          <option
            v-for="term in terms"
            :key="term.id"
            :value="String(term.id)"
          >
            {{ term.name }}, {{ term.academic_year_name }}
          </option>
        </select>
      </div>
    </div>

    
    <div v-if="loading" class="text-gray-500 py-10 text-center">
      Loading fee structure...
    </div>

    
    <div v-if="error" class="text-red-600 font-semibold text-center py-4">
      {{ error }}
    </div>

    <!-- SCHOOL FEE STRUCTURE -->
    <div v-if="feeStructure" class="bg-white p-4 rounded-xl shadow border">
      <h2 class="text-lg font-semibold text-gray-700 mb-3">
        {{ feeStructure.class_level_name }} - {{ feeStructure.term_name }} {{ feeStructure.academic_year }}
      </h2>
      <p class="text-gray-800">
        <span class="font-medium">School:</span> {{ feeStructure.school_name }}
      </p>
      <p class="text-gray-800">
        <span class="font-medium">Amount:</span> KES {{ formatAmount(feeStructure.amount) }}
      </p>
    </div>
    <div v-else-if="studentChecked && !loading && !error" class="text-yellow-600">
      No school fee structure found for this student this term.
    </div>

    <!-- TRANSPORT -->
    <div v-if="transportInvoice" class="bg-white p-4 rounded-xl shadow border">
      <h2 class="text-lg font-semibold text-gray-700 mb-3">
        Transport - {{ transportInvoice.route_name_snapshot }} ({{ formatTripType(transportInvoice.trip_type_snapshot) }})
      </h2>
      <p class="text-gray-800">
        <span class="font-medium">Term:</span> {{ transportInvoice.term_name }}, {{ transportInvoice.academic_year }}
      </p>
      <p class="text-gray-800">
        <span class="font-medium">Amount:</span> KES {{ formatAmount(transportInvoice.amount_due) }}
      </p>
    </div>
    <div v-else-if="studentChecked && !loading && !error" class="text-gray-500">
      No transport assignment billed for this student this term.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { getStudent } from "../../api/Students";
import { getStudentFinanceDetails, getFeeStructures } from "../../api/Finance";
import { fetchTerms } from "../../api/terms.js";


const students = ref([]);
const studentsLoading = ref(true);
const selectedStudentId = ref('');
const feeStructure = ref(null);
const transportInvoice = ref(null);
const loading = ref(false);
const error = ref(null);
const studentChecked = ref(false);

const terms = ref([]);
const selectedTerm = ref('');
let syncingTerm = false;

const formatAmount = (amount) => Number(amount).toLocaleString("en-KE");

const formatTripType = (type) => {
  if (type === "ROUND_TRIP") return "Round Trip";
  if (type === "ONE_WAY") return "One Way";
  return type || "—";
};


const loadTerms = async () => {
  try {
    const response = await fetchTerms();
    terms.value = Array.isArray(response) ? response : response?.results || [];
  } catch (err) {
    console.error('Failed loading terms:', err);
  }
};


const fetchFeeStructure = async (studentId) => {
  if (!studentId) return;

  loading.value = true;
  error.value = null;
  feeStructure.value = null;
  transportInvoice.value = null;
  studentChecked.value = false;

  try {
    
    const financeRes = await getStudentFinanceDetails(studentId, selectedTerm.value || undefined);
    const financeData = financeRes.data;

    if (!selectedTerm.value && financeData?.term?.id) {
      syncingTerm = true;
      selectedTerm.value = String(financeData.term.id);
    }

    const invoices = financeData.invoices;
    if (invoices.length) {
      
      const feeStructureId = invoices[0].fee_structure;

      
      const feeRes = await getFeeStructures(feeStructureId);
      feeStructure.value = feeRes.data;
    }

    const transportInvoices = financeData.transport_invoices;
    if (transportInvoices.length) {
      // TransportInvoice already snapshots route/trip-type/amount at
      // billing time — no separate "transport fee structure" endpoint
      // needed, this invoice IS the pricing record for the term.
      transportInvoice.value = transportInvoices[0];
    }

    studentChecked.value = true;

    if (!invoices.length && !transportInvoices.length) {
      error.value = "No invoices found for this student this term.";
    }
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

watch(selectedTerm, (newVal, oldVal) => {
  if (syncingTerm) {
    syncingTerm = false;
    return;
  }
  if (newVal && newVal !== oldVal) {
    fetchFeeStructure(selectedStudentId.value);
  }
});


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
    await Promise.all([loadTerms(), fetchFeeStructure(selectedStudentId.value)]);

  } catch (err) {
    console.error(err);
    error.value = "Failed to load students.";
  } finally {
    studentsLoading.value = false;
  }
});
</script>

<style scoped></style>