<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-screen">

    <div class="max-w-7xl mx-auto space-y-6">

      <!-- HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h2 class="text-2xl font-semibold text-gray-800">
            Transport Billing
          </h2>

          
        </div>

        <button
          @click="openGenerateModal"
          class="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Generate Transport Invoices
        </button>

      </div>


      <!-- FILTERS -->
      <div class="bg-white rounded-xl shadow-sm border p-4">

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

          <!-- ACADEMIC YEAR -->
          <div>

            <label class="label">
              Academic Year
            </label>

            <select
              v-model="selectedAcademicYear"
              class="field"
            >

              <option value="">
                All Academic Years
              </option>

              <option
                v-for="year in academicYears"
                :key="year.id"
                :value="String(year.id)"
              >
                {{ year.year }}
              </option>

            </select>

          </div>


          <!-- TERM -->
          <div>

            <label class="label">
              Term
            </label>

            <select
              v-model="selectedTerm"
              class="field"
            >

              <option value="">
                All Terms
              </option>

              <option
                v-for="term in filteredTerms"
                :key="term.id"
                :value="String(term.id)"
              >
                {{ term.name }}
              </option>

            </select>

          </div>


          <!-- STATUS -->
          <div>

            <label class="label">
              Payment Status
            </label>

            <select
              v-model="selectedStatus"
              class="field"
            >

              <option value="">
                All Statuses
              </option>

              <option value="false">
                Pending
              </option>

              <option value="true">
                Paid
              </option>

            </select>

          </div>

        </div>

      </div>


      <!-- LOADING -->
      <div
        v-if="loading"
        class="bg-white rounded-xl shadow-sm border p-10 text-center text-gray-500"
      >
        Loading transport invoices...
      </div>


      <!-- DESKTOP TABLE -->
      <div
        v-else
        class="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden"
      >

        <div class="overflow-x-auto">

          <table class="w-full text-sm">

            <thead class="bg-gray-50 border-b">

              <tr class="text-left text-gray-500">

                <th class="px-4 py-3">
                  Student
                </th>

                <th class="px-4 py-3">
                  Route
                </th>

                <th class="px-4 py-3">
                  Trip Type
                </th>

                <th class="px-4 py-3">
                  Amount Due
                </th>

                <th class="px-4 py-3">
                  Paid
                </th>

                <th class="px-4 py-3">
                  Balance
                </th>

                <th class="px-4 py-3">
                  Status
                </th>

                <th class="px-4 py-3 text-right">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              <tr
                v-for="invoice in invoices"
                :key="invoice.id"
                class="border-b last:border-0 hover:bg-gray-50"
              >

                <td class="px-4 py-4">

                  <div class="font-medium text-gray-800">
                    {{ invoice.student_name }}
                  </div>

                </td>


                <td class="px-4 py-4 text-gray-600">
                  {{ invoice.route_name }}
                </td>


                <td class="px-4 py-4">

                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="
                      invoice.trip_type === 'ROUND_TRIP'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    "
                  >
                    {{ formatTripType(invoice.trip_type) }}
                  </span>

                </td>


                <td class="px-4 py-4 font-medium">
                  KES {{ formatAmount(invoice.amount_due) }}
                </td>


                <td class="px-4 py-4 text-gray-600">
                  KES {{ formatAmount(invoice.amount_paid) }}
                </td>


                <td class="px-4 py-4 font-medium">

                  KES {{ formatAmount(invoice.balance) }}

                </td>


                <td class="px-4 py-4">

                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="
                      invoice.is_fully_paid
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    "
                  >
                    {{ invoice.is_fully_paid ? 'Paid' : 'Pending' }}
                  </span>

                </td>


                <td class="px-4 py-4 text-right">

                  <button
                    v-if="!invoice.is_fully_paid"
                    @click="openPayment(invoice)"
                    class="px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    Record Payment
                  </button>

                  <span
                    v-else
                    class="text-sm text-gray-400"
                  >
                    Paid
                  </span>

                </td>

              </tr>


              <!-- EMPTY -->
              <tr v-if="invoices.length === 0">

                <td
                  colspan="8"
                  class="px-4 py-12 text-center"
                >

                  <div class="text-gray-500">
                    No transport invoices found.
                  </div>


                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>


      <!-- MOBILE CARDS -->
      <div
        v-if="!loading"
        class="md:hidden space-y-3"
      >

        <div
          v-for="invoice in invoices"
          :key="invoice.id"
          class="bg-white rounded-xl shadow-sm border p-4"
        >

          <div class="flex items-start justify-between gap-3">

            <div>

              <div class="font-semibold text-gray-800">
                {{ invoice.student_name }}
              </div>

              <div class="text-sm text-gray-500 mt-1">
                {{ invoice.route_name }}
              </div>

            </div>


            <span
              class="shrink-0 px-2 py-1 rounded-full text-xs font-medium"
              :class="
                invoice.is_fully_paid
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              "
            >
              {{ invoice.is_fully_paid ? 'Paid' : 'Pending' }}
            </span>

          </div>


          <div class="grid grid-cols-2 gap-3 mt-4 text-sm">

            <div>

              <div class="text-gray-400 text-xs">
                Trip Type
              </div>

              <div class="font-medium text-gray-700">
                {{ formatTripType(invoice.trip_type) }}
              </div>

            </div>


            <div>

              <div class="text-gray-400 text-xs">
                Amount Due
              </div>

              <div class="font-medium text-gray-700">
                KES {{ formatAmount(invoice.amount_due) }}
              </div>

            </div>


            <div>

              <div class="text-gray-400 text-xs">
                Paid
              </div>

              <div class="font-medium text-gray-700">
                KES {{ formatAmount(invoice.amount_paid) }}
              </div>

            </div>


            <div>

              <div class="text-gray-400 text-xs">
                Balance
              </div>

              <div class="font-semibold text-gray-800">
                KES {{ formatAmount(invoice.balance) }}
              </div>

            </div>

          </div>


          <button
            v-if="!invoice.is_fully_paid"
            @click="openPayment(invoice)"
            class="w-full mt-4 px-3 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Record Payment
          </button>

        </div>


        <div
          v-if="invoices.length === 0"
          class="bg-white rounded-xl border p-8 text-center text-gray-500"
        >
          No transport invoices found.
        </div>

      </div>


      <!-- GENERATE MODAL -->
      <div
        v-if="showGenerateModal"
        class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      >

        <div
          class="bg-white w-full max-w-md rounded-2xl shadow-xl p-6"
        >

          <div class="flex items-center justify-between mb-5">

            <div>

              <h3 class="text-lg font-semibold text-gray-800">
                Generate Transport Invoices
              </h3>

              <p class="text-sm text-gray-500 mt-1">
                Select the academic year and term to bill.
              </p>

            </div>


            <button
              @click="closeGenerateModal"
              class="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>

          </div>


          <form
            @submit.prevent="generateInvoices"
            class="space-y-5"
          >

            <!-- YEAR -->
            <div>

              <label class="label">
                Academic Year
              </label>

              <select
                v-model="generateForm.academic_year"
                required
                class="field"
              >

                <option value="">
                  Select Academic Year
                </option>

                <option
                  v-for="year in academicYears"
                  :key="year.id"
                  :value="year.id"
                >
                  {{ year.year }}
                </option>

              </select>

            </div>


            <!-- TERM -->
            <div>

              <label class="label">
                Term
              </label>

              <select
                v-model="generateForm.term"
                required
                class="field"
              >

                <option value="">
                  Select Term
                </option>

                <option
                  v-for="term in generateTerms"
                  :key="term.id"
                  :value="term.id"
                >
                  {{ term.name }}
                </option>

              </select>

            </div>


            <div class="bg-blue-50 border border-blue-100 rounded-lg p-3">

              <p class="text-sm text-blue-700">
                Invoices will be generated from each student's
                transport assignment and the configured route price.
              </p>

            </div>


            <div class="flex justify-end gap-3 pt-4 border-t">

              <button
                type="button"
                @click="closeGenerateModal"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>


              <button
                type="submit"
                :disabled="generating"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {{ generating ? 'Generating...' : 'Generate Invoices' }}
              </button>

            </div>

          </form>

        </div>

      </div>


      <!-- PAYMENT MODAL PLACEHOLDER -->
      <div
        v-if="showPaymentModal"
        class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      >

        <div class="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">

          <div class="flex items-center justify-between mb-5">

            <div>

              <h3 class="text-lg font-semibold text-gray-800">
                Record Transport Payment
              </h3>

              <p class="text-sm text-gray-500 mt-1">
                {{ selectedInvoice?.student_name }}
              </p>

            </div>


            <button
              @click="closePayment"
              class="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>

          </div>


          <div class="space-y-3">

            <div class="flex justify-between text-sm">

              <span class="text-gray-500">
                Amount Due
              </span>

              <span class="font-medium">
                KES {{ formatAmount(selectedInvoice?.amount_due) }}
              </span>

            </div>


            <div class="flex justify-between text-sm">

              <span class="text-gray-500">
                Paid
              </span>

              <span class="font-medium">
                KES {{ formatAmount(selectedInvoice?.amount_paid) }}
              </span>

            </div>


            <div class="flex justify-between text-sm border-t pt-3">

              <span class="text-gray-600 font-medium">
                Balance
              </span>

              <span class="font-semibold">
                KES {{ formatAmount(selectedInvoice?.balance) }}
              </span>

            </div>

          </div>


          <div class="mt-5 p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
            The payment action should use the existing shared payment
            system rather than creating a separate transport payment system.
          </div>


          <div class="flex justify-end mt-5">

            <button
              @click="closePayment"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>


