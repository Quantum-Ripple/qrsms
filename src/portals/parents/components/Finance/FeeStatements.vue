
<template>
  <div class="w-full max-w-full overflow-x-hidden p-4 sm:p-5 md:p-6 space-y-5 md:space-y-6">
    <h1 class="text-xl sm:text-2xl font-bold text-gray-800">
      Finance Statement
    </h1>

    <!-- STUDENT / TERM SELECTION -->
    <div v-if="studentsLoading" class="text-gray-500">
      Loading students...
    </div>

    <div
      v-else
      class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4"
    >
      <!-- Multiple students -->
      <div
        v-if="students.length > 1"
        class="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
      >
        <label class="font-medium text-gray-700">
          Select student:
        </label>

        <select
          v-model="selectedStudentId"
          @change="onStudentChange"
          class="w-full sm:w-auto sm:min-w-[220px] border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Select a student</option>

          <option
            v-for="s in students"
            :key="s.id"
            :value="s.id"
          >
            {{ s.full_name }}
          </option>
        </select>
      </div>

      <!-- One student -->
      <div
        v-else-if="students.length === 1"
        class="flex flex-wrap items-center gap-1 text-gray-700"
      >
        <span class="font-medium">Student:</span>
        <span>{{ students[0].full_name }}</span>
      </div>

      <!-- Term -->
      <div
        v-if="terms.length"
        class="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
      >
        <label class="font-medium text-gray-700">
          Term:
        </label>

        <select
          v-model="selectedTerm"
          class="w-full sm:w-auto sm:min-w-[220px] border border-gray-300 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
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

    <!-- LOADING -->
    <div
      v-if="loading"
      class="text-gray-500 py-10 text-center"
    >
      Loading finance statement...
    </div>

    <!-- ERROR -->
    <div
      v-if="error"
      class="text-red-600 font-semibold text-center py-4"
    >
      {{ error }}
    </div>

    <!-- STUDENT DETAILS -->
    <div
      v-if="data"
      class="bg-white p-4 sm:p-5 rounded-xl shadow border border-gray-200"
    >
      <h2 class="text-base sm:text-lg font-semibold text-gray-700 mb-4">
        Student Details
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-gray-800">
        <p class="break-words">
          <span class="font-medium">Name:</span>
          {{ data.student.full_name }}
        </p>

        <p class="break-words">
          <span class="font-medium">Admission No:</span>
          {{ data.student.admission_number }}
        </p>

        <p class="break-words">
          <span class="font-medium">Class:</span>
          {{ data.student.current_class_level }}
        </p>

        <p class="break-words">
          <span class="font-medium">Stream:</span>
          {{ data.student.current_stream }}
        </p>
      </div>
    </div>

    <!-- SCHOOL FEE INVOICES -->
    <div
      v-if="data && data.invoices.length"
      class="space-y-4"
    >
      <h2 class="text-base sm:text-lg font-semibold text-gray-700">
        School Fee Invoices
      </h2>

      <div
        v-for="invoice in data.invoices"
        :key="invoice.id"
        class="w-full max-w-full bg-gray-50 p-3 sm:p-4 rounded-xl shadow border border-gray-200"
      >
        <!-- Invoice summary -->
        <div class="mb-4">
          <h3 class="text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-3">
            Invoice #{{ invoice.id }}
          </h3>

          <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2">
            <div class="bg-white rounded-lg border p-3">
              <p class="text-xs text-gray-500 mb-1">
                Amount Due
              </p>

              <p class="font-semibold text-gray-800 break-words">
                KES {{ formatAmount(invoice.amount_due) }}
              </p>
            </div>

            <div class="bg-white rounded-lg border p-3">
              <p class="text-xs text-gray-500 mb-1">
                Amount Paid
              </p>

              <p class="font-semibold text-gray-800 break-words">
                KES {{ formatAmount(invoice.amount_paid) }}
              </p>
            </div>
          </div>
        </div>

        <!-- DESKTOP TABLE -->
        <div class="hidden md:block w-full">
          <table class="w-full border-collapse table-fixed">
            <thead>
              <tr class="bg-gray-200">
                <th class="border px-2 py-2 text-left text-sm">
                  Date
                </th>

                <th class="border px-2 py-2 text-left text-sm">
                  Amount
                </th>

                <th class="border px-2 py-2 text-left text-sm">
                  Method
                </th>

                <th class="border px-2 py-2 text-left text-sm break-words">
                  Transaction Code
                </th>

                <th class="border px-2 py-2 text-left text-sm">
                  Received By
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="payment in invoice.payments"
                :key="payment.id"
              >
                <td class="border px-2 py-2 text-sm break-words">
                  {{ payment.date }}
                </td>

                <td class="border px-2 py-2 text-sm break-words">
                  {{ formatAmount(payment.amount) }}
                </td>

                <td class="border px-2 py-2 text-sm break-words">
                  {{ payment.method_display }}
                </td>

                <td class="border px-2 py-2 text-sm break-all">
                  {{ payment.transaction_code || "-" }}
                </td>

                <td class="border px-2 py-2 text-sm break-words">
                  {{ payment.received_by }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- MOBILE PAYMENT CARDS -->
        <div class="md:hidden space-y-3">
          <div
            v-for="payment in invoice.payments"
            :key="payment.id"
            class="bg-white rounded-lg border border-gray-200 p-3"
          >
            <div class="grid grid-cols-2 gap-x-3 gap-y-3">

              <div class="min-w-0">
                <p class="text-xs text-gray-500">
                  Date
                </p>

                <p class="text-sm font-medium text-gray-800 break-words">
                  {{ payment.date }}
                </p>
              </div>

              <div class="min-w-0">
                <p class="text-xs text-gray-500">
                  Amount
                </p>

                <p class="text-sm font-medium text-gray-800 break-words">
                  KES {{ formatAmount(payment.amount) }}
                </p>
              </div>

              <div class="min-w-0">
                <p class="text-xs text-gray-500">
                  Method
                </p>

                <p class="text-sm font-medium text-gray-800 break-words">
                  {{ payment.method_display }}
                </p>
              </div>

              <div class="min-w-0">
                <p class="text-xs text-gray-500">
                  Received By
                </p>

                <p class="text-sm font-medium text-gray-800 break-words">
                  {{ payment.received_by }}
                </p>
              </div>

              <div class="col-span-2 min-w-0">
                <p class="text-xs text-gray-500">
                  Transaction Code
                </p>

                <p class="text-sm font-medium text-gray-800 break-all">
                  {{ payment.transaction_code || "-" }}
                </p>
              </div>

            </div>
          </div>

          <div
            v-if="!invoice.payments.length"
            class="text-sm text-gray-500 text-center py-3"
          >
            No payments recorded.
          </div>
        </div>
      </div>
    </div>

    <!-- TRANSPORT INVOICES -->
    <div
      v-if="data && data.transport_invoices.length"
      class="space-y-4"
    >
      <h2 class="text-base sm:text-lg font-semibold text-gray-700">
        Transport Invoices
      </h2>

      <div
        v-for="invoice in data.transport_invoices"
        :key="invoice.id"
        class="w-full max-w-full bg-gray-50 p-3 sm:p-4 rounded-xl shadow border border-gray-200"
      >
        <!-- Transport invoice summary -->
        <div class="mb-4">
          <h3 class="text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-3 break-words">
            {{ invoice.route_name_snapshot }}
            ({{ formatTripType(invoice.trip_type_snapshot) }})
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="bg-white rounded-lg border p-3">
              <p class="text-xs text-gray-500 mb-1">
                Amount Due
              </p>

              <p class="font-semibold text-gray-800 break-words">
                KES {{ formatAmount(invoice.amount_due) }}
              </p>
            </div>

            <div class="bg-white rounded-lg border p-3">
              <p class="text-xs text-gray-500 mb-1">
                Amount Paid
              </p>

              <p class="font-semibold text-gray-800 break-words">
                KES {{ formatAmount(invoice.amount_paid) }}
              </p>
            </div>
          </div>
        </div>

        <!-- DESKTOP TABLE -->
        <div class="hidden md:block w-full">
          <table class="w-full border-collapse table-fixed">
            <thead>
              <tr class="bg-gray-200">
                <th class="border px-2 py-2 text-left text-sm">
                  Date
                </th>

                <th class="border px-2 py-2 text-left text-sm">
                  Amount
                </th>

                <th class="border px-2 py-2 text-left text-sm">
                  Method
                </th>

                <th class="border px-2 py-2 text-left text-sm">
                  Transaction Code
                </th>

                <th class="border px-2 py-2 text-left text-sm">
                  Received By
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="payment in invoice.payments"
                :key="payment.id"
              >
                <td class="border px-2 py-2 text-sm break-words">
                  {{ payment.date }}
                </td>

                <td class="border px-2 py-2 text-sm break-words">
                  {{ formatAmount(payment.amount) }}
                </td>

                <td class="border px-2 py-2 text-sm break-words">
                  {{ payment.method_display }}
                </td>

                <td class="border px-2 py-2 text-sm break-all">
                  {{ payment.transaction_code || "-" }}
                </td>

                <td class="border px-2 py-2 text-sm break-words">
                  {{ payment.received_by }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- MOBILE PAYMENT CARDS -->
        <div class="md:hidden space-y-3">
          <div
            v-for="payment in invoice.payments"
            :key="payment.id"
            class="bg-white rounded-lg border border-gray-200 p-3"
          >
            <div class="grid grid-cols-2 gap-x-3 gap-y-3">

              <div class="min-w-0">
                <p class="text-xs text-gray-500">
                  Date
                </p>

                <p class="text-sm font-medium text-gray-800 break-words">
                  {{ payment.date }}
                </p>
              </div>

              <div class="min-w-0">
                <p class="text-xs text-gray-500">
                  Amount
                </p>

                <p class="text-sm font-medium text-gray-800 break-words">
                  KES {{ formatAmount(payment.amount) }}
                </p>
              </div>

              <div class="min-w-0">
                <p class="text-xs text-gray-500">
                  Method
                </p>

                <p class="text-sm font-medium text-gray-800 break-words">
                  {{ payment.method_display }}
                </p>
              </div>

              <div class="min-w-0">
                <p class="text-xs text-gray-500">
                  Received By
                </p>

                <p class="text-sm font-medium text-gray-800 break-words">
                  {{ payment.received_by }}
                </p>
              </div>

              <div class="col-span-2 min-w-0">
                <p class="text-xs text-gray-500">
                  Transaction Code
                </p>

                <p class="text-sm font-medium text-gray-800 break-all">
                  {{ payment.transaction_code || "-" }}
                </p>
              </div>

            </div>
          </div>

          <div
            v-if="!invoice.payments.length"
            class="text-sm text-gray-500 text-center py-3"
          >
            No payments recorded.
          </div>
        </div>
      </div>
    </div>

    <!-- NO INVOICES -->
    <div
      v-if="data && !data.invoices.length && !data.transport_invoices.length"
      class="text-yellow-600 text-center py-6 px-3"
    >
      No invoices found for this student.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { getStudentFinanceDetails } from "../../api/Finance";
import { getStudent } from "../../api/Students";
import { fetchTerms } from "../../api/terms.js";

const students = ref([]);
const studentsLoading = ref(true);
const selectedStudentId = ref(null);
const data = ref(null);
const loading = ref(false);
const error = ref(null);

const terms = ref([]);
const selectedTerm = ref('');
let syncingTerm = false;

const formatAmount = (amount) =>
  Number(amount).toLocaleString("en-KE");

const formatTripType = (type) => {
  if (type === "ROUND_TRIP") return "Round Trip";
  if (type === "ONE_WAY") return "One Way";
  return type || "—";
};

const loadTerms = async () => {
  try {
    const response = await fetchTerms();
    terms.value = Array.isArray(response)
      ? response
      : response?.results || [];
  } catch (err) {
    console.error('Failed loading terms:', err);
  }
};

const fetchFinanceStatement = async (studentId) => {
  if (!studentId) return;

  loading.value = true;
  error.value = null;

  try {
    // PaymentListSerializer now includes `received_by`, so the nested
    // payments on each invoice already carry everything this page needs —
    // no more per-payment detail fetch loop.
    const res = await getStudentFinanceDetails(
      studentId,
      selectedTerm.value || undefined
    );

    data.value = res.data;

    if (!selectedTerm.value && data.value?.term?.id) {
      syncingTerm = true;
      selectedTerm.value = String(data.value.term.id);
    }

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

watch(selectedTerm, (newVal, oldVal) => {
  if (syncingTerm) {
    syncingTerm = false;
    return;
  }

  if (newVal && newVal !== oldVal) {
    fetchFinanceStatement(selectedStudentId.value);
  }
});

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

    await Promise.all([
      loadTerms(),
      fetchFinanceStatement(selectedStudentId.value)
    ]);

  } catch (err) {
    console.error(err);
    error.value = "Failed to load students.";
  } finally {
    studentsLoading.value = false;
  }
});
</script>

<style scoped></style>

