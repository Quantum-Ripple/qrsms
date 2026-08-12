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
        :disabled="paymentInProgress"
        class="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
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

        <!-- Invoice -->
        <div>
          <label class="block font-medium text-gray-700 mb-2">
            Invoice
          </label>

          <select
            v-model="selectedInvoiceId"
            :disabled="paymentInProgress"
            class="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
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
            :disabled="paymentInProgress"
            class="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
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
            :disabled="paymentInProgress"
            class="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
          />

          <p
            v-if="selectedInvoice"
            class="text-sm text-gray-500 mt-1"
          >
            Maximum payment:
            KES {{ formatAmount(invoiceBalance) }}
          </p>
        </div>

        <!-- ========================= -->
        <!-- PAYMENT PROCESSING STATUS -->
        <!-- ========================= -->

        <div
          v-if="paymentInProgress"
          class="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-5"
        >
          <div class="flex items-start gap-3">

            <div class="mt-1">
              <div
                class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
              ></div>
            </div>

            <div>
              <p class="font-semibold">
                {{ paymentStatusMessage }}
              </p>

              <p class="text-sm mt-2">
                {{ paymentStatusDescription }}
              </p>

              <p class="text-xs text-blue-600 mt-3">
                Please do not close this page while we confirm the payment.
              </p>
            </div>

          </div>
        </div>

        <!-- ========================= -->
        <!-- SUCCESS -->
        <!-- ========================= -->

        <div
          v-if="paymentSuccess"
          class="bg-green-50 border border-green-200 text-green-800 rounded-lg p-5"
        >
          <p class="font-semibold text-lg">
            Payment successful
          </p>

          <p class="mt-2">
            Your M-Pesa payment has been received successfully.
          </p>

          <p
            v-if="paymentReceipt"
            class="mt-2"
          >
            <span class="font-medium">
              M-Pesa Receipt:
            </span>

            {{ paymentReceipt }}
          </p>

          <p
            v-if="transactionId"
            class="text-sm mt-2 text-green-700"
          >
            Transaction ID: {{ transactionId }}
          </p>
        </div>

        <!-- ========================= -->
        <!-- FAILED -->
        <!-- ========================= -->

        <div
          v-if="paymentFailed"
          class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-5"
        >
          <p class="font-semibold text-lg">
            Payment failed
          </p>

          <p class="mt-2">
            {{ paymentErrorMessage }}
          </p>

          <p
            v-if="paymentResultCode"
            class="text-sm mt-2"
          >
            M-Pesa result code:
            {{ paymentResultCode }}
          </p>

          <p class="text-sm mt-3">
            You can correct the details and try again.
          </p>
        </div>

        <!-- ========================= -->
        <!-- GENERAL ERROR -->
        <!-- ========================= -->

        <div
          v-if="error && !paymentFailed"
          class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4"
        >
          {{ error }}
        </div>

        <!-- ========================= -->
        <!-- SUBMIT -->
        <!-- ========================= -->

        <button
          type="button"
          @click="submitPayment"
          :disabled="paymentInProgress || !canSubmit"
          class="w-full bg-green-600 text-white font-semibold py-3 rounded-lg
                 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="submitting">
            Sending M-Pesa Request...
          </span>

          <span v-else-if="paymentInProgress">
            Waiting for Payment...
          </span>

          <span v-else-if="paymentSuccess">
            Payment Completed
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
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
} from "vue";

import { getStudent } from "../../api/Students";

import {
  getStudentFinanceDetails,
  initiateMpesaSTKPush,
  getMpesaTransactionStatus,
} from "../../api/Finance";


/*
|--------------------------------------------------------------------------
| Students
|--------------------------------------------------------------------------
*/

const students = ref([]);
const studentsLoading = ref(true);

const selectedStudentId = ref("");
const selectedInvoiceId = ref("");


/*
|--------------------------------------------------------------------------
| Finance
|--------------------------------------------------------------------------
*/

const invoices = ref([]);
const financeLoading = ref(false);


/*
|--------------------------------------------------------------------------
| Payment form
|--------------------------------------------------------------------------
*/

const phoneNumber = ref("");
const amount = ref("");


/*
|--------------------------------------------------------------------------
| Payment state
|--------------------------------------------------------------------------
*/

const submitting = ref(false);

const paymentInProgress = ref(false);

const paymentSuccess = ref(false);

const paymentFailed = ref(false);

const error = ref(null);

const successMessage = ref(null);

const transactionId = ref(null);

const paymentReceipt = ref(null);

const paymentResultCode = ref(null);

const paymentErrorMessage = ref(null);


/*
|--------------------------------------------------------------------------
| Polling
|--------------------------------------------------------------------------
*/

let pollingTimer = null;