<script setup>

import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'

import {
  fetchTransportInvoices,
  generateTransportInvoices,
} from '@/api/transport.js'

import {
  fetchAcademicYears,
  fetchTerms,
} from '../api/term.js'


const toast = useToast()


// --------------------------------------------------
// STATE
// --------------------------------------------------

const invoices = ref([])

const academicYears = ref([])
const terms = ref([])

const selectedAcademicYear = ref('')
const selectedTerm = ref('')
const selectedStatus = ref('')

const loading = ref(false)
const generating = ref(false)

const showGenerateModal = ref(false)

const showPaymentModal = ref(false)
const selectedInvoice = ref(null)


const generateForm = ref({
  academic_year: '',
  term: '',
})


// --------------------------------------------------
// TERMS
// --------------------------------------------------

const filteredTerms = computed(() => {

  if (!selectedAcademicYear.value) {
    return terms.value
  }

  return terms.value.filter(
    term =>
      Number(term.academic_year) ===
      Number(selectedAcademicYear.value)
  )

})


const generateTerms = computed(() => {

  if (!generateForm.value.academic_year) {
    return []
  }

  return terms.value.filter(
    term =>
      Number(term.academic_year) ===
      Number(generateForm.value.academic_year)
  )

})


// --------------------------------------------------
// LOAD ACADEMIC YEARS
// --------------------------------------------------

