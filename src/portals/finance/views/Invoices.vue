<template>
  <div class="p-4 md:p-6">

    <div class="flex flex-wrap gap-4 mb-4 items-center justify-between">

      <div class="flex flex-wrap gap-2 md:gap-4">

        <!-- SEARCH -->
        <input
          v-model="search"
          type="text"
          placeholder="Search student..."
          class="border rounded px-2 md:px-3 py-1 md:py-2 w-48 md:w-64 text-sm md:text-base"
        />


        <!-- CLASS -->
        <select
          v-model="selectedClassLevel"
          class="border rounded px-2 md:px-3 py-1 md:py-2 text-sm md:text-base"
        >

          <option value="">
            All Classes
          </option>

          <option
            v-for="cls in classLevels"
            :key="cls.id"
            :value="cls.name"
          >
            {{ cls.name }}
          </option>

        </select>


        <!-- TERM -->
        <select
          v-model="selectedTerm"
          class="border rounded px-2 md:px-3 py-1 md:py-2 text-sm md:text-base"
        >

          <option value="">
            All Terms
          </option>


          <option
            v-for="term in terms"
            :key="term.id"
            :value="term.name"
          >
            {{ term.name }}
          </option>


        </select>


      </div>



      <button
        @click="goToCreateInvoice"
        class="bg-blue-600 text-white px-3 md:px-4 py-1 md:py-2 rounded hover:bg-blue-700 text-sm md:text-base"
      >
        Generate Invoices
      </button>


    </div>



    <!-- DESKTOP TABLE -->
    <div class="hidden md:block overflow-x-auto bg-white shadow rounded">


      <table class="w-full min-w-[900px] border-collapse text-sm md:text-base">


        <thead class="bg-gray-100 text-left">

          <tr>

            <th class="p-3">
              Student
            </th>

            <th class="p-3">
              Grade
            </th>

            <th class="p-3">
              Term
            </th>

            <th class="p-3">
              Amount Due
            </th>

            <th class="p-3">
              Paid
            </th>

            <th class="p-3">
              Balance
            </th>

            <th class="p-3">
              Status
            </th>

            <th class="p-3 text-right">
              Actions
            </th>

          </tr>

        </thead>



        <tbody>


          <tr
            v-for="invoice in invoices"
            :key="invoice.id"
            class="border-t"
          >


            <td class="p-3">
              {{ invoice.student_name }}
            </td>


            <td class="p-3">
              {{ invoice.class_level || '-' }}
            </td>


            <td class="p-3">
              {{ invoice.term }}
            </td>


            <td class="p-3">
              {{ Number(invoice.amount_due).toFixed(2) }}
            </td>


            <td class="p-3">
              {{ Number(invoice.amount_paid).toFixed(2) }}
            </td>


            <td class="p-3 font-medium">

              {{
                Math.max(
                  Number(invoice.amount_due) -
                  Number(invoice.amount_paid),
                  0
                ).toFixed(2)
              }}

            </td>



            <td class="p-3">


              <span
                class="px-2 py-1 rounded text-sm"
                :class="
                  invoice.is_fully_paid
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
                "
              >

                {{
                  invoice.is_fully_paid
                  ? 'Paid'
                  : 'Pending'
                }}

              </span>


            </td>




            <td class="p-3 text-right">


              <button
                class="text-green-600 hover:underline"
                @click="openRecordPayment(invoice.id)"
              >
                Record Payment
              </button>


            </td>


          </tr>



          <tr v-if="invoices.length === 0">

            <td
              colspan="8"
              class="p-6 text-center text-gray-500"
            >

              No invoices found.

            </td>

          </tr>


        </tbody>


      </table>


    </div>




    <!-- MOBILE CARDS -->

    <div class="md:hidden flex flex-col gap-3">


      <div
        v-for="invoice in invoices"
        :key="invoice.id"
        class="bg-white shadow rounded p-3 space-y-2"
      >


        <div class="flex justify-between">


          <span class="font-medium">
            {{ invoice.student_name }}
          </span>


          <span
            class="px-2 py-1 rounded text-xs"
            :class="
              invoice.is_fully_paid
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
            "
          >

            {{
              invoice.is_fully_paid
              ? 'Paid'
              : 'Pending'
            }}

          </span>


        </div>



        <div>
          Grade:
          {{ invoice.class_level }}
        </div>


        <div>
          Term:
          {{ invoice.term }}
        </div>


        <div>
          Due:
          {{ Number(invoice.amount_due).toFixed(2) }}
        </div>


        <div>
          Paid:
          {{ Number(invoice.amount_paid).toFixed(2) }}
        </div>



        <button
          class="bg-blue-600 text-white px-3 py-2 rounded"
          @click="openRecordPayment(invoice.id)"
        >
          Record Payment
        </button>


      </div>



      <div
        v-if="invoices.length === 0"
        class="text-center text-gray-500"
      >
        No invoices found.
      </div>


    </div>





    <!-- PAGINATION -->

    <div
      class="flex justify-center items-center gap-4 mt-6"
    >


      <button
        @click="previous"
        :disabled="!previousPage"
        class="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
      >
        Previous
      </button>



      <span class="text-sm text-gray-600">

        Total:
        {{ totalCount }}

      </span>



      <button
        @click="next"
        :disabled="!nextPage"
        class="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        Next
      </button>


    </div>





    <RecordPayment

      v-if="showRecordPaymentModal"

      :invoice-id="selectedInvoiceId"

      @close="closeRecordPayment"

      @paymentRecorded="refreshInvoices"

    />


  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { getInvoices } from '../api/fee'
