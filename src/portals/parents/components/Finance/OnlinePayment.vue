
<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6">
    <h1 class="text-3xl font-bold text-gray-800">
      Pay School Fees
    </h1>

    <!-- Student Selection -->
    <div class="bg-white rounded-xl shadow border p-6 space-y-4">
      <h2 class="text-xl font-semibold text-gray-700">
        Select Student
      </h2>

      <div v-if="studentsLoading" class="text-gray-500">
        Loading students...
      </div>

      <div v-else-if="students.length === 0" class="text-yellow-600">
        No students found for this parent.
      </div>

      <select
        v-else
        v-model="selectedStudentId"
        @change="onStudentChange"
        class="w-full border rounded-lg px-4 py-3"
      >
        <option value="" disabled>
          Select a student
        </option>

        <option
          v-for="student in students"
          :key="student.id"
          :value="student.id"
        >
          {{ student.full_name }}
        </option>
      </select>
    </div>

    <!-- Invoice Selection -->
    <div
      v-if="selectedStudentId"
      class="bg-white rounded-xl shadow border p-6 space-y-4"
    >
      <h2 class="text-xl font-semibold text-gray-700">
        Payment Details
      </h2>

      <div v-if="financeLoading" class="text-gray-500">
        Loading outstanding invoices...
      </div>

      <div v-else-if="invoices.length === 0" class="text-yellow-600">
        This student has no outstanding invoices.
      </div>

      <template v-else>
        <div>
          <label class="block font-medium text-gray-700 mb-2">
            Invoice
          </label>

          <select
            v-model="selectedInvoiceId"
            class="w-full border rounded-lg px-4 py-3"
          >
            <option value="" disabled>
              Select invoice
            </option>

            <option
              v-for="invoice in invoices"
              :key="invoice.id"
              :value="invoice.id"
            >
              Invoice #{{ invoice.id }}
              — Balance: KES {{ formatAmount(invoice.balance) }}
            </option>
          </select>
        </div>

        <!-- Invoice Summary -->
        <div
          v-if="selectedInvoice"
          class="bg-gray-50 rounded-lg p-4 space-y-2"
        >
          <p>
            <span class="font-medium">Amount Due:</span>
            KES {{ formatAmount(selectedInvoice.amount_due) }}
          </p>

          <p>
            <span class="font-medium">Amount Paid:</span>
            KES {{ formatAmount(selectedInvoice.amount_paid) }}
          </p>

          <p>
            <span class="font-medium">Outstanding Balance:</span>
            KES {{ formatAmount(invoiceBalance) }}
          </p>
        </div>

        <!-- Phone Number -->
        <div>
          <label class="block font-medium text-gray-700 mb-2">
            M-Pesa Phone Number
          </label>

          <input
            v-model.trim="phoneNumber"
            type="tel"
            inputmode="numeric"
            placeholder="254712345678"
            class="w-full border rounded-lg px-4 py-3"
          />

          <p class="text-sm text-gray-500 mt-1">
            Enter the phone number that will receive the M-Pesa prompt.
          </p>
        </div>

        <!-- Amount -->
        <div>
          <label class="block font-medium text-gray-700 mb-2">
            Amount to Pay
          </label>

          <input
            v-model="amount"
            type="number"
            min="1"
            step="0.01"
            :max="invoiceBalance"
            placeholder="Enter amount"
            class="w-full border rounded-lg px-4 py-3"
          />

          <p
            v-if="selectedInvoice"
            class="text-sm text-gray-500 mt-1"
          >
            Maximum payment: KES {{ formatAmount(invoiceBalance) }}
          </p>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4"
        >
          {{ error }}
        </div>

        <!-- Success -->
        <div
          v-if="successMessage"
          class="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4"
        >
          <p class="font-semibold">
            Payment request sent.
          </p>

          <p class="mt-1">
            Check the phone and enter your M-Pesa PIN to complete
            the payment.
          </p>

          <p
            v-if="transactionId"
            class="text-sm mt-2"
          >
            Transaction ID: {{ transactionId }}
          </p>
        </div>

        <!-- Submit -->
        <button
          type="button"
          @click="submitPayment"
          :disabled="submitting || !canSubmit"
          class="w-full bg-green-600 text-white font-semibold py-3 rounded-lg
                 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="submitting">
            Sending M-Pesa Request...
          </span>

          <span v-else>
            Pay with M-Pesa
          </span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getStudent } from "../../api/Students";
