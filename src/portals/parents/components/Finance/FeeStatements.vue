
<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">Finance Statement</h1>

    
    <div v-if="studentsLoading" class="text-gray-500">Loading students...</div>

    <div v-else-if="students.length > 1" class="flex items-center gap-3">
      <label class="font-medium">Select student:</label>
      <select v-model="selectedStudentId" @change="onStudentChange" class="border px-3 py-1 rounded">
        <option value="" disabled>Select a student</option>
        <option v-for="s in students" :key="s.id" :value="s.id">{{ s.full_name }}</option>
      </select>
    </div>

    <div v-else-if="students.length === 1" class="text-gray-700">
      <span class="font-medium">Student:</span>
      <span class="ml-2">{{ students[0].full_name }}</span>
    </div>

    
    <div v-if="loading" class="text-gray-500 py-10 text-center">
      Loading finance statement...
    </div>

    
    <div v-if="error" class="text-red-600 font-semibold text-center py-4">
      {{ error }}
    </div>

    
    <div v-if="data" class="bg-white p-4 rounded-xl shadow border">
      <h2 class="text-lg font-semibold text-gray-700 mb-3">Student Details</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
        <p><span class="font-medium">Name:</span> {{ data.student.full_name }}</p>
        <p><span class="font-medium">Admission No:</span> {{ data.student.admission_number }}</p>
        <p><span class="font-medium">Class:</span> {{ data.student.current_class_level }}</p>
        <p><span class="font-medium">Stream:</span> {{ data.student.current_stream }}</p>
      </div>
    </div>

    
    <div v-if="invoices.length" class="space-y-4">
      <div v-for="invoice in invoices" :key="invoice.id" class="bg-gray-50 p-4 rounded-xl shadow border">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">
          Invoice #{{ invoice.id }} — Amount Due: KES {{ formatAmount(invoice.amount_due) }} — Paid: KES {{ formatAmount(invoice.amount_paid) }}
        </h3>

        
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-200">
              <th class="border px-2 py-1 text-left">Date</th>
              <th class="border px-2 py-1 text-left">Amount</th>
              <th class="border px-2 py-1 text-left">Method</th>
              <th class="border px-2 py-1 text-left">Transaction Code</th>
              <th class="border px-2 py-1 text-left">Received By</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in invoice.payments" :key="payment.id">
              <td class="border px-2 py-1">{{ payment.date }}</td>
              <td class="border px-2 py-1">{{ formatAmount(payment.amount) }}</td>
              <td class="border px-2 py-1">{{ payment.method_display }}</td>
              <td class="border px-2 py-1">{{ payment.transaction_code || "-" }}</td>
              <td class="border px-2 py-1">{{ payment.received_by }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    
    <div v-else-if="data && !invoices.length" class="text-yellow-600 text-center py-6">
      No invoices found for this student.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getStudentFinanceDetails, getPayments } from "../../api/Finance";
import { getStudent } from "../../api/Students";


const students = ref([]);
const studentsLoading = ref(true);
const selectedStudentId = ref(null);
const data = ref(null);
const invoices = ref([]);
const loading = ref(false);
const error = ref(null);


const formatAmount = (amount) => Number(amount).toLocaleString("en-KE");


const fetchInvoicePayments = async (invoice) => {
  const detailedPayments = [];
  for (const payment of invoice.payments) {
    try {
      const res = await getPayments(payment.id);
      detailedPayments.push(res.data);
    } catch (err) {
      console.error("Failed to fetch payment:", err);
    }
  }
  return detailedPayments;
};


const fetchFinanceStatement = async (studentId) => {
  if (!studentId) return;
  loading.value = true;
  error.value = null;

  try {
    const res = await getStudentFinanceDetails(studentId);
    data.value = res.data;

    
    const invoicesWithPayments = [];
    for (const invoice of res.data.invoices) {
      const payments = await fetchInvoicePayments(invoice);
      invoicesWithPayments.push({ ...invoice, payments });
    }
    invoices.value = invoicesWithPayments;

  } catch (err) {
    console.error(err);
    error.value = "Failed to load finance statement.";
  } finally {
    loading.value = false;
  }
};


const onStudentChange = async () => {
  if (!selectedStudentId.value) return;
  await fetchFinanceStatement(selectedStudentId.value);
};


onMounted(async () => {
  studentsLoading.value = true;
  try {
    const res = await getStudent();
    students.value = res;

    if (!students.value.length) {
      error.value = "No students found.";
      return;
    }

    
    selectedStudentId.value = students.value[0].id;
    await fetchFinanceStatement(selectedStudentId.value);

  } catch (err) {
    console.error(err);
    error.value = "Failed to load students.";
  } finally {
    studentsLoading.value = false;
  }
});
</script>

<style scoped></style>
