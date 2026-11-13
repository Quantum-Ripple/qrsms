
<template>
  <main class="min-w-0 space-y-5 p-3 text-slate-800 sm:p-5 lg:p-6">

    <!-- PAGE HEADER -->
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">
          Arrears Management
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Monitor previous-term debts and historical opening balances.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button :class="secondaryButtonClass" @click="openImport">
          Import Arrears
        </button>
        <button :class="primaryButtonClass" @click="openRecord">
          + Record Arrear
        </button>
      </div>
    </header>

    <!-- FEEDBACK -->
    <p
      v-if="notice"
      class="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
    >
      {{ notice }}
    </p>

    <p
      v-if="error"
      class="rounded-lg bg-red-50 p-3 text-sm text-red-700"
    >
      {{ error }}
    </p>

    <!-- STATISTICS -->
    <section class="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <article
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p class="text-xs font-medium text-slate-500 sm:text-sm">
          {{ stat.label }}
        </p>

        <p
          class="mt-3 break-words text-xl font-bold sm:text-2xl"
          :class="stat.color"
        >
          {{ stat.value }}
        </p>
      </article>
    </section>

    <!-- STUDENT ARREARS REGISTER -->
    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      <div class="space-y-4 border-b border-slate-100 p-4 sm:p-5">

        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="font-semibold text-slate-900">
              Student Arrears Register
            </h2>
            <p class="mt-1 text-xs text-slate-500">
              {{ totalCount }} students with outstanding arrears
            </p>
          </div>

          <button
            class="text-sm font-medium text-blue-700 hover:underline"
            @click="reload"
          >
            Refresh
          </button>
        </div>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">

          <input
            v-model="search"
            type="search"
            :class="fieldClass"
            placeholder="Search student..."
          />

          <select v-model="source" :class="fieldClass">
            <option value="all">All Sources</option>
            <option value="legacy">Historical Arrears</option>
            <option value="system">System Arrears</option>
          </select>

          <select v-model="category" :class="fieldClass">
            <option value="all">All Categories</option>
            <option value="fees">School Fees</option>
            <option value="transport">Transport</option>
          </select>

          <button
            :class="secondaryButtonClass"
            @click="resetFilters"
          >
            Clear Filters
          </button>

        </div>
      </div>

      <div
        v-if="loading"
        class="p-10 text-center text-sm text-slate-500"
      >
        Loading arrears...
      </div>

      <template v-else>

        <!-- DESKTOP TABLE -->
        <div class="hidden overflow-x-auto md:block">
          <table class="w-full min-w-[750px] text-left text-sm">

            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="p-4">Student</th>
                <th class="p-4">Historical</th>
                <th class="p-4">System</th>
                <th class="p-4">Total Arrears</th>
                <th class="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="row in rows"
                :key="row.student_id"
                class="hover:bg-slate-50"
              >
                <td class="p-4">
                  <p class="font-semibold text-slate-900">
                    {{ row.student_name }}
                  </p>
                  <p class="mt-1 text-xs text-slate-500">
                    {{ row.admission_number }}
                  </p>
                </td>

                <td class="p-4">
                  {{ money(row.legacy_arrears) }}
                </td>

                <td class="p-4">
                  {{ money(row.system_arrears) }}
                </td>

                <td class="p-4 font-bold text-slate-900">
                  {{ money(row.total_arrears) }}
                </td>

                <td class="p-4 text-right">
                  <button
                    class="font-medium text-blue-700 hover:underline"
                    @click="showStudent(row.student_id)"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- MOBILE CARDS -->
        <div class="divide-y divide-slate-100 md:hidden">
          <article
            v-for="row in rows"
            :key="row.student_id"
            class="space-y-3 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="font-semibold text-slate-900">
                  {{ row.student_name }}
                </h3>
                <p class="mt-1 text-xs text-slate-500">
                  {{ row.admission_number }}
                </p>
              </div>

              <p class="shrink-0 text-sm font-bold text-slate-900">
                {{ money(row.total_arrears) }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-xs">
              <div>
                <p class="text-slate-500">Historical</p>
                <p class="mt-1 font-semibold text-amber-700">
                  {{ money(row.legacy_arrears) }}
                </p>
              </div>

              <div>
                <p class="text-slate-500">System</p>
                <p class="mt-1 font-semibold text-blue-700">
                  {{ money(row.system_arrears) }}
                </p>
              </div>
            </div>

            <button
              class="text-sm font-medium text-blue-700"
              @click="showStudent(row.student_id)"
            >
              View Arrears History
            </button>
          </article>
        </div>

        <div
          v-if="!rows.length"
          class="p-10 text-center text-sm text-slate-500"
        >
          No arrears found.
        </div>

      </template>

      <!-- PAGINATION -->
      <footer class="flex items-center justify-between gap-2 border-t p-4 text-sm">
        <span class="text-slate-500">
          Page {{ page }} of {{ pages }}
        </span>

        <div class="flex gap-2">
          <button
            :class="secondaryButtonClass"
            :disabled="page <= 1 || loading"
            @click="page--"
          >
            Previous
          </button>

          <button
            :class="secondaryButtonClass"
            :disabled="page >= pages || loading"
            @click="page++"
          >
            Next
          </button>
        </div>
      </footer>
    </section>

    <!-- HISTORICAL DEBT REGISTER -->
    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      <!-- Section heading -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">

        <div>
          <h2 class="font-semibold text-slate-900">
            Historical Debt Register
          </h2>

          <p class="mt-1 text-xs text-slate-500">
            Review recorded, approved and voided historical debts.
          </p>
        </div>

        <button
          class="text-sm font-medium text-blue-700 hover:underline"
          @click="loadLegacy"
        >
          Refresh
        </button>
      </div>

      <!-- Independent search and filters -->
      <div class="space-y-3 border-b border-slate-100 p-4 sm:p-5">

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div class="w-full sm:max-w-md">
            <input
              v-model="legacySearch"
              type="search"
              :class="fieldClass"
              placeholder="Search name, admission number or reference..."
            />
          </div>

          <button
            v-if="legacySearch"
            :class="secondaryButtonClass"
            @click="legacySearch = ''"
          >
            Clear
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="tab in ['pending', 'approved', 'voided', 'all']"
            :key="tab"
            class="rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors"
            :class="legacyTab === tab
              ? 'bg-blue-100 text-blue-800'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            @click="legacyTab = tab"
          >
            {{ tab }}
          </button>

          <span class="ml-auto text-xs text-slate-400">
            {{ visibleLegacy.length }} records
          </span>
        </div>

      </div>

      <div
        v-if="legacyLoading"
        class="p-10 text-center text-sm text-slate-500"
      >
        Loading historical records...
      </div>

      <!-- Historical debt records -->
      <div v-else class="divide-y divide-slate-100">

        <article
          v-for="item in visibleLegacy"
          :key="item.id"
          class="flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:p-5"
        >

          <!-- Student and arrear details -->
          <div class="min-w-0 flex-1 space-y-2">

            <div class="flex flex-wrap items-center gap-2">

              <!-- Student name -->
              <p class="text-sm font-semibold text-slate-900 sm:text-base">
                {{ item.student_name || 'Unknown Student' }}
              </p>

              <!-- Admission number -->
              <span class="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {{ item.admission_number || 'No admission number' }}
              </span>

              <!-- Status -->
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusClass(item)"
              >
                {{ statusLabel(item) }}
              </span>
            </div>

            <!-- Historical record metadata -->
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">

              <span>
                {{ item.term_label }}, {{ item.academic_year }}
              </span>

              <span class="capitalize">
                {{ item.category === 'fees' ? 'School Fees' : 'Transport' }}
              </span>

              <span class="break-all">
                Ref: {{ item.source_reference || '—' }}
              </span>
            </div>

            <!-- Outstanding amount -->
            <div class="flex flex-wrap items-baseline gap-2">
              <span class="text-xs text-slate-500">
                Outstanding
              </span>

              <span
                class="text-lg font-bold"
                :class="item.is_void ? 'text-slate-400' : 'text-slate-900'"
              >
                {{ money(item.balance_due) }}
              </span>
            </div>

          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-2 sm:justify-end">

            <button
              v-if="!item.approved_at && !item.is_void"
              :class="primaryButtonClass"
              :disabled="busy"
              @click="approve(item)"
            >
              Approve
            </button>

            <button
              v-if="!item.is_void"
              :class="secondaryButtonClass"
              :disabled="busy"
              @click="startVoid(item)"
            >
              Void
            </button>

            <button
              :class="secondaryButtonClass"
              @click="showStudent(item.student)"
            >
              History
            </button>

          </div>
        </article>

        <div
          v-if="!visibleLegacy.length"
          class="p-10 text-center text-sm text-slate-500"
        >
          <p class="font-medium text-slate-600">
            No historical arrears found.
          </p>
          <p class="mt-1 text-xs">
            Try a different student, admission number or status.
          </p>
        </div>

      </div>
    </section>

    <!-- MODAL -->
    <div
      v-if="modal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-2 sm:p-5"
      @click.self="closeModal"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="arrears-modal-title"
        class="flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >

        <header class="flex items-center justify-between border-b p-4">
          <h2 id="arrears-modal-title" class="text-lg font-bold">
            {{ modalTitles[modal] }}
          </h2>

          <button
            type="button"
            class="text-slate-500 hover:text-slate-900"
            aria-label="Close"
            @click="closeModal"
          >
            ✕
          </button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">

          <p
            v-if="modalError"
            class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {{ modalError }}
          </p>

          <!-- RECORD HISTORICAL ARREAR -->
          <form
            v-if="modal === 'record'"
            class="grid gap-4 sm:grid-cols-2"
            @submit.prevent="submitRecord"
          >

            <div class="sm:col-span-2">
              <label :class="labelClass">Student</label>

              <input
                v-model="studentSearch"
                :class="fieldClass"
                placeholder="Search by name or admission number"
                @input="scheduleStudentSearch"
              />

              <p
                v-if="studentLoading"
                class="mt-1 text-xs text-slate-500"
              >
                Searching...
              </p>

              <div
                v-if="studentChoices.length"
                class="mt-2 max-h-40 overflow-auto rounded-lg border"
              >
                <button
                  v-for="s in studentChoices"
                  :key="s.id"
                  type="button"
                  class="block w-full p-3 text-left text-sm hover:bg-slate-50"
                  @click="chooseStudent(s)"
                >
                  {{ studentLabel(s) }}
                </button>
              </div>

              <p
                v-if="record.student"
                class="mt-1 text-xs text-emerald-700"
              >
                Student selected
              </p>
            </div>

            <div>
              <label :class="labelClass">Source Reference</label>
              <input
                v-model.trim="record.source_reference"
                :class="fieldClass"
                required
                maxlength="100"
                placeholder="OPEN-2026-001"
              />
            </div>

            <div>
              <label :class="labelClass">Category</label>
              <select v-model="record.category" :class="fieldClass">
                <option value="fees">School Fees</option>
                <option value="transport">Transport</option>
              </select>
            </div>

            <div>
              <label :class="labelClass">Academic Year</label>
              <input
                v-model.trim="record.academic_year"
                :class="fieldClass"
                required
                placeholder="2026"
              />
            </div>

            <div>
              <label :class="labelClass">Historical Term</label>
              <input
                v-model.trim="record.term_label"
                :class="fieldClass"
                required
                placeholder="Term 2"
              />
            </div>

            <div class="sm:col-span-2">
              <label :class="labelClass">
                Outstanding Amount (KES)
              </label>
              <input
                v-model="record.amount_due"
                type="number"
                min="0.01"
                step="0.01"
                required
                :class="fieldClass"
              />
            </div>

            <div class="sm:col-span-2">
              <label :class="labelClass">Description</label>
              <textarea
                v-model="record.description"
                rows="3"
                :class="fieldClass"
              ></textarea>
            </div>

            <p class="text-xs text-amber-700 sm:col-span-2">
              This historical arrear will require approval before payment allocation.
            </p>

            <div class="flex justify-end gap-2 sm:col-span-2">
              <button
                type="button"
                :class="secondaryButtonClass"
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="submit"
                :class="primaryButtonClass"
                :disabled="busy || !record.student"
              >
                {{ busy ? 'Saving...' : 'Record Arrear' }}
              </button>
            </div>

          </form>

          <!-- IMPORT -->
          <form
            v-else-if="modal === 'import'"
            class="space-y-4"
            @submit.prevent="submitImport"
          >
            <p class="text-sm text-slate-600">
              Upload a CSV containing historical arrears.
              Existing matching source references will be skipped.
            </p>

            <button
              type="button"
              class="text-sm font-medium text-blue-700 hover:underline"
              @click="downloadTemplate"
            >
              Download CSV Template
            </button>

            <input
              type="file"
              accept=".csv,text/csv"
              :class="fieldClass"
              @change="csvFile = $event.target.files?.[0] || null"
            />

            <p
              v-if="importResult"
              class="text-sm text-emerald-700"
            >
              Imported: {{ importResult.imported ?? 0 }} ·
              Skipped: {{ importResult.skipped ?? 0 }}
            </p>

            <div class="flex justify-end gap-2">
              <button
                type="button"
                :class="secondaryButtonClass"
                @click="closeModal"
              >
                Close
              </button>

              <button
                type="submit"
                :class="primaryButtonClass"
                :disabled="busy || !csvFile"
              >
                {{ busy ? 'Importing...' : 'Import' }}
              </button>
            </div>
          </form>

          <!-- VOID -->
          <form
            v-else-if="modal === 'void'"
            class="space-y-4"
            @submit.prevent="confirmVoid"
          >
            <p class="text-sm">
              Void historical arrear
              <strong>{{ voidTarget?.source_reference }}</strong>?
            </p>

            <p class="text-xs text-slate-500">
              Voiding excludes the debt from outstanding balances
              while preserving the historical record.
            </p>

            <label :class="labelClass">Reason</label>

            <textarea
              v-model.trim="voidReason"
              :class="fieldClass"
              rows="3"
              required
              placeholder="Explain why this arrear is being voided..."
            ></textarea>

            <div class="flex justify-end gap-2">
              <button
                type="button"
                :class="secondaryButtonClass"
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="submit"
                :class="primaryButtonClass"
                :disabled="busy || !voidReason"
              >
                Confirm Void
              </button>
            </div>
          </form>

          <!-- STUDENT HISTORY -->
          <div
            v-else-if="modal === 'student'"
            class="space-y-4"
          >
            <p v-if="detailLoading" class="text-sm text-slate-500">
              Loading history...
            </p>

            <template v-else-if="detail">

              <div class="rounded-xl bg-slate-50 p-4">
                <p class="font-semibold">
                  {{ detail.student?.name }}
                </p>

                <p class="mt-1 text-xs text-slate-500">
                  {{ detail.student?.admission_number }}
                </p>

                <p class="mt-3 text-xs text-slate-500">
                  Total Outstanding
                </p>

                <p class="text-2xl font-bold text-slate-900">
                  {{ money(detail.total_arrears) }}
                </p>
              </div>

              <h3 class="font-semibold text-slate-900">
                Arrears Breakdown
              </h3>

              <article
                v-for="item in detail.items || []"
                :key="`${item.source}-${item.category}-${item.id}`"
                class="rounded-lg border border-slate-200 p-3"
              >
                <div class="flex flex-wrap justify-between gap-2">
                  <p class="font-semibold">
                    {{ item.term || item.term_label }},
                    {{ item.academic_year }}
                  </p>

                  <span class="text-xs capitalize text-slate-500">
                    {{ item.source }} · {{ item.category }}
                  </span>
                </div>

                <p class="mt-1 text-xs text-slate-500">
                  {{ item.description }}
                </p>

                <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p class="text-slate-500">Original</p>
                    <p class="font-semibold">
                      {{ money(item.amount_due) }}
                    </p>
                  </div>

                  <div>
                    <p class="text-slate-500">Paid</p>
                    <p class="font-semibold text-emerald-700">
                      {{ money(item.amount_paid) }}
                    </p>
                  </div>

                  <div>
                    <p class="text-slate-500">Balance</p>
                    <p class="font-bold">
                      {{ money(item.balance) }}
                    </p>
                  </div>
                </div>
              </article>

              <p
                v-if="!detail.items?.length"
                class="text-sm text-slate-500"
              >
                No historical obligations found.
              </p>

              <h3 class="font-semibold text-slate-900">
                Payment History
              </h3>

              <article
                v-for="allocation in detail.payment_history || []"
                :key="allocation.id"
                class="flex justify-between gap-3 border-b border-slate-100 py-2 text-sm"
              >
                <div>
                  <p>
                    {{ allocation.date }} · {{ allocation.method }}
                  </p>

                  <p class="text-xs text-slate-500">
                    {{ allocation.transaction_code || 'No reference' }}
                  </p>
                </div>

                <p class="font-semibold text-emerald-700">
                  {{ money(allocation.amount) }}
                </p>
              </article>

              <p
                v-if="!detail.payment_history?.length"
                class="text-sm text-slate-500"
              >
                No payments allocated to these obligations.
              </p>

            </template>
          </div>

        </div>
      </section>
    </div>

  </main>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
} from 'vue'

