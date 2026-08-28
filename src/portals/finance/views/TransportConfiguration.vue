
<template>
  <div class="min-h-screen bg-gray-50 px-3 py-4 sm:p-6">

    <div class="max-w-6xl mx-auto space-y-5 sm:space-y-6">

      <!-- HEADER -->
      <div>
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-800">
          Transport Configuration
        </h2>
      </div>


      <!-- ===================================================== -->
      <!-- TRANSPORT ROUTES -->
      <!-- ===================================================== -->

      <div class="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6">

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">

          <div>
            <h3 class="text-lg font-semibold text-gray-800">
              Transport Routes
            </h3>
          </div>

          <button
            @click="openRouteForm"
            class="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Route
          </button>

        </div>


        <!-- Loading -->
        <div
          v-if="loadingRoutes"
          class="py-8 text-center text-gray-500"
        >
          Loading routes...
        </div>


        <!-- Empty -->
        <div
          v-else-if="transportRoutes.length === 0"
          class="border border-dashed rounded-xl p-6 sm:p-8 text-center text-gray-500"
        >
          <p class="font-medium text-gray-600">
            No transport routes configured
          </p>
        </div>


        <!-- DESKTOP TABLE -->
        <div
          v-else
          class="hidden md:block overflow-x-auto"
        >
          <table class="w-full text-sm">

            <thead>
              <tr class="border-b text-left text-gray-500">
                <th class="py-3 px-3">Route</th>
                <th class="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>

              <tr
                v-for="route in transportRoutes"
                :key="route.id"
                class="border-b last:border-0 hover:bg-gray-50"
              >

                <td class="py-4 px-3 font-medium text-gray-800">
                  {{ route.name }}
                </td>

                <td class="py-4 px-3">
                  <div class="flex justify-end gap-2">

                    <button
                      @click="editRoute(route)"
                      class="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      Edit
                    </button>

                    <!--<button
                      @click="deleteRoute(route)"
                      class="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Delete
                    </button>-->

                  </div>
                </td>

              </tr>

            </tbody>

          </table>
        </div>


        <!-- MOBILE CARDS -->
        <div
          v-if="transportRoutes.length"
          class="md:hidden space-y-3"
        >

          <div
            v-for="route in transportRoutes"
            :key="route.id"
            class="border rounded-xl p-4"
          >

            <div class="flex items-center justify-between gap-3">

              <p class="font-medium text-gray-800">
                {{ route.name }}
              </p>

              <div class="flex gap-2 shrink-0">

                <button
                  @click="editRoute(route)"
                  class="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg"
                >
                  Edit
                </button>

                <button
                  @click="deleteRoute(route)"
                  class="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>


      <!-- ===================================================== -->
      <!-- ROUTE PRICING -->
      <!-- ===================================================== -->

      <div class="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6">

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">

          <div>
            <h3 class="text-lg font-semibold text-gray-800">
              Route Pricing
            </h3>
          </div>

          <button
            @click="openPriceForm"
            :disabled="transportRoutes.length === 0"
            class="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            + Configure Price
          </button>

        </div>


        <!-- Loading -->
        <div
          v-if="loadingPrices"
          class="py-8 text-center text-gray-500"
        >
          Loading prices...
        </div>


        <!-- Empty -->
        <div
          v-else-if="routePrices.length === 0"
          class="border border-dashed rounded-xl p-6 sm:p-8 text-center text-gray-500"
        >
          <p class="font-medium text-gray-600">
            No transport prices configured
          </p>
        </div>


        <!-- DESKTOP TABLE -->
        <div
          v-else
          class="hidden md:block overflow-x-auto"
        >

          <table class="w-full text-sm">

            <thead>
              <tr class="border-b text-left text-gray-500">
                <th class="py-3 px-3">Route</th>
                <th class="py-3 px-3">Term</th>
                <th class="py-3 px-3">Round Trip</th>
                <th class="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>

              <tr
                v-for="price in routePrices"
                :key="price.id"
                class="border-b last:border-0 hover:bg-gray-50"
              >

                <td class="py-4 px-3 font-medium text-gray-800">
                  {{ getRouteName(price.route) }}
                </td>

                <td class="py-4 px-3 text-gray-600">
                  {{ getTermName(price.term) }}
                </td>

                <td class="py-4 px-3">
                  KES {{ formatAmount(price.round_trip_amount) }}
                </td>

                <td class="py-4 px-3">
                  <div class="flex justify-end gap-2">

                    <button
                      @click="editPrice(price)"
                      class="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      @click="deletePrice(price)"
                      class="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Delete
                    </button>

                  </div>
                </td>

              </tr>

            </tbody>

          </table>

        </div>


        <!-- MOBILE CARDS -->
        <div
          v-if="routePrices.length"
          class="md:hidden space-y-3"
        >

          <div
            v-for="price in routePrices"
            :key="price.id"
            class="border rounded-xl p-4"
          >

            <div class="flex items-start justify-between gap-3">

              <div class="min-w-0">

                <p class="font-medium text-gray-800 truncate">
                  {{ getRouteName(price.route) }}
                </p>

                <p class="text-sm text-gray-500 mt-1">
                  {{ getTermName(price.term) }}
                </p>

              </div>

              <p class="font-semibold text-gray-800 whitespace-nowrap">
                KES {{ formatAmount(price.round_trip_amount) }}
              </p>

            </div>


            <div class="flex justify-end gap-2 mt-4 pt-3 border-t">

              <button
                @click="editPrice(price)"
                class="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg"
              >
                Edit
              </button>

              <button
                @click="deletePrice(price)"
                class="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg"
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      </div>


      <!-- ===================================================== -->
      <!-- ROUTE MODAL -->
      <!-- ===================================================== -->

      <div
        v-if="showRouteModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4"
      >

        <div
          class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6"
        >

          <div class="flex justify-between items-center mb-5">

            <h3 class="text-lg sm:text-xl font-semibold text-gray-800">
              {{ editingRoute ? 'Edit Transport Route' : 'Add Transport Route' }}
            </h3>

            <button
              @click="closeRouteModal"
              class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>

          </div>


          <form
            @submit.prevent="saveRoute"
            class="space-y-5"
          >

            <div>

              <label class="label">
                Route Name
              </label>

              <input
                v-model="routeForm.name"
                type="text"
                required
                placeholder="e.g. Athi River to Kitengela"
                class="field"
              />

            </div>


            <div>

              <label class="label">
                Description
              </label>

              <textarea
                v-model="routeForm.description"
                rows="3"
                placeholder="Optional route description"
                class="field"
              ></textarea>

            </div>


            <div>

              <label class="flex items-center gap-2 cursor-pointer">

                <input
                  v-model="routeForm.is_active"
                  type="checkbox"
                  class="rounded"
                />

                <span class="text-sm text-gray-700">
                  Active route
                </span>

              </label>

            </div>


            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t">

              <button
                type="button"
                @click="closeRouteModal"
                class="w-full sm:w-auto px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                :disabled="savingRoute"
                class="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {{ savingRoute ? 'Saving...' : 'Save Route' }}
              </button>

            </div>

          </form>

        </div>

      </div>


      <!-- ===================================================== -->
      <!-- PRICE MODAL -->
      <!-- ===================================================== -->

      <div
        v-if="showPriceModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4"
      >

        <div
          class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6"
        >

          <div class="flex justify-between items-center mb-5">

            <h3 class="text-lg sm:text-xl font-semibold text-gray-800">
              {{ editingPrice ? 'Edit Route Price' : 'Configure Route Price' }}
            </h3>

            <button
              @click="closePriceModal"
              class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>

          </div>


          <form
            @submit.prevent="savePrice"
            class="space-y-5"
          >

            <!-- ROUTE -->

            <div>

              <label class="label">
                Transport Route
              </label>

              <select
                v-model="priceForm.route"
                required
                class="field"
              >

                <option value="">
                  Select Route
                </option>

                <option
                  v-for="route in activeRoutes"
                  :key="route.id"
                  :value="route.id"
                >
                  {{ route.name }}
                </option>

              </select>

            </div>


            <!-- ACADEMIC YEAR -->

            <div>

              <label class="label">
                Academic Year
              </label>

              <select
                v-model="priceForm.academic_year"
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
                  {{ year.is_current ? '(Current)' : '' }}
                </option>

              </select>


              <p
                v-if="academicYears.length === 0"
                class="text-xs text-red-500 mt-1"
              >
                No academic years available.
              </p>

            </div>


            <!-- TERM -->

            <div>

              <label class="label">
                Term
              </label>

              <select
                v-model="priceForm.term"
                required
                class="field"
                :disabled="!priceForm.academic_year || loadingTerms"
              >

                <option value="">
                  {{ loadingTerms
                    ? 'Loading terms...'
                    : 'Select Term'
                  }}
                </option>

                <option
                  v-for="term in availableTerms"
                  :key="term.id"
                  :value="term.id"
                >
                  {{ term.name }}
                </option>

              </select>


              <p
                v-if="priceForm.academic_year && !loadingTerms && availableTerms.length === 0"
                class="text-xs text-amber-600 mt-1"
              >
                No terms found for the selected academic year.
              </p>

            </div>


            <!-- ROUND TRIP -->

            <div>

              <label class="label">
                Round Trip Amount
              </label>

              <input
                v-model="priceForm.round_trip_amount"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                class="field"
              />

            </div>


            <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t">

              <button
                type="button"
                @click="closePriceModal"
                class="w-full sm:w-auto px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                :disabled="savingPrice"
                class="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {{ savingPrice ? 'Saving...' : 'Save Price' }}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  </div>