const POLL_INTERVAL = 3000;

const MAX_POLL_ATTEMPTS = 40;

let pollAttempts = 0;


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatAmount = (amount) => {
  return Number(amount || 0).toLocaleString("en-KE");
};


/*
|--------------------------------------------------------------------------
| Selected invoice
|--------------------------------------------------------------------------
*/

const selectedInvoice = computed(() => {
  return invoices.value.find(
    (invoice) =>
      String(invoice.id) === String(selectedInvoiceId.value)
  );
});


/*
|--------------------------------------------------------------------------
| Invoice balance
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Can submit
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Payment status messages
|--------------------------------------------------------------------------
*/

const paymentStatusMessage = computed(() => {
  return "M-Pesa payment request sent.";
});


const paymentStatusDescription = computed(() => {
  return (
    "Check your phone for the M-Pesa prompt and enter your PIN. " +
    "We are waiting for confirmation from M-Pesa."
  );
});


/*
|--------------------------------------------------------------------------
| Load student finance
|--------------------------------------------------------------------------
*/

const loadStudentFinance = async (studentId) => {
  if (!studentId) {
    return;
  }

  financeLoading.value = true;

  error.value = null;

  successMessage.value = null;

  selectedInvoiceId.value = "";

  amount.value = "";

  try {
    const response =
      await getStudentFinanceDetails(studentId);

    const studentInvoices =
      response.data.invoices || [];

    invoices.value = studentInvoices.filter((invoice) => {
      const balance =
        invoice.balance !== undefined
          ? Number(invoice.balance)
          : Number(invoice.amount_due || 0) -
            Number(invoice.amount_paid || 0);

      return (
        balance > 0 &&
        !invoice.is_fully_paid
      );
    });

  } catch (err) {
    console.error(err);

    invoices.value = [];

    error.value =
      "Failed to load student finance details.";

  } finally {
    financeLoading.value = false;
  }
};


/*
|--------------------------------------------------------------------------
| Student changed
|--------------------------------------------------------------------------
*/

const onStudentChange = async () => {
  if (paymentInProgress.value) {
    return;
  }

  await loadStudentFinance(
    selectedStudentId.value
  );
};


/*
|--------------------------------------------------------------------------
| Stop polling
|--------------------------------------------------------------------------
*/

const stopPolling = () => {
  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }

  pollAttempts = 0;
};


/*
|--------------------------------------------------------------------------
| Handle successful payment
|--------------------------------------------------------------------------
*/

const handlePaymentSuccess = async (transaction) => {
  stopPolling();

  paymentInProgress.value = false;

  submitting.value = false;

  paymentSuccess.value = true;

  paymentFailed.value = false;

  paymentReceipt.value =
    transaction.mpesa_receipt_number ||
    transaction.receipt ||
    null;

  paymentResultCode.value =
    transaction.result_code ?? 0;

  successMessage.value =
    "Payment completed successfully.";

  /*
   * Refresh invoice data so the parent immediately
   * sees the updated balance.
   */
  await loadStudentFinance(
    selectedStudentId.value
  );

  /*
   * Clear payment amount after successful payment.
   */
  amount.value = "";
};


/*
|--------------------------------------------------------------------------
| Handle failed payment
|--------------------------------------------------------------------------
*/

const handlePaymentFailure = (transaction) => {
  stopPolling();

  paymentInProgress.value = false;

  submitting.value = false;

  paymentSuccess.value = false;

  paymentFailed.value = true;

  paymentResultCode.value =
    transaction.result_code ?? null;

  paymentErrorMessage.value =
    transaction.result_description ||
    "The M-Pesa payment was not completed.";

};


/*
|--------------------------------------------------------------------------
| Poll transaction status
|--------------------------------------------------------------------------
*/

const pollTransactionStatus = async () => {
  if (!transactionId.value) {
    return;
  }

  pollAttempts++;

  /*
   * Safety limit.
   *
   * 40 attempts × 3 seconds = approximately
   * 2 minutes of polling.
   */
  if (pollAttempts > MAX_POLL_ATTEMPTS) {
    stopPolling();

    paymentInProgress.value = false;

    submitting.value = false;

    error.value =
      "We are still waiting for M-Pesa confirmation. " +
      "Please check your M-Pesa messages. " +
      "You can refresh the page later to see the updated payment status.";

    return;
  }

  try {
    const response =
      await getMpesaTransactionStatus(
        transactionId.value
      );

    const transaction =
      response.data;

    console.log(
      "M-Pesa transaction status:",
      transaction
    );

    const status =
      String(transaction.status || "")
        .toLowerCase();

    /*
     * SUCCESS
     */

    if (status === "success") {
      await handlePaymentSuccess(
        transaction
      );

      return;
    }

    /*
     * FAILED
     */

    if (
      status === "failed" ||
      status === "reversed"
    ) {
      handlePaymentFailure(
        transaction
      );

      return;
    }

    /*
     * Still waiting.
     */

    pollingTimer = setTimeout(
      pollTransactionStatus,
      POLL_INTERVAL
    );

  } catch (err) {
    console.error(
      "Failed to check M-Pesa transaction status:",
      err
    );

    /*
     * Do NOT immediately mark the payment as failed.
     *
     * A temporary network/API problem is not the same
     * thing as an M-Pesa failure.
     */
    pollingTimer = setTimeout(
      pollTransactionStatus,
      POLL_INTERVAL
    );
  }
};


