<template>
  <div class="space-y-4 p-3 sm:space-y-6 sm:p-6">
    <!-- Toolbar -->
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-4">
        <label class="sr-only" for="charge-term">Term</label>
        <select
          id="charge-term"
          v-model="selectedTerm"
          class="w-full rounded border px-3 py-2 sm:w-auto"
          @change="loadCharges"
        >
          <option value="" disabled>Select term</option>
          <option v-for="t in terms" :key="t.id" :value="t.id">
            {{ termLabel(t) }}
          </option>
        </select>

        <label class="sr-only" for="charge-search">Search charges</label>
        <input
          id="charge-search"
          v-model="search"
          type="search"
          placeholder="Search charges..."
          class="w-full rounded border px-3 py-2 sm:w-64"
        />

        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="showInactive" type="checkbox" class="rounded border" />
          Show retired charges
        </label>
      </div>

      <button
        @click="openCreate"
        class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto"
      >
        Add Charge
      </button>
    </div>

    <p v-if="pageError" class="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {{ pageError }}
    </p>

    <!-- Desktop table -->
    <div class="hidden overflow-x-auto rounded border md:block">
      <table class="w-full border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-left">Charge</th>
            <th class="p-3 text-left">Frequency</th>
            <th class="p-3 text-left">Applies to</th>
            <th class="p-3 text-left">Rate this term</th>
            <th class="p-3 text-left">Status</th>
            <th class="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="p-4 text-center text-gray-500">Loading charges...</td>
          </tr>

          <tr
            v-for="charge in filteredCharges"
            :key="charge.id"
            class="border-t hover:bg-gray-50"
          >
            <td class="p-3">
              <div class="font-medium">{{ charge.name }}</div>
<span v-if="charge.offer_at_admission" class="mt-1 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
  Offered at registration
</span>
              <div v-if="charge.description" class="text-sm text-gray-500">{{ charge.description }}</div>
            </td>
            <td class="p-3">{{ frequencyLabel(charge.frequency) }}</td>
            <td class="p-3">{{ assignmentLabel(charge.assignment) }}</td>
            <td class="p-3">
              <span v-if="rateSummary(charge).missing" class="text-amber-700">No rate set</span>
              <span v-else>{{ rateSummary(charge).text }}</span>
            </td>
            <td class="p-3">
              <span
                class="rounded px-2 py-0.5 text-xs font-medium"
                :class="charge.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'"
              >
                {{ charge.is_active ? 'Active' : 'Retired' }}
              </span>
            </td>
            <td class="space-x-3 p-3 text-center whitespace-nowrap">
              <button @click="openRates(charge)" class="text-blue-600 hover:underline">Rates</button>
              <button @click="openEdit(charge)" class="text-blue-600 hover:underline">Edit</button>
              <button
                @click="toggleActive(charge)"
                class="hover:underline"
                :class="charge.is_active ? 'text-red-600' : 'text-green-700'"
              >
                {{ charge.is_active ? 'Retire' : 'Reactivate' }}
              </button>
            </td>
          </tr>

          <tr v-if="!loading && !filteredCharges.length">
            <td colspan="6" class="p-4 text-center text-gray-500">
              No charges found. Use Add Charge to create one.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <div class="space-y-3 md:hidden">
      <p v-if="loading" class="rounded-lg border bg-white p-6 text-center text-gray-500">
        Loading charges...
      </p>

      <article
        v-for="charge in filteredCharges"
        :key="charge.id"
        class="rounded-lg border bg-white p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <h2 class="min-w-0 break-words font-semibold text-gray-900">{{ charge.name }}</h2>

          <span v-if="charge.offer_at_admission" class="mt-1 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
  Offered at registration