</template>


<script setup>

import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

import {
  fetchTransportRoutes,
  createTransportRoute,
  updateTransportRoute,
  deleteTransportRoute,
  fetchTransportRoutePrices,
  createTransportRoutePrice,
  updateTransportRoutePrice,
  deleteTransportRoutePrice,
} from '@/api/transport.js'

import { fetchAcademicYears, fetchTerms } from '../api/term.js'


const toast = useToast()


/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const transportRoutes = ref([])
const routePrices = ref([])

const academicYears = ref([])
const terms = ref([])

const loadingRoutes = ref(false)
const loadingPrices = ref(false)
const loadingTerms = ref(false)

const savingRoute = ref(false)
const savingPrice = ref(false)

const showRouteModal = ref(false)
const showPriceModal = ref(false)

const editingRoute = ref(null)
const editingPrice = ref(null)


/*
|--------------------------------------------------------------------------
| Forms
|--------------------------------------------------------------------------
*/

const routeForm = ref({
  name: '',
  description: '',
  is_active: true,
})

const priceForm = ref({
  route: '',
  academic_year: '',
  term: '',
  round_trip_amount: '',
})


/*
|--------------------------------------------------------------------------
| Computed
|--------------------------------------------------------------------------
*/

const activeRoutes = computed(() => {
  return transportRoutes.value.filter(route => route.is_active)
})