/*
|--------------------------------------------------------------------------
| Start polling
|--------------------------------------------------------------------------
*/

const startPolling = () => {
  stopPolling();

  pollAttempts = 0;

  pollingTimer = setTimeout(
    pollTransactionStatus,
    POLL_INTERVAL
  );
};


/*
|--------------------------------------------------------------------------
| Submit payment
|--------------------------------------------------------------------------
*/

const submitPayment = async () => {
  /*
   * Reset previous result state.
   */

  error.value = null;

  successMessage.value = null;

  paymentSuccess.value = false;

  paymentFailed.value = false;

  paymentReceipt.value = null;

  paymentResultCode.value = null;

  paymentErrorMessage.value = null;

  transactionId.value = null;


  /*
   * Validate invoice.
   */

  if (!selectedInvoice.value) {
    error.value =
      "Please select an invoice.";

    return;
  }


  /*
   * Validate amount.
   */

  const paymentAmount =
    Number(amount.value);

  if (
    !paymentAmount ||
    paymentAmount <= 0
  ) {
    error.value =
      "Enter a valid payment amount.";

    return;
  }


  /*
   * Prevent overpayment.
   */

  if (
    paymentAmount >
    invoiceBalance.value
  ) {
    error.value =
      "Payment amount cannot exceed the outstanding invoice balance.";

    return;
  }


  /*
   * Validate phone.
   */

  if (!phoneNumber.value) {
    error.value =
      "Enter an M-Pesa phone number.";

    return;
  }


  /*
   * Start request.
   */

  submitting.value = true;

  paymentInProgress.value = true;


  try {

    console.log(
      "STK PAYMENT REQUEST:",
      {
        student: selectedStudentId.value,
        invoice: selectedInvoiceId.value,
        amount: paymentAmount,
        phone_number: phoneNumber.value,
      }
    );


    const response =
      await initiateMpesaSTKPush({
        student: selectedStudentId.value,
        invoice: selectedInvoiceId.value,
        amount: paymentAmount,
        phone_number: phoneNumber.value,
      });


    console.log(
      "STK RESPONSE:",
      response.data
    );


    /*
     * IMPORTANT:
     *
     * A successful STK endpoint response does NOT
     * mean that the payment itself succeeded.
     *
     * It only means Safaricom accepted the STK request.
     */

    transactionId.value =
      response.data.transaction_id ||
      response.data.id ||
      null;


    if (!transactionId.value) {

      paymentInProgress.value = false;

      submitting.value = false;

      error.value =
        "M-Pesa request was sent, but we could not obtain the transaction ID needed to track it.";

      return;
    }


    /*
     * The request was accepted.
     *
     * Now wait for the callback to update our
     * transaction and poll for the final state.
     */

    successMessage.value =
      "M-Pesa payment request sent.";


    submitting.value = false;


    /*
     * Start polling.
     */

    startPolling();

  } catch (err) {

    console.error(
      "M-Pesa STK error:",
      err
    );


    submitting.value = false;

    paymentInProgress.value = false;


    if (err.response?.data?.detail) {

      error.value =
        err.response.data.detail;

    } else {

      error.value =
        "Unable to initiate the M-Pesa payment. Please try again.";

    }
  }
};


/*
|--------------------------------------------------------------------------
| Initial load
|--------------------------------------------------------------------------
*/

onMounted(async () => {

  studentsLoading.value = true;

  error.value = null;

  try {

    const response =
      await getStudent();

    students.value = response;

    if (!students.value.length) {

      error.value =
        "No students found for this parent.";

      return;
    }


    /*
     * Automatically select first student.
     */

    selectedStudentId.value =
      students.value[0].id;


    await loadStudentFinance(
      selectedStudentId.value
    );

  } catch (err) {

    console.error(err);

    error.value =
      "Failed to load students.";

  } finally {

    studentsLoading.value = false;

  }
});


/*
|--------------------------------------------------------------------------
| Cleanup
|--------------------------------------------------------------------------
*/

onUnmounted(() => {
  stopPolling();
});
</script>


<style scoped>
</style>