import {
  getStudentFinanceDetails,
  initiateMpesaSTKPush,
} from "../../api/Finance";

const students = ref([]);
const studentsLoading = ref(true);

const selectedStudentId = ref("");
const selectedInvoiceId = ref("");

const invoices = ref([]);
const financeLoading = ref(false);

const phoneNumber = ref("");
const amount = ref("");

const submitting = ref(false);
const error = ref(null);
const successMessage = ref(null);
const transactionId = ref(null);

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString("en-KE");
};

const selectedInvoice = computed(() => {
  return invoices.value.find(
    (invoice) => String(invoice.id) === String(selectedInvoiceId.value)
  );
});

const invoiceBalance = computed(() => {
  if (!selectedInvoice.value) {
    return 0;
  }

  if (selectedInvoice.value.balance !== undefined) {
    return Number(selectedInvoice.value.balance);
  }

  return (
    Number(selectedInvoice.value.amount_due || 0) -
    Number(selectedInvoice.value.amount_paid || 0)
  );
});

const canSubmit = computed(() => {
  const paymentAmount = Number(amount.value);

  return (
    selectedStudentId.value &&
    selectedInvoiceId.value &&
    phoneNumber.value &&
    paymentAmount > 0 &&
    paymentAmount <= invoiceBalance.value
  );
});

const loadStudentFinance = async (studentId) => {
  if (!studentId) return;

  financeLoading.value = true;
  error.value = null;
  successMessage.value = null;
  transactionId.value = null;
  selectedInvoiceId.value = "";
  amount.value = "";

  try {
    const response = await getStudentFinanceDetails(studentId);

    const studentInvoices = response.data.invoices || [];

    invoices.value = studentInvoices.filter((invoice) => {
      const balance =
        invoice.balance !== undefined
          ? Number(invoice.balance)
          : Number(invoice.amount_due || 0) -
            Number(invoice.amount_paid || 0);

      return balance > 0 && !invoice.is_fully_paid;
    });
  } catch (err) {
    console.error(err);

    invoices.value = [];
    error.value = "Failed to load student finance details.";
  } finally {
    financeLoading.value = false;
  }
};

const onStudentChange = async () => {
  await loadStudentFinance(selectedStudentId.value);
};

const submitPayment = async () => {
  error.value = null;
  successMessage.value = null;
  transactionId.value = null;

  if (!selectedInvoice.value) {
    error.value = "Please select an invoice.";
    return;
  }

  const paymentAmount = Number(amount.value);

  if (!paymentAmount || paymentAmount <= 0) {
    error.value = "Enter a valid payment amount.";
    return;
  }

  if (paymentAmount > invoiceBalance.value) {
    error.value =
      "Payment amount cannot exceed the outstanding invoice balance.";
    return;
  }

  if (!phoneNumber.value) {
    error.value = "Enter an M-Pesa phone number.";
    return;
  }

  submitting.value = true;


  try {
    const response = await initiateMpesaSTKPush({
      student: selectedStudentId.value,
      invoice: selectedInvoiceId.value,
      amount: paymentAmount,
      phone_number: phoneNumber.value,
    });

    successMessage.value =
      response.data.message ||
      "M-Pesa payment request sent successfully.";

    transactionId.value = response.data.transaction_id || null;

    amount.value = "";
  } catch (err) {
    console.error(err);

    if (err.response?.data?.detail) {
      error.value = err.response.data.detail;
    } else {
      error.value =
        "Unable to initiate the M-Pesa payment. Please try again.";
    }
  } finally {
    submitting.value = false;
  }
};
onMounted(async () => {
  studentsLoading.value = true;
  error.value = null;

  try {
    const response = await getStudent();

    students.value = response;

    if (!students.value.length) {
      error.value = "No students found for this parent.";
      return;
    }

    // Automatically select the first student.
    selectedStudentId.value = students.value[0].id;

    await loadStudentFinance(selectedStudentId.value);
  } catch (err) {
    console.error(err);
    error.value = "Failed to load students.";
  } finally {
    studentsLoading.value = false;
  }
});
</script>

<style scoped>
</style>