const availableTerms = computed(() => {

  if (!priceForm.value.academic_year) {
    return []
  }

  const selectedYear = Number(priceForm.value.academic_year)

  return terms.value.filter(term => {

    /*
     * Support both possible serializer formats:
     *
     * academic_year: 3
     *
     * OR
     *
     * academic_year: { id: 3, year: "2026" }
     */

    const termAcademicYear =
      typeof term.academic_year === 'object'
        ? term.academic_year?.id
        : term.academic_year

    return Number(termAcademicYear) === selectedYear
  })
})


/*
|--------------------------------------------------------------------------
| Loading
|--------------------------------------------------------------------------
*/

async function loadRoutes() {

  loadingRoutes.value = true

  try {

    const response = await fetchTransportRoutes()

    transportRoutes.value = Array.isArray(response.data)
      ? response.data
      : response.data?.results || []

  } catch (error) {

    console.error('Failed to load transport routes:', error)

    toast.error('Failed to load transport routes.')

  } finally {

    loadingRoutes.value = false

  }
}


async function loadPrices() {

  loadingPrices.value = true

  try {

    const response = await fetchTransportRoutePrices()

    routePrices.value = Array.isArray(response.data)
      ? response.data
      : response.data?.results || []

  } catch (error) {

    console.error('Failed to load transport prices:', error)

    toast.error('Failed to load transport prices.')

  } finally {

    loadingPrices.value = false

  }
}


async function loadAcademicYears() {

  try {

    const response = await fetchAcademicYears()

    academicYears.value = academicYearsResponse || []

    /*
     * Automatically select the current academic year
     * when creating a new price.
     */

    if (!editingPrice.value && !priceForm.value.academic_year) {

      const currentYear = academicYears.value.find(
        year => year.is_current
      )

      if (currentYear) {
        priceForm.value.academic_year = currentYear.id
      }

    }

  } catch (error) {

    console.error('Failed to load academic years:', error)

    toast.error('Failed to load academic years.')

  }
}


async function loadTerms() {

  loadingTerms.value = true

  try {

    const response = await fetchTerms()

    terms.value = termsResponse || []

  } catch (error) {

    console.error('Failed to load terms:', error)

    toast.error('Failed to load terms.')

  } finally {

    loadingTerms.value = false

  }
}


/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

function openRouteForm() {

  editingRoute.value = null

  routeForm.value = {
    name: '',
    description: '',
    is_active: true,
  }

  showRouteModal.value = true
}


function editRoute(route) {

  editingRoute.value = route

  routeForm.value = {
    name: route.name || '',
    description: route.description || '',
    is_active: route.is_active ?? true,
  }

  showRouteModal.value = true
}


function closeRouteModal() {

  showRouteModal.value = false
  editingRoute.value = null

}