async function loadAcademicYears() {

  try {

    const response = await fetchAcademicYears()

    academicYears.value = Array.isArray(response)
      ? response
      : response?.results || []

  } catch (error) {

    console.error(
      'Failed loading academic years:',
      error
    )

    toast.error('Failed to load academic years.')

  }

}


// --------------------------------------------------
// LOAD TERMS
// --------------------------------------------------

async function loadTerms() {

  try {

    const response = await fetchTerms()

    terms.value = Array.isArray(response)
      ? response
      : response?.results || []

  } catch (error) {

    console.error(
      'Failed loading terms:',
      error
    )

    toast.error('Failed to load terms.')

  }

}


// --------------------------------------------------
// LOAD INVOICES
// --------------------------------------------------

async function loadInvoices() {

  loading.value = true

  try {

    const params = {}

    if (selectedAcademicYear.value) {
      params.academic_year =
        selectedAcademicYear.value
    }

    if (selectedTerm.value) {
      params.term =
        selectedTerm.value
    }

    if (selectedStatus.value) {
      params.paid =
        selectedStatus.value
    }


    const response =
      await fetchTransportInvoices(params)


    /*
      IMPORTANT:

      fetchTransportInvoices() returns:

        api.get(...)

      therefore response is Axios response.

      The backend returns an array.
    */

    invoices.value =
      Array.isArray(response.data)
        ? response.data
        : response.data?.results || []


  } catch (error) {

    console.error(
      'Failed loading transport invoices:',
      error
    )

    invoices.value = []

    toast.error(
      'Failed to load transport invoices.'
    )

  } finally {

    loading.value = false

  }

}


// --------------------------------------------------
// GENERATE
// --------------------------------------------------