import {
  getArrearsOverview,
  getStudentArrears,
  getLegacyArrears,
  createLegacyArrear,
  importLegacyArrears,
  approveLegacyArrear,
  voidLegacyArrear,
  searchArrearsStudents,
} from '../api/arrears'


// SHARED STYLING
const fieldClass =
  'block w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

const labelClass =
  'mb-1.5 block text-xs font-semibold text-slate-600'

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50'

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'


// HELPERS
const money = value =>
  `KES ${Number(value || 0).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const getError = error => {
  const data = error?.response?.data

  if (typeof data?.detail === 'string') {
    return data.detail
  }

  if (data?.errors) {
    return JSON.stringify(data.errors)
  }

  if (data && typeof data === 'object') {
    return JSON.stringify(data)
  }

  return error?.message || 'Request failed'
}

function statusLabel(item) {
  if (item.is_void) return 'Voided'
  if (item.approved_at) return 'Approved'
  return 'Pending'
}

function statusClass(item) {
  if (item.is_void) {
    return 'bg-red-50 text-red-700'
  }

  if (item.approved_at) {
    return 'bg-emerald-50 text-emerald-700'
  }

  return 'bg-amber-50 text-amber-700'
}


// STUDENT ARREARS REGISTER
const rows = ref([])
const summary = ref({})
const totalCount = ref(0)
const pageSize = ref(25)
const page = ref(1)

const search = ref('')
const source = ref('all')
const category = ref('all')

const loading = ref(false)
const error = ref('')
const notice = ref('')

const pages = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / pageSize.value))
)

const stats = computed(() => [
  {
    label: 'Total Outstanding',
    value: money(summary.value.total_arrears),
    color: 'text-slate-900',
  },
  {
    label: 'Historical Arrears',
    value: money(summary.value.legacy_arrears),
    color: 'text-amber-700',
  },
  {
    label: 'System Arrears',
    value: money(summary.value.system_arrears),
    color: 'text-blue-700',
  },
  {
    label: 'Students with Arrears',
    value: summary.value.students_with_arrears ?? 0,
    color: 'text-violet-700',
  },
])

let overviewRequest = 0

async function loadOverview() {
  const requestId = ++overviewRequest

  loading.value = true
  error.value = ''

  try {
    const data = await getArrearsOverview({
      page: page.value,
      search: search.value.trim(),
      source: source.value,
      category: category.value,
    })

    if (requestId !== overviewRequest) return

    rows.value = data.results || []
    summary.value = data.summary || {}
    totalCount.value = data.count || 0
    pageSize.value = data.page_size || 25

  } catch (e) {
    if (requestId === overviewRequest) {
      error.value = getError(e)
    }

  } finally {
    if (requestId === overviewRequest) {
      loading.value = false
    }
  }
}


// HISTORICAL DEBT REGISTER
const legacy = ref([])
const legacyLoading = ref(false)
const legacyTab = ref('pending')
const legacySearch = ref('')

const visibleLegacy = computed(() => {
  const query = legacySearch.value.trim().toLowerCase()

  return legacy.value.filter(item => {
    const matchesStatus =
      legacyTab.value === 'all' ||
      (legacyTab.value === 'voided' && item.is_void) ||
      (
        legacyTab.value === 'approved' &&
        !item.is_void &&
        !!item.approved_at
      ) ||
      (
        legacyTab.value === 'pending' &&
        !item.is_void &&
        !item.approved_at
      )

    if (!matchesStatus) return false

    if (!query) return true

    const searchable = [
      item.student_name,
      item.admission_number,
      item.source_reference,
      item.academic_year,
      item.term_label,
      item.category,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(query)
  })
})

async function loadLegacy() {
  legacyLoading.value = true

  try {
    const data = await getLegacyArrears()

    legacy.value = Array.isArray(data)
      ? data
      : data.results || []

  } catch (e) {
    error.value = getError(e)

  } finally {
    legacyLoading.value = false
  }
}

async function reload() {
  await Promise.all([
    loadOverview(),
    loadLegacy(),
  ])
}

function resetFilters() {
  search.value = ''
  source.value = 'all'
  category.value = 'all'
  page.value = 1
}

let searchTimer

watch([search, source, category], () => {
  const wasFirstPage = page.value === 1
  page.value = 1

  clearTimeout(searchTimer)

  if (!wasFirstPage) return

  searchTimer = setTimeout(loadOverview, 300)
})

watch(page, loadOverview)


// MODAL STATE
const modal = ref('')
const modalError = ref('')
const busy = ref(false)

const modalTitles = {
  record: 'Record Historical Arrear',
  import: 'Import Arrears',
  void: 'Void Arrear',
  student: 'Student Arrears History',
}

function closeModal() {
  if (busy.value) return

  modal.value = ''
  modalError.value = ''
}


// MANUAL RECORDING
const emptyRecord = () => ({
  student: null,
  source_reference: '',
  academic_year: '',
  term_label: '',
  category: 'fees',
  amount_due: '',
  description: '',
})

const record = ref(emptyRecord())

const studentSearch = ref('')
const studentChoices = ref([])
const studentLoading = ref(false)

let studentTimer
let studentRequest = 0

function studentLabel(student) {
  const name =
    student.name ||
    student.full_name ||
    [
      student.first_name,
      student.last_name,
    ].filter(Boolean).join(' ')

  return `${name} · ${student.admission_number || student.id}`
}

function chooseStudent(student) {
  record.value.student = student.id
  studentSearch.value = studentLabel(student)
  studentChoices.value = []
  studentRequest++
}

function scheduleStudentSearch() {
  record.value.student = null
  studentRequest++
  clearTimeout(studentTimer)

  const query = studentSearch.value.trim()

  if (query.length < 2) {
    studentChoices.value = []
    studentLoading.value = false
    return
  }

  studentTimer = setTimeout(async () => {
    const id = ++studentRequest
    studentLoading.value = true

    try {
      const data = await searchArrearsStudents(query)

      if (id === studentRequest) {
        studentChoices.value = Array.isArray(data)
          ? data
          : data.results || []
      }

    } catch (e) {
      if (id === studentRequest) {
        modalError.value = getError(e)
      }

    } finally {
      if (id === studentRequest) {
        studentLoading.value = false
      }
    }
  }, 300)
}

function openRecord() {
  record.value = emptyRecord()
  studentSearch.value = ''
  studentChoices.value = []
  modalError.value = ''
  modal.value = 'record'
}

async function submitRecord() {
  if (!record.value.student) return

  busy.value = true
  modalError.value = ''

  try {
    await createLegacyArrear(record.value)

    modal.value = ''
    notice.value =
      'Historical arrear recorded and pending approval.'

    await reload()

  } catch (e) {
    modalError.value = getError(e)

  } finally {
    busy.value = false
  }
}


// CSV IMPORT
const csvFile = ref(null)
const importResult = ref(null)

function openImport() {
  csvFile.value = null
  importResult.value = null
  modalError.value = ''
  modal.value = 'import'
}

function downloadTemplate() {
  const csv =
    'student,source_reference,academic_year,term_label,category,amount_due,description\n'

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'legacy_arrears_template.csv'
  link.click()

  URL.revokeObjectURL(url)
}

async function submitImport() {
  if (!csvFile.value) return

  busy.value = true
  modalError.value = ''

  try {
    importResult.value =
      await importLegacyArrears(csvFile.value)

    notice.value = 'Historical arrears import completed.'

    await reload()

  } catch (e) {
    modalError.value = getError(e)

  } finally {
    busy.value = false
  }
}


// APPROVAL
async function approve(item) {
  if (
    !window.confirm(
      `Approve arrear ${item.source_reference}?`
    )
  ) {
    return
  }

  busy.value = true
  error.value = ''

  try {
    await approveLegacyArrear(item.id)

    notice.value = 'Historical arrear approved.'

    await reload()

  } catch (e) {
    error.value = getError(e)

  } finally {
    busy.value = false
  }
}


// VOIDING
const voidTarget = ref(null)
const voidReason = ref('')

function startVoid(item) {
  voidTarget.value = item
  voidReason.value = ''
  modalError.value = ''
  modal.value = 'void'
}

async function confirmVoid() {
  if (!voidTarget.value || !voidReason.value) return

  busy.value = true
  modalError.value = ''

  try {
    await voidLegacyArrear(
      voidTarget.value.id,
      voidReason.value
    )

    modal.value = ''
    notice.value = 'Historical arrear voided.'

    await reload()

  } catch (e) {
    modalError.value = getError(e)

  } finally {
    busy.value = false
  }
}


// STUDENT ARREARS HISTORY
const detail = ref(null)
const detailLoading = ref(false)

let detailRequest = 0

async function showStudent(studentId) {
  const id = ++detailRequest

  detail.value = null
  detailLoading.value = true
  modalError.value = ''
  modal.value = 'student'

  try {
    const data = await getStudentArrears(studentId)

    if (id === detailRequest) {
      detail.value = data
    }

  } catch (e) {
    if (id === detailRequest) {
      modalError.value = getError(e)
    }

  } finally {
    if (id === detailRequest) {
      detailLoading.value = false
    }
  }
}


// LIFECYCLE
onMounted(reload)

onUnmounted(() => {
  clearTimeout(searchTimer)
  clearTimeout(studentTimer)
})
</script>

