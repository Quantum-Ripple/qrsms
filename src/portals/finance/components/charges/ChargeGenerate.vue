<template>
  <div class="space-y-4 p-3 sm:space-y-6 sm:p-6">
    <!-- Toolbar -->
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-4">
        <label class="sr-only" for="cg-term">Term</label>
        <select id="cg-term" v-model="selectedTerm" class="w-full rounded border px-3 py-2 sm:w-auto">
          <option value="" disabled>Select term</option>
          <option v-for="t in terms" :key="t.id" :value="t.id">{{ termLabel(t) }}</option>
        </select>

        <label class="sr-only" for="cg-class">Class</label>
        <select id="cg-class" v-model="selectedClass" class="w-full rounded border px-3 py-2 sm:w-auto">
          <option value="" disabled>Select class</option>
          <option v-for="cls in classLevels" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
        </select>

        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="applyCredit" type="checkbox" class="rounded border" @change="loadPreview" />
          Apply available credit
        </label>
      </div>

      <button
        @click="openGenerate"
        :disabled="!canGenerate"
        class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
      >
        Generate invoices{{ selectedRows.length ? ` (${selectedRows.length})` : '' }}
      </button>
    </div>

    <!-- Notices -->
    <p v-if="pageError" class="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ pageError }}</p>

    <div
      v-if="notice"
      class="rounded border p-3 text-sm"
      :class="{
        'border-green-200 bg-green-50 text-green-800': notice.tone === 'success',
        'border-amber-200 bg-amber-50 text-amber-900': notice.tone === 'warning',
        'border-blue-200 bg-blue-50 text-blue-900': notice.tone === 'info',
      }"
    >
      <div class="flex items-start justify-between gap-3">
        <p class="font-medium">{{ notice.title }}</p>
        <button @click="notice = null" class="shrink-0 text-gray-500 hover:text-gray-800" aria-label="Dismiss">Dismiss</button>
      </div>
      <ul class="mt-1 list-disc space-y-0.5 pl-5">
        <li v-for="(line, i) in notice.lines" :key="i">{{ line }}</li>
      </ul>
      <button v-if="notice.batchId" @click="scrollToBatch(notice.batchId)" class="mt-2 font-medium underline">
        View batch #{{ notice.batchId }}
      </button>
    </div>

    <div v-if="preview?.blockers?.length" class="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <p class="font-medium">This class can't be billed yet</p>
      <ul class="mt-1 list-disc space-y-0.5 pl-5">
        <li v-for="(b, i) in preview.blockers" :key="i">{{ typeof b === 'string' ? b : b.detail ?? b.message ?? JSON.stringify(b) }}</li>
      </ul>
    </div>

    <!-- Summary -->
    <dl v-if="preview" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded border p-3">
        <dt class="text-sm text-gray-500">To invoice</dt>
        <dd class="text-lg font-semibold">{{ selectedRows.length }} <span class="text-sm font-normal text-gray-500">of {{ eligible.length }}</span></dd>
      </div>
      <div class="rounded border p-3">
        <dt class="text-sm text-gray-500">Total billed</dt>
        <dd class="text-lg font-semibold">{{ formatCurrency(totals.total) }}</dd>
      </div>
      <div class="rounded border p-3">
        <dt class="text-sm text-gray-500">Credit applied</dt>
        <dd class="text-lg font-semibold">{{ formatCurrency(totals.credit) }}</dd>
      </div>
      <div class="rounded border p-3">
        <dt class="text-sm text-gray-500">Net payable</dt>
        <dd class="text-lg font-semibold">{{ formatCurrency(totals.net) }}</dd>
      </div>
    </dl>

    <p v-if="invoicedCount" class="text-sm text-gray-600">
      {{ invoicedCount }} {{ invoicedCount === 1 ? 'student is' : 'students are' }} already invoiced for this term and won't be billed again.
    </p>

    <!-- Preview: desktop -->
    <div class="hidden overflow-x-auto rounded border md:block">
      <table class="w-full border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-10 p-3">
              <input
                type="checkbox"
                class="rounded border"
                :checked="allSelected"
                :disabled="!eligible.length"
                aria-label="Select all students"
                @change="toggleAll"
              />
            </th>
            <th class="p-3 text-left">Student</th>
            <th class="p-3 text-left">Status</th>
            <th class="p-3 text-right">Total</th>
            <th class="p-3 text-right">Credit</th>
            <th class="p-3 text-right">Net payable</th>
            <th class="p-3 text-center">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="7" class="p-4 text-center text-gray-500">Loading preview...</td></tr>

          <template v-for="row in eligible" :key="row.student_id">
            <tr class="border-t hover:bg-gray-50">
              <td class="p-3 text-center">
                <input type="checkbox" class="rounded border" :value="row.student_id" v-model="selectedIds" :aria-label="`Select ${row.name}`" />
              </td>
              <td class="p-3">
                <div class="font-medium">{{ row.name }}</div>
                <div class="text-sm text-gray-500">{{ row.admission_number }}</div>
              </td>
              <td class="p-3">
                <span class="rounded px-2 py-0.5 text-xs font-medium" :class="row.status === 'changed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                  {{ row.status === 'changed' ? 'Changed' : 'Ready' }}
                </span>
                <span v-if="row.issues?.length" class="ml-2 text-xs font-medium text-amber-700">
                  {{ row.issues.length }} {{ row.issues.length === 1 ? 'issue' : 'issues' }}
                </span>
              </td>
              <td class="p-3 text-right">{{ formatCurrency(row.total) }}</td>
              <td class="p-3 text-right">{{ formatCurrency(row.credit_applied) }}</td>
              <td class="p-3 text-right font-medium">{{ formatCurrency(row.net_payable) }}</td>
              <td class="p-3 text-center">
                <button @click="toggleExpanded(row.student_id)" class="text-blue-600 hover:underline">
                  {{ expanded.has(row.student_id) ? 'Hide' : 'View' }}
                </button>
              </td>
            </tr>
            <tr v-if="expanded.has(row.student_id)" class="border-t bg-gray-50">
              <td colspan="7" class="p-4"><StudentBillDetail :row="row" /></td>
            </tr>
          </template>

          <tr v-if="!loading && !eligible.length"><td colspan="7" class="p-4 text-center text-gray-500">{{ emptyText }}</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Preview: mobile -->
    <div class="space-y-3 md:hidden">
      <p v-if="loading" class="rounded-lg border bg-white p-6 text-center text-gray-500">Loading preview...</p>

      <article v-for="row in eligible" :key="row.student_id" class="rounded-lg border bg-white p-4 shadow-sm">
        <div class="flex items-start gap-3">
          <input type="checkbox" class="mt-1 rounded border" :value="row.student_id" v-model="selectedIds" :aria-label="`Select ${row.name}`" />
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <h2 class="min-w-0 break-words font-semibold text-gray-900">{{ row.name }}</h2>
              <span class="shrink-0 font-semibold text-gray-900">{{ formatCurrency(row.net_payable) }}</span>
            </div>
            <p class="text-sm text-gray-500">{{ row.admission_number }}</p>
          </div>
        </div>

        <p v-if="row.issues?.length" class="mt-2 text-sm font-medium text-amber-700">
          {{ row.issues.length }} {{ row.issues.length === 1 ? 'issue' : 'issues' }} to review
        </p>

        <button
          @click="toggleExpanded(row.student_id)"
          class="mt-4 w-full rounded border border-blue-200 px-3 py-2 font-medium text-blue-700 hover:bg-blue-50"
        >
          {{ expanded.has(row.student_id) ? 'Hide bill' : 'View bill' }}
        </button>
        <div v-if="expanded.has(row.student_id)" class="mt-3"><StudentBillDetail :row="row" /></div>
      </article>

      <div v-if="!loading && !eligible.length" class="rounded-lg border bg-white p-6 text-center text-gray-500">{{ emptyText }}</div>
    </div>

    <!-- Batch history -->
    <section class="space-y-3 pt-2">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-lg font-semibold">Invoice batches</h2>
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="onlyThisClass" type="checkbox" class="rounded border" />
          Only the selected term and class
        </label>
      </div>

      <p v-if="batchError" class="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ batchError }}</p>

      <div class="hidden overflow-x-auto rounded border md:block">
        <table class="w-full border-collapse">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-left">Batch</th>
              <th class="p-3 text-left">Term</th>
              <th class="p-3 text-left">Class</th>
              <th class="p-3 text-left">Created</th>
              <th class="p-3 text-right">Invoices</th>
              <th class="p-3 text-right">Total</th>
              <th class="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="batchLoading"><td colspan="7" class="p-4 text-center text-gray-500">Loading batches...</td></tr>
            <tr
              v-for="b in visibleBatches"
              :key="b.id"
              :data-batch="b.id"
              class="border-t hover:bg-gray-50"
              :class="b.id === highlightId ? 'bg-blue-50' : ''"
            >
              <td class="p-3 font-medium">#{{ b.id }}</td>
              <td class="p-3">{{ b.term_name }}</td>
              <td class="p-3">{{ b.class_level_name }}</td>
              <td class="p-3">
                <div>{{ formatDate(b.created_at) }}</div>
                <div class="text-sm text-gray-500">{{ b.created_by_name }}</div>
              </td>
              <td class="p-3 text-right">{{ b.invoice_count }}</td>
              <td class="p-3 text-right font-medium">{{ formatCurrency(b.total_amount) }}</td>
              <td class="p-3 text-center">
                <span v-if="b.undone_at" class="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                  Undone {{ formatDate(b.undone_at) }}
                </span>
                <button v-else @click="openUndo(b)" class="text-red-600 hover:underline">Undo</button>
              </td>
            </tr>
            <tr v-if="!batchLoading && !visibleBatches.length">
              <td colspan="7" class="p-4 text-center text-gray-500">No invoice batches yet.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="space-y-3 md:hidden">
        <p v-if="batchLoading" class="rounded-lg border bg-white p-6 text-center text-gray-500">Loading batches...</p>

        <article
          v-for="b in visibleBatches"
          :key="b.id"
          :data-batch="b.id"
          class="rounded-lg border bg-white p-4 shadow-sm"
          :class="b.id === highlightId ? 'border-blue-300 bg-blue-50' : ''"
        >
          <div class="flex items-start justify-between gap-3">
            <h3 class="min-w-0 break-words font-semibold text-gray-900">#{{ b.id }} · {{ b.class_level_name }}</h3>
            <span class="shrink-0 font-semibold text-gray-900">{{ formatCurrency(b.total_amount) }}</span>
          </div>
          <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt class="text-gray-500">Term</dt>
              <dd class="mt-0.5 break-words font-medium text-gray-800">{{ b.term_name }}</dd>
            </div>
            <div>
              <dt class="text-gray-500">Invoices</dt>
              <dd class="mt-0.5 font-medium text-gray-800">{{ b.invoice_count }}</dd>
            </div>
            <div class="col-span-2">
              <dt class="text-gray-500">Created</dt>
              <dd class="mt-0.5 font-medium text-gray-800">{{ formatDate(b.created_at) }} · {{ b.created_by_name }}</dd>
            </div>
          </dl>
          <p v-if="b.undone_at" class="mt-3 text-sm font-medium text-gray-600">Undone {{ formatDate(b.undone_at) }}</p>
          <button
            v-else
            @click="openUndo(b)"
            class="mt-4 w-full rounded border border-red-200 px-3 py-2 font-medium text-red-700 hover:bg-red-50"
          >
            Undo batch
          </button>
        </article>

        <div v-if="!batchLoading && !visibleBatches.length" class="rounded-lg border bg-white p-6 text-center text-gray-500">
          No invoice batches yet.
        </div>
      </div>
    </section>

    <!-- Confirm generate -->
    <div v-if="generateModal" class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" @click.self="closeGenerate">
      <div class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:max-w-md sm:rounded-lg sm:p-6">
        <h2 class="text-lg font-semibold">Generate invoices</h2>
        <p class="text-sm text-gray-500">{{ currentClassName }} · {{ currentTermName }}</p>

        <dl class="mt-4 divide-y rounded border text-sm">
          <div class="flex justify-between gap-3 p-3"><dt class="text-gray-600">Students</dt><dd class="font-medium">{{ selectedRows.length }}</dd></div>
          <div class="flex justify-between gap-3 p-3"><dt class="text-gray-600">Total billed</dt><dd class="font-medium">{{ formatCurrency(totals.total) }}</dd></div>
          <div class="flex justify-between gap-3 p-3"><dt class="text-gray-600">Credit</dt><dd class="font-medium">{{ applyCredit ? formatCurrency(totals.credit) + ' applied' : 'Not applied' }}</dd></div>
          <div class="flex justify-between gap-3 p-3"><dt class="text-gray-600">Net payable</dt><dd class="font-semibold">{{ formatCurrency(totals.net) }}</dd></div>
        </dl>

        <p v-if="issueCount" class="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {{ issueCount }} {{ issueCount === 1 ? 'student has' : 'students have' }} open issues in this preview. You can still generate, but review them first.
        </p>
        <p class="mt-3 text-xs text-gray-500">
          The server recalculates when you confirm, so final figures can differ if someone else changed bills in the meantime.
        </p>

        <p v-if="modalError" class="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ modalError }}</p>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" @click="closeGenerate" class="w-full rounded border px-4 py-2 hover:bg-gray-50 sm:w-auto">Cancel</button>
          <button
            type="button"
            :disabled="working"
            @click="submitGenerate"
            class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
          >
            {{ working ? 'Generating...' : 'Generate invoices' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm undo -->
    <div v-if="undoTarget" class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" @click.self="closeUndo">
      <div class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:max-w-md sm:rounded-lg sm:p-6">
        <h2 class="text-lg font-semibold">Undo batch #{{ undoTarget.id }}?</h2>
        <p class="mt-2 text-sm text-gray-700">
          This removes {{ undoTarget.invoice_count }} {{ undoTarget.invoice_count === 1 ? 'invoice' : 'invoices' }}
          ({{ formatCurrency(undoTarget.total_amount) }}) for {{ undoTarget.class_level_name }}, {{ undoTarget.term_name }},
          created {{ formatDate(undoTarget.created_at) }}. Credit applied by this batch is returned to the students.
        </p>
        <p class="mt-2 text-sm text-gray-700">
          It can't be undone if any invoice has payment activity, including an M-Pesa transaction. Use invoice adjustments for those instead.
        </p>

        <p v-if="modalError" class="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ modalError }}</p>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" @click="closeUndo" class="w-full rounded border px-4 py-2 hover:bg-gray-50 sm:w-auto">Keep batch</button>
          <button
            type="button"
            :disabled="working"
            @click="submitUndo"
            class="w-full rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60 sm:w-auto"
          >
            {{ working ? 'Undoing...' : 'Undo batch' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import {
  getChargePreview,
  generateInvoices,
  getInvoiceBatches,
  undoInvoiceBatch,
  unwrapList,
  errorMessage,
} from '../../api/charge'
import { listTerms } from '../../api/term'
import { getClassLevels } from '@/api/classes'
import StudentBillDetail from './StudentBillDetail.vue'
import { useBillingContext } from '../../composables/useBillingContext'

const terms = ref([])
const classLevels = ref([])
const { term: selectedTerm, classLevel: selectedClass } = useBillingContext()
const applyCredit = ref(true)

const preview = ref(null)
const loading = ref(false)
const pageError = ref('')
const notice = ref(null)
const selectedIds = ref([])
const expanded = ref(new Set())

// ---------- helpers ----------
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(Number(value || 0))

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }) : ''

const termLabel = (t) => [t.name, t.academic_year_name ?? t.academic_year].filter(Boolean).join(' · ')
const currentTermName = computed(() => {
  const t = terms.value.find((x) => x.id === selectedTerm.value)
  return t ? termLabel(t) : ''
})
const currentClassName = computed(() => classLevels.value.find((c) => c.id === selectedClass.value)?.name ?? '')

// ---------- preview ----------
const students = computed(() => preview.value?.students ?? [])
const eligible = computed(() => students.value.filter((s) => s.status !== 'invoiced'))
const invoicedCount = computed(() => students.value.length - eligible.value.length)
const selectedRows = computed(() => eligible.value.filter((s) => selectedIds.value.includes(s.student_id)))
const allSelected = computed(() => eligible.value.length > 0 && selectedRows.value.length === eligible.value.length)
const issueCount = computed(() => selectedRows.value.filter((s) => s.issues?.length).length)

const totals = computed(() => ({
  total: selectedRows.value.reduce((n, s) => n + Number(s.total || 0), 0),
  credit: selectedRows.value.reduce((n, s) => n + Number(s.credit_applied || 0), 0),
  net: selectedRows.value.reduce((n, s) => n + Number(s.net_payable || 0), 0),
}))

const canGenerate = computed(
  () => !!preview.value && !preview.value.blockers?.length && selectedRows.value.length > 0 && !loading.value,
)

const emptyText = computed(() => {
  if (!selectedTerm.value || !selectedClass.value) return 'Select a term and class to preview the bills.'
  if (preview.value?.blockers?.length) return 'Resolve the issue above to preview the bills.'
  if (invoicedCount.value) return 'Every student in this class is already invoiced for this term.'
  return 'No enrolled students found for this class and term.'
})

const loadPreview = async () => {
  if (!selectedTerm.value || !selectedClass.value) {
    preview.value = null
    selectedIds.value = []
    return
  }
  loading.value = true
  pageError.value = ''
  try {
    preview.value = await getChargePreview({
      term: selectedTerm.value,
      class_level: selectedClass.value,
      apply_credit: applyCredit.value,
    })
    // everyone eligible starts selected
    selectedIds.value = eligible.value.map((s) => s.student_id)
  } catch (err) {
    preview.value = null
    selectedIds.value = []
    pageError.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

watch([selectedTerm, selectedClass], () => {
  expanded.value = new Set()
  loadPreview()
})

const toggleAll = () => {
  selectedIds.value = allSelected.value ? [] : eligible.value.map((s) => s.student_id)
}

const toggleExpanded = (id) => {
  const next = new Set(expanded.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expanded.value = next
}

// ---------- batches ----------
const batches = ref([])
const batchLoading = ref(false)
const batchError = ref('')
const onlyThisClass = ref(true)
const highlightId = ref(null)

const visibleBatches = computed(() =>
  batches.value.filter((b) => {
    if (!onlyThisClass.value || !selectedTerm.value || !selectedClass.value) return true
    return b.term === selectedTerm.value && b.class_level === selectedClass.value
  }),
)

const loadBatches = async () => {
  batchLoading.value = true
  batchError.value = ''
  try {
    batches.value = unwrapList(await getInvoiceBatches())
  } catch (err) {
    batchError.value = errorMessage(err)
  } finally {
    batchLoading.value = false
  }
}

const scrollToBatch = async (id) => {
  highlightId.value = id
  await nextTick()
  const el = [...document.querySelectorAll(`[data-batch="${id}"]`)].find((e) => e.offsetParent !== null)
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// ---------- generate ----------
const generateModal = ref(false)
const working = ref(false)
const modalError = ref('')

const openGenerate = () => {
  modalError.value = ''
  generateModal.value = true
}
const closeGenerate = () => {
  if (!working.value) generateModal.value = false
}

const submitGenerate = async () => {
  working.value = true
  modalError.value = ''
  try {
    const payload = {
      term: selectedTerm.value,
      class_level: selectedClass.value,
      apply_credit: applyCredit.value,
    }
    // Omit student_ids when everyone eligible is selected so the server uses its own list
    if (selectedRows.value.length !== eligible.value.length) payload.student_ids = selectedIds.value

    const res = await generateInvoices(payload)
    generateModal.value = false

    if (res.status === 201 && res.created > 0) {
      const lines = [
        `${res.created} ${res.created === 1 ? 'invoice' : 'invoices'} created, total ${formatCurrency(res.total)}`,
        `Credit applied: ${formatCurrency(res.credit_applied)}`,
      ]
      if (res.skipped_already_invoiced) lines.push(`${res.skipped_already_invoiced} already invoiced, skipped`)
      notice.value = { tone: 'success', title: 'Invoices generated', lines, batchId: res.batch_id }
    } else {
      const lines = res.skipped_already_invoiced ? [`${res.skipped_already_invoiced} already invoiced, skipped`] : []
      notice.value = { tone: 'info', title: 'No new invoices were created', lines, batchId: null }
    }

    await Promise.all([loadPreview(), loadBatches()])
    if (res.batch_id) scrollToBatch(res.batch_id)
  } catch (err) {
    modalError.value =
      err?.response?.status === 409
        ? 'Another generation ran at the same time for this class. Nothing from this attempt was confirmed. Check the batch list, then refresh the preview.'
        : errorMessage(err)
  } finally {
    working.value = false
  }
}

// ---------- undo ----------
const undoTarget = ref(null)

const openUndo = (batch) => {
  modalError.value = ''
  undoTarget.value = batch
}
const closeUndo = () => {
  if (!working.value) undoTarget.value = null
}

const submitUndo = async () => {
  working.value = true
  modalError.value = ''
  try {
    const res = await undoInvoiceBatch(undoTarget.value.id)
    notice.value = {
      tone: 'success',
      title: `Batch #${undoTarget.value.id} undone`,
      lines: [`${res.undone} ${res.undone === 1 ? 'invoice' : 'invoices'} removed`],
      batchId: null,
    }
    undoTarget.value = null
    await Promise.all([loadPreview(), loadBatches()])
  } catch (err) {
    // 409 = already undone, or payment activity. Keep the modal open so the reason is visible.
    modalError.value =
      err?.response?.status === 409
        ? `Not undone. ${errorMessage(err)}`
        : errorMessage(err)
    if (err?.response?.status === 409) loadBatches()
  } finally {
    working.value = false
  }
}

// ---------- init ----------
// ---------- init ----------
onMounted(async () => {
  // 1. Check if a term was already set (e.g., extracted from the URL prior to mounting)
  const hadTerm = !!selectedTerm.value

  try {
    const [termData, classData] = await Promise.all([listTerms(), getClassLevels()])
    terms.value = unwrapList(termData)
    classLevels.value = unwrapList(classData)
    
    const current = terms.value.find((t) => t.is_current) ?? terms.value[0]
    
    // 2. Only fallback to the current/first term if selectedTerm wasn't already set by the URL
    if (!selectedTerm.value && current) {
      selectedTerm.value = current.id
    }
  } catch (err) {
    pageError.value = errorMessage(err)
  }
  
  loadBatches()

  // 3. Since the watcher won't trigger if the URL term remains unchanged, manually fetch the preview
  if (hadTerm) {
    loadPreview()
  }
})

</script>