</span>
          <span
            class="shrink-0 rounded px-2 py-0.5 text-xs font-medium"
            :class="charge.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'"
          >
            {{ charge.is_active ? 'Active' : 'Retired' }}
          </span>
        </div>
        <p v-if="charge.description" class="mt-1 text-sm text-gray-500">{{ charge.description }}</p>

        <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-gray-500">Frequency</dt>
            <dd class="mt-0.5 font-medium text-gray-800">{{ frequencyLabel(charge.frequency) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Applies to</dt>
            <dd class="mt-0.5 font-medium text-gray-800">{{ assignmentLabel(charge.assignment) }}</dd>
          </div>
          <div class="col-span-2">
            <dt class="text-gray-500">Rate this term</dt>
            <dd class="mt-0.5 font-medium" :class="rateSummary(charge).missing ? 'text-amber-700' : 'text-gray-800'">
              {{ rateSummary(charge).missing ? 'No rate set' : rateSummary(charge).text }}
            </dd>
          </div>
        </dl>

        <div class="mt-4 grid grid-cols-3 gap-2">
          <button
            @click="openRates(charge)"
            class="rounded border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Rates
          </button>
          <button
            @click="openEdit(charge)"
            class="rounded border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Edit
          </button>
          <button
            @click="toggleActive(charge)"
            class="rounded border px-3 py-2 text-sm font-medium"
            :class="charge.is_active
              ? 'border-red-200 text-red-700 hover:bg-red-50'
              : 'border-green-200 text-green-700 hover:bg-green-50'"
          >
            {{ charge.is_active ? 'Retire' : 'Reactivate' }}
          </button>
        </div>
      </article>

      <div
        v-if="!loading && !filteredCharges.length"
        class="rounded-lg border bg-white p-6 text-center text-gray-500"
      >
        No charges found. Use Add Charge to create one.
      </div>
    </div>

    <!-- Charge create/edit modal -->
    <div
      v-if="chargeModal"
      class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      @click.self="closeChargeModal"
    >
      <form
        class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:max-w-lg sm:rounded-lg sm:p-6"
        @submit.prevent="saveCharge"
      >
        <h2 class="text-lg font-semibold">{{ editingChargeId ? 'Edit charge' : 'Add charge' }}</h2>

        <div class="mt-4 space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium" for="c-name">Name</label>
            <input id="c-name" v-model.trim="chargeForm.name" required class="w-full rounded border px-3 py-2" placeholder="e.g. Meals" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium" for="c-desc">Description</label>
            <textarea id="c-desc" v-model.trim="chargeForm.description" rows="2" class="w-full rounded border px-3 py-2"></textarea>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium" for="c-freq">Frequency</label>
              <select id="c-freq" v-model="chargeForm.frequency" class="w-full rounded border px-3 py-2">
                <option v-for="f in frequencies" :key="f.value" :value="f.value">{{ f.label }}</option>
              </select>
              <p class="mt-1 text-xs text-gray-500">{{ frequencyHint }}</p>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium" for="c-assign">Applies to</label>
              <select id="c-assign" v-model="chargeForm.assignment" class="w-full rounded border px-3 py-2">
                <option v-for="a in assignments" :key="a.value" :value="a.value">{{ a.label }}</option>
              </select>
              <p class="mt-1 text-xs text-gray-500">{{ assignmentHint }}</p>
            </div>
          </div>

          <label class="flex items-center gap-2 text-sm">
            <input v-model="chargeForm.visible_to_parents" type="checkbox" class="rounded border" />
            Show this charge to parents
          </label>

                    <label class="flex items-start gap-2 text-sm" :class="canOfferAtAdmission ? '' : 'opacity-50'">
            <input
              v-model="chargeForm.offer_at_admission"
              type="checkbox"
              class="mt-0.5 rounded border"
              :disabled="!canOfferAtAdmission"
            />
            <span>
              Offer at student registration
              <span class="block text-xs text-gray-500">
                Appears as a tick when a student is registered. Only for charges billed Once and
                applied to selected students, such as an admission fee.
              </span>
            </span>
          </label>

          <label class="flex items-center gap-2 text-sm">
            <input v-model="chargeForm.is_active" type="checkbox" class="rounded border" />
            Active (retired charges are skipped in new bills)
          </label>
        </div>

        <p v-if="modalError" class="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {{ modalError }}
        </p>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" @click="closeChargeModal" class="w-full rounded border px-4 py-2 hover:bg-gray-50 sm:w-auto">
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
          >
            {{ saving ? 'Saving...' : 'Save charge' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Rates modal -->
    <div
      v-if="ratesChargeId"
      class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      @click.self="closeRates"
    >
      <div class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:max-w-xl sm:rounded-lg sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="break-words text-lg font-semibold">{{ ratesCharge?.name }} rates</h2>
            <p class="text-sm text-gray-500">{{ currentTermName }}</p>
          </div>
          <button @click="closeRates" class="shrink-0 text-gray-500 hover:text-gray-800" aria-label="Close">Close</button>
        </div>

        <p class="mt-3 text-sm text-gray-600">
          A class rate overrides the default. Classes without either are left off the bill.
        </p>

        <ul class="mt-4 divide-y rounded border">
          <li v-for="rate in termRates" :key="rate.id" class="flex items-center justify-between gap-3 p-3">
            <div class="min-w-0">
              <div class="break-words font-medium">{{ rate.class_level_name || 'All classes (default)' }}</div>
              <div class="text-sm text-gray-600">{{ formatCurrency(rate.amount) }}</div>
            </div>
            <div class="shrink-0 space-x-3 text-sm">
              <button @click="editRate(rate)" class="text-blue-600 hover:underline">Edit</button>
              <button @click="removeRate(rate)" class="text-red-600 hover:underline">Delete</button>
            </div>
          </li>
          <li v-if="!termRates.length" class="p-4 text-center text-sm text-gray-500">
            No rates for this term yet.
          </li>
        </ul>

        <form class="mt-5 space-y-3 rounded border bg-gray-50 p-3" @submit.prevent="saveRate">
          <h3 class="text-sm font-semibold">{{ rateForm.id ? 'Edit rate' : 'Add rate' }}</h3>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium" for="r-class">Class</label>
              <select id="r-class" v-model="rateForm.class_level" class="w-full rounded border bg-white px-3 py-2">
                <option :value="null">All classes (default)</option>
                <option v-for="cls in classLevels" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium" for="r-amount">Amount (KES)</label>
              <input
                id="r-amount"
                v-model="rateForm.amount"
                type="number"
                min="0"
                step="1"
                inputmode="numeric"
                required
                class="w-full rounded border bg-white px-3 py-2"
              />
            </div>
          </div>

          <p v-if="rateError" class="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {{ rateError }}
          </p>

          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              v-if="rateForm.id"
              type="button"
              @click="resetRateForm"
              class="w-full rounded border bg-white px-4 py-2 hover:bg-gray-50 sm:w-auto"
            >
              Cancel edit
            </button>
            <button
              type="submit"
              :disabled="savingRate"
              class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
            >
              {{ savingRate ? 'Saving...' : rateForm.id ? 'Update rate' : 'Add rate' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed,watch, onMounted } from 'vue'
import {
  getCharges,
  createCharge,
  updateCharge,
  createChargeRate,
  updateChargeRate,
  deleteChargeRate,
  unwrapList,
  errorMessage,
} from '../../api/charge'
import { getClassLevels } from '@/api/classes'

import { listTerms } from '../../api/term'

const frequencies = [
  { value: 'every_term', label: 'Every term', hint: 'Billed in each term.' },
  { value: 'yearly', label: 'Yearly', hint: 'Billed once per academic year.' },
  { value: 'once', label: 'Once', hint: 'Billed once per student, ever.' },
]
const assignments = [
  { value: 'automatic', label: 'All students', hint: 'Billed to every student in a class that has a rate.' },
  { value: 'opt_in', label: 'Selected students', hint: 'Billed only to students you assign it to.' },
]

const terms = ref([])
const classLevels = ref([])
const charges = ref([])
const selectedTerm = ref('')
const search = ref('')
const showInactive = ref(false)
const loading = ref(false)
const pageError = ref('')

// ----- helpers -----
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const frequencyLabel = (v) => frequencies.find((f) => f.value === v)?.label ?? v
const assignmentLabel = (v) => assignments.find((a) => a.value === v)?.label ?? v
const termLabel = (t) => [t.name, t.academic_year_name ?? t.academic_year].filter(Boolean).join(' · ')

const currentTermName = computed(() => {
  const t = terms.value.find((x) => x.id === selectedTerm.value)
  return t ? termLabel(t) : ''
})

// Rates for the selected term only (the backend already filters when ?term= is sent)
const ratesFor = (charge) =>
  (charge.rates || []).filter((r) => !selectedTerm.value || r.term === selectedTerm.value)

const rateSummary = (charge) => {
  const rates = ratesFor(charge)
  if (!rates.length) return { missing: true, text: '' }
  const def = rates.find((r) => r.class_level == null)
  const overrides = rates.filter((r) => r.class_level != null).length
  const parts = []
  if (def) parts.push(`${formatCurrency(def.amount)} default`)
  if (overrides) parts.push(`${overrides} class ${overrides === 1 ? 'rate' : 'rates'}`)
  return { missing: false, text: parts.join(', ') }
}

const filteredCharges = computed(() => {
  const q = search.value.toLowerCase()
  return charges.value.filter((c) => {
    if (!showInactive.value && !c.is_active) return false
    return (c.name || '').toLowerCase().includes(q)
  })
})

// ----- loading -----
const loadCharges = async () => {
  if (!selectedTerm.value) return
  loading.value = true
  pageError.value = ''
  try {
    charges.value = unwrapList(await getCharges({ term: selectedTerm.value }))
  } catch (err) {
    pageError.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const [termData, classData] = await Promise.all([listTerms(), getClassLevels()])
    terms.value = unwrapList(termData)
    classLevels.value = unwrapList(classData)
    const current = terms.value.find((t) => t.is_current) ?? terms.value[0]
    if (current) selectedTerm.value = current.id
  } catch (err) {
    pageError.value = errorMessage(err)
  }
  await loadCharges()
})

// ----- charge modal -----
const emptyCharge = () => ({
  name: '',
  description: '',
  frequency: 'every_term',
  assignment: 'automatic',
  visible_to_parents: true,
  is_active: true,
  offer_at_admission: false,
})

const chargeModal = ref(false)
const editingChargeId = ref(null)
const chargeForm = reactive(emptyCharge())
const saving = ref(false)
const modalError = ref('')

const frequencyHint = computed(() => frequencies.find((f) => f.value === chargeForm.frequency)?.hint)
const assignmentHint = computed(() => assignments.find((a) => a.value === chargeForm.assignment)?.hint)

const canOfferAtAdmission = computed(
  () => chargeForm.frequency === 'once' && chargeForm.assignment === 'opt_in',
)
watch(canOfferAtAdmission, (ok) => {
  if (!ok) chargeForm.offer_at_admission = false
})

const openCreate = () => {
  editingChargeId.value = null
  Object.assign(chargeForm, emptyCharge())
  modalError.value = ''
  chargeModal.value = true
}

const openEdit = (charge) => {
  editingChargeId.value = charge.id
  Object.assign(chargeForm, {
    name: charge.name,
    description: charge.description ?? '',
    frequency: charge.frequency,
    assignment: charge.assignment,
    visible_to_parents: charge.visible_to_parents,
    is_active: charge.is_active,
    offer_at_admission: charge.offer_at_admission ?? false
  })
  modalError.value = ''
  chargeModal.value = true
}

const closeChargeModal = () => {
  chargeModal.value = false
}

const saveCharge = async () => {
  saving.value = true
  modalError.value = ''
  try {
    const payload = { ...chargeForm }
    if (editingChargeId.value) await updateCharge(editingChargeId.value, payload)
    else await createCharge(payload)
    chargeModal.value = false
    await loadCharges()
  } catch (err) {
    modalError.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}

const toggleActive = async (charge) => {
  const retiring = charge.is_active
  const msg = retiring
    ? `Retire "${charge.name}"? It will no longer be added to new bills. Existing invoices are not changed.`
    : `Reactivate "${charge.name}"?`
  if (!window.confirm(msg)) return
  pageError.value = ''
  try {
    await updateCharge(charge.id, { is_active: !charge.is_active })
    await loadCharges()
  } catch (err) {
    pageError.value = errorMessage(err)
  }
}

// ----- rates modal -----
const ratesChargeId = ref(null)
// Derived from the list so it refreshes after every reload
const ratesCharge = computed(() => charges.value.find((c) => c.id === ratesChargeId.value))
const termRates = computed(() => (ratesCharge.value ? ratesFor(ratesCharge.value) : []))

const rateForm = reactive({ id: null, class_level: null, amount: '' })
const savingRate = ref(false)
const rateError = ref('')

const resetRateForm = () => {
  Object.assign(rateForm, { id: null, class_level: null, amount: '' })
  rateError.value = ''
}

const openRates = (charge) => {
  ratesChargeId.value = charge.id
  resetRateForm()
}

const closeRates = () => {
  ratesChargeId.value = null
}

const editRate = (rate) => {
  Object.assign(rateForm, { id: rate.id, class_level: rate.class_level ?? null, amount: String(Number(rate.amount)) })
  rateError.value = ''
}

const saveRate = async () => {
  rateError.value = ''
  const amount = Number(rateForm.amount)
  if (!Number.isInteger(amount) || amount < 0) {
    rateError.value = 'Enter a whole shilling amount, 0 or more.'
    return
  }
  savingRate.value = true
  try {
    const payload = {
      charge: ratesChargeId.value,
      term: selectedTerm.value,
      class_level: rateForm.class_level,
      amount: String(amount),
    }
    if (rateForm.id) await updateChargeRate(rateForm.id, payload)
    else await createChargeRate(payload)
    resetRateForm()
    await loadCharges()
  } catch (err) {
    rateError.value = errorMessage(err)
  } finally {
    savingRate.value = false
  }
}

const removeRate = async (rate) => {
  const label = rate.class_level_name || 'the default rate'
  if (!window.confirm(`Delete ${label}? Classes that relied on it will be left off the bill.`)) return
  rateError.value = ''
  try {
    await deleteChargeRate(rate.id)
    if (rateForm.id === rate.id) resetRateForm()
    await loadCharges()
  } catch (err) {
    rateError.value = errorMessage(err)
  }
}
</script>