function openGenerateModal() {

  generateForm.value = {
    academic_year:
      selectedAcademicYear.value || '',
    term:
      selectedTerm.value || '',
  }

  showGenerateModal.value = true

}


function closeGenerateModal() {

  if (generating.value) {
    return
  }

  showGenerateModal.value = false

}


async function generateInvoices() {

  generating.value = true

  try {

    const payload = {
      academic_year:
        Number(generateForm.value.academic_year),

      term:
        Number(generateForm.value.term),
    }


    console.log(
      'Generating transport invoices:',
      payload
    )


    const response =
      await generateTransportInvoices(payload)


    const data = response.data


    toast.success(
      data?.message ||
      'Transport invoices generated successfully.'
    )


    /*
      Move the filters to what we just generated.
    */

    selectedAcademicYear.value =
      String(generateForm.value.academic_year)

    selectedTerm.value =
      String(generateForm.value.term)


    closeGenerateModal()

    await loadInvoices()


    /*
      Give useful feedback when the backend tells us
      that some assignments could not be billed.
    */

    if (data?.missing_price_count > 0) {

      toast.warning(
        `${data.missing_price_count} student(s) could not be invoiced because a transport price was missing.`
      )

    }

    if (data?.skipped_count > 0) {

      toast.info(
        `${data.skipped_count} existing invoice(s) were skipped.`
      )

    }

  } catch (error) {

    console.error(
      'Failed generating transport invoices:',
      error
    )

    showApiErrors(
      error,
      'Failed to generate transport invoices.'
    )

  } finally {

    generating.value = false

  }

}


// --------------------------------------------------
// PAYMENT
// --------------------------------------------------

function openPayment(invoice) {

  selectedInvoice.value = invoice
  showPaymentModal.value = true

}


function closePayment() {

  showPaymentModal.value = false
  selectedInvoice.value = null

}


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function formatAmount(amount) {

  if (
    amount === null ||
    amount === undefined ||
    amount === ''
  ) {
    return '0.00'
  }

  return Number(amount).toLocaleString(
    'en-KE',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )

}


function formatTripType(type) {

  if (type === 'ROUND_TRIP') {
    return 'Round Trip'
  }

  if (type === 'ONE_WAY') {
    return 'One Way'
  }

  return type || '—'

}


function showApiErrors(error, fallback) {

  const data = error.response?.data

  if (
    data &&
    typeof data === 'object'
  ) {

    if (data.detail) {

      toast.error(data.detail)

      return

    }


    const messages =
      Object.values(data)
        .flat()
        .filter(Boolean)


    if (messages.length) {

      messages.forEach(message => {

        toast.error(
          typeof message === 'string'
            ? message
            : JSON.stringify(message)
        )

      })

      return

    }

  }

  toast.error(fallback)

}


// --------------------------------------------------
// WATCH FILTERS
// --------------------------------------------------

watch(
  [
    selectedAcademicYear,
    selectedTerm,
    selectedStatus,
  ],
  () => {

    /*
      If academic year changes, clear a term that
      doesn't belong to that year.
    */

    if (
      selectedAcademicYear.value &&
      selectedTerm.value
    ) {

      const validTerm =
        terms.value.some(
          term =>
            Number(term.id) ===
              Number(selectedTerm.value) &&
            Number(term.academic_year) ===
              Number(selectedAcademicYear.value)
        )


      if (!validTerm) {
        selectedTerm.value = ''
        return
      }

    }


    loadInvoices()

  }
)


// --------------------------------------------------
// WHEN GENERATION YEAR CHANGES
// --------------------------------------------------

watch(
  () => generateForm.value.academic_year,
  () => {

    if (
      generateForm.value.term &&
      !generateTerms.value.some(
        term =>
          Number(term.id) ===
          Number(generateForm.value.term)
      )
    ) {

      generateForm.value.term = ''

    }

  }
)


// --------------------------------------------------
// INITIAL LOAD
// --------------------------------------------------

onMounted(async () => {

  await Promise.all([
    loadAcademicYears(),
    loadTerms(),
  ])

  await loadInvoices()

})

</script>


<style scoped>

.field {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.65rem 0.9rem;
  border-radius: 0.6rem;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  font-size: 0.875rem;
  color: #1f2937;
  transition: all 0.15s ease-in-out;
}

.field:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.field:hover {
  border-color: #9ca3af;
}

.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.25rem;
}

</style>