import { useRouter } from 'vue-router'
import RecordPayment from '../components/Invoices/RecordPayment.vue'
import { getClassLevels } from '@/api/classes'
import { listTerms } from '../api/term'


const router = useRouter()


// -------------------------
// STATE
// -------------------------

const invoices = ref([])

const search = ref('')
const selectedTerm = ref('')
const selectedClassLevel = ref('')


const classLevels = ref([])
const terms = ref([])


const currentPage = ref(1)
const nextPage = ref(null)
const previousPage = ref(null)
const totalCount = ref(0)


const showRecordPaymentModal = ref(false)
const selectedInvoiceId = ref(null)


// -------------------------
// LOAD FILTER OPTIONS
// -------------------------

const loadClassLevels = async () => {
  try {
    classLevels.value = await getClassLevels()
  } catch (error) {
    console.error(
      "Failed loading class levels:",
      error
    )
  }
}


const loadTerms = async () => {
  try {
    terms.value = await listTerms()
  } catch (error) {
    console.error(
      "Failed loading terms:",
      error
    )
  }
}



// -------------------------
// FETCH INVOICES
// -------------------------

const refreshInvoices = async () => {

  try {

    const response = await getInvoices({

      page: currentPage.value,

      class_level:
        selectedClassLevel.value || undefined,

      term:
        selectedTerm.value || undefined,

      student:
        search.value || undefined
    })


    


    /*
      DRF pagination response:

      {
        count:124,
        next:"",
        previous:"",
        results:[]
      }
    */


    invoices.value =
      response.results ?? []


    totalCount.value =
      response.count ?? 0


    nextPage.value =
      response.next ?? null


    previousPage.value =
      response.previous ?? null


  } catch(error){

    console.error(
      "Failed loading invoices:",
      error
    )

    invoices.value = []

  }

}



// -------------------------
// PAGINATION
// -------------------------

const next = () => {

  if(nextPage.value){

    currentPage.value++

  }

}


const previous = () => {

  if(previousPage.value){

    currentPage.value--

  }

}



// -------------------------
// PAYMENT MODAL
// -------------------------

const openRecordPayment = (invoiceId) => {

  selectedInvoiceId.value = invoiceId

  showRecordPaymentModal.value = true

}



const closeRecordPayment = () => {

  showRecordPaymentModal.value = false

  selectedInvoiceId.value = null

}



// -------------------------
// NAVIGATION
// -------------------------

const goToCreateInvoice = () => {

  router.push({
    name:'InvoiceCreate'
  })

}



// -------------------------
// LIFECYCLE
// -------------------------

onMounted(async()=>{

  await loadClassLevels()

  await loadTerms()

  await refreshInvoices()

})



// -------------------------
// WATCHERS
// -------------------------


// When changing page
watch(
  currentPage,
  ()=>{

    refreshInvoices()

  }
)



// When filtering
watch(
  [
    selectedClassLevel,
    selectedTerm,
    search
  ],

  ()=>{

    currentPage.value = 1

    refreshInvoices()

  }

)



</script>