async function saveRoute() {

  savingRoute.value = true

  try {

    if (editingRoute.value) {

      await updateTransportRoute(
        editingRoute.value.id,
        routeForm.value
      )

      toast.success('Transport route updated successfully.')

    } else {

      await createTransportRoute(routeForm.value)

      toast.success('Transport route created successfully.')

    }

    closeRouteModal()

    await loadRoutes()

  } catch (error) {

    console.error(error)

    showApiErrors(error, 'Failed to save transport route.')

  } finally {

    savingRoute.value = false

  }
}


async function deleteRoute(route) {

  const confirmed = window.confirm(
    `Are you sure you want to delete "${route.name}"?`
  )

  if (!confirmed) {
    return
  }

  try {

    await deleteTransportRoute(route.id)

    toast.success('Transport route deleted successfully.')

    await loadRoutes()

  } catch (error) {

    console.error(error)

    showApiErrors(error, 'Failed to delete transport route.')

  }
}


/*
|--------------------------------------------------------------------------
| Prices
|--------------------------------------------------------------------------
*/

function openPriceForm() {

  editingPrice.value = null

  priceForm.value = {
    route: '',
    academic_year: '',
    term: '',
    round_trip_amount: '',
  }

  /*
   * Use the current academic year automatically.
   */

  const currentYear = academicYears.value.find(
    year => year.is_current
  )

  if (currentYear) {
    priceForm.value.academic_year = currentYear.id
  }

  showPriceModal.value = true
}


function editPrice(price) {

  editingPrice.value = price

  const academicYear =
    typeof price.academic_year === 'object'
      ? price.academic_year?.id
      : price.academic_year

  const term =
    typeof price.term === 'object'
      ? price.term?.id
      : price.term

  const route =
    typeof price.route === 'object'
      ? price.route?.id
      : price.route

  priceForm.value = {
    route: route || '',
    academic_year: academicYear || '',
    term: term || '',
    round_trip_amount: price.round_trip_amount || '',
  }

  showPriceModal.value = true
}


function closePriceModal() {

  showPriceModal.value = false
  editingPrice.value = null

}


async function savePrice() {

  savingPrice.value = true

  try {

    const payload = {
      ...priceForm.value,
    }

    if (editingPrice.value) {

      await updateTransportRoutePrice(
        editingPrice.value.id,
        payload
      )

      toast.success('Transport price updated successfully.')

    } else {

      await createTransportRoutePrice(payload)

      toast.success('Transport price configured successfully.')

    }

    closePriceModal()

    await loadPrices()

  } catch (error) {

    console.error(error)

    showApiErrors(error, 'Failed to save transport price.')

  } finally {

    savingPrice.value = false

  }
}


async function deletePrice(price) {

  const confirmed = window.confirm(
    'Are you sure you want to delete this transport price?'
  )

  if (!confirmed) {
    return
  }

  try {

    await deleteTransportRoutePrice(price.id)

    toast.success('Transport price deleted successfully.')

    await loadPrices()

  } catch (error) {

    console.error(error)

    showApiErrors(error, 'Failed to delete transport price.')

  }
}


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getRouteName(routeId) {

  const id =
    typeof routeId === 'object'
      ? routeId?.id
      : routeId

  const route = transportRoutes.value.find(
    route => Number(route.id) === Number(id)
  )

  return route?.name || `Route #${id}`

}


function getTermName(termId) {

  const id =
    typeof termId === 'object'
      ? termId?.id
      : termId

  const term = terms.value.find(
    term => Number(term.id) === Number(id)
  )

  return term?.name || `Term #${id}`

}


function formatAmount(amount) {

  if (
    amount === null ||
    amount === undefined ||
    amount === ''
  ) {
    return '—'
  }

  return Number(amount).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

}


function showApiErrors(error, fallback) {

  const data = error.response?.data

  if (data && typeof data === 'object') {

    const messages = Object.values(data)
      .flat()
      .filter(Boolean)

    if (messages.length) {

      messages.forEach(message => {
        toast.error(message)
      })

      return
    }
  }

  toast.error(fallback)

}


/*
|--------------------------------------------------------------------------
| Initial Load
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  try {
    const [
      routesResponse,
      pricesResponse,
      academicYearsResponse,
      termsResponse,
    ] = await Promise.all([
      fetchTransportRoutes(),
      fetchTransportRoutePrices(),
      fetchAcademicYears(),
      fetchTerms(),
    ])

    transportRoutes.value = Array.isArray(routesResponse.data)
      ? routesResponse.data
      : routesResponse.data?.results || []

    routePrices.value = Array.isArray(pricesResponse.data)
      ? pricesResponse.data
      : pricesResponse.data?.results || []

    academicYears.value = academicYearsResponse || []

    terms.value = termsResponse || []

  } catch (error) {
    console.error(error)
    toast.error('Failed to load transport configuration.')
  }
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

.field:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.25rem;
}

</style>

