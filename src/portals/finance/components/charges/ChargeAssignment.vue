<template>
  <div class="space-y-4 p-3 sm:space-y-6 sm:p-6">
    <!-- Toolbar -->
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-4">
        <label class="sr-only" for="ca-term">Term</label>
        <select id="ca-term" v-model="selectedTerm" class="w-full rounded border px-3 py-2 sm:w-auto">
          <option value="" disabled>Select term</option>
          <option v-for="t in terms" :key="t.id" :value="t.id">{{ termLabel(t) }}</option>
        </select>

        <label class="sr-only" for="ca-class">Class</label>
        <select id="ca-class" v-model="selectedClass" class="w-full rounded border px-3 py-2 sm:w-auto">
          <option value="" disabled>Select class</option>
          <option v-for="cls in classLevels" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
        </select>

        <label class="sr-only" for="ca-search">Search students</label>
        <input
          id="ca-search"
          v-model="search"
          type="search"
          placeholder="Search name or admission no..."
          class="w-full rounded border px-3 py-2 sm:w-64"
        />

        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="applyCredit" type="checkbox" class="rounded border" @change="loadPreview" />
          Apply available credit
        </label>
      </div>

      <button
        @click="openDiscounts"
        :disabled="!selectedTerm"
        class="w-full rounded border border-blue-200 px-4 py-2 font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 sm:w-auto"
      >
        Discounts &amp; exceptions
      </button>
    </div>

    <!-- Notices -->
    <p v-if="pageError" class="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ pageError }}</p>

    <div v-if="notice" class="rounded border p-3 text-sm" :class="notice.invalid?.length ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-green-200 bg-green-50 text-green-800'">
      <div class="flex items-start justify-between gap-3">
        <p class="font-medium">{{ notice.title }}</p>
        <button @click="notice = null" class="shrink-0 text-gray-500 hover:text-gray-800" aria-label="Dismiss">Dismiss</button>
      </div>
      <ul class="mt-1 list-disc space-y-0.5 pl-5">
        <li v-for="(line, i) in notice.lines" :key="i">{{ line }}</li>
      </ul>
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
        <dt class="text-sm text-gray-500">Students</dt>
        <dd class="text-lg font-semibold">{{ students.length }}</dd>
      </div>
      <div class="rounded border p-3">
        <dt class="text-sm text-gray-500">Ready to invoice</dt>
        <dd class="text-lg font-semibold">{{ counts.ready + counts.changed }}</dd>
      </div>
      <div class="rounded border p-3">
        <dt class="text-sm text-gray-500">Already invoiced</dt>
        <dd class="text-lg font-semibold">{{ counts.invoiced }}</dd>
      </div>
      <div class="rounded border p-3">
        <dt class="text-sm text-gray-500">Net payable (not invoiced)</dt>
        <dd class="text-lg font-semibold">{{ formatCurrency(pendingNet) }}</dd>
      </div>
    </dl>

    <!-- Bulk actions -->
    <div v-if="selectedIds.length" class="flex flex-col gap-2 rounded border bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm font-medium">{{ selectedIds.length }} selected</p>
      <div class="grid grid-cols-2 gap-2 sm:flex">
        <button @click="openApply('add')" class="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">Add charge</button>
        <button @click="openApply('remove')" class="rounded border bg-white px-3 py-2 text-sm hover:bg-gray-50">Remove charge</button>
        <button @click="openDiscount" class="rounded border bg-white px-3 py-2 text-sm hover:bg-gray-50">Grant discount</button>
        <button @click="selectedIds = []" class="rounded px-3 py-2 text-sm text-gray-600 hover:underline">Clear</button>
      </div>
    </div>

    <!-- Desktop table -->
    <div class="hidden overflow-x-auto rounded border md:block">
      <table class="w-full border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="w-10 p-3">
              <input
                type="checkbox"
                class="rounded border"
                :checked="allSelected"
                :disabled="!selectable.length"
                aria-label="Select all students"
                @change="toggleAll"
              />
            </th>
            <th class="p-3 text-left">Student</th>
            <th class="p-3 text-left">Status</th>
            <th class="p-3 text-right">Total</th>
            <th class="p-3 text-right">Discounts</th>
            <th class="p-3 text-right">Credit</th>
            <th class="p-3 text-right">Net payable</th>
            <th class="p-3 text-center">Details</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="p-4 text-center text-gray-500">Loading preview...</td>
          </tr>

          <template v-for="row in filteredStudents" :key="row.student_id">
            <tr class="border-t hover:bg-gray-50">
              <td class="p-3 text-center">
                <input
                  type="checkbox"
                  class="rounded border"
                  :value="row.student_id"
                  v-model="selectedIds"
                  :disabled="row.status === 'invoiced'"
                  :aria-label="`Select ${row.name}`"
                />
              </td>
              <td class="p-3">
                <div class="font-medium">{{ row.name }}</div>
                <div class="text-sm text-gray-500">{{ row.admission_number }}</div>
              </td>
              <td class="p-3">
                <span class="rounded px-2 py-0.5 text-xs font-medium" :class="statusClass(row.status)">{{ statusLabel(row.status) }}</span>
                <span v-if="row.issues?.length" class="ml-2 text-xs font-medium text-amber-700">
                  {{ row.issues.length }} {{ row.issues.length === 1 ? 'issue' : 'issues' }}
                </span>
              </td>
              <td class="p-3 text-right">{{ formatCurrency(row.total) }}</td>
              <td class="p-3 text-right" :class="Number(row.discount_total) < 0 ? 'text-green-700' : ''">{{ formatCurrency(row.discount_total) }}</td>
              <td class="p-3 text-right">{{ formatCurrency(row.credit_applied) }}</td>
              <td class="p-3 text-right font-medium">{{ formatCurrency(row.net_payable) }}</td>
              <td class="p-3 text-center">
                <button @click="toggleExpanded(row.student_id)" class="text-blue-600 hover:underline">
                  {{ expanded.has(row.student_id) ? 'Hide' : 'View' }}
                </button>
              </td>
            </tr>
            <tr v-if="expanded.has(row.student_id)" class="border-t bg-gray-50">
              <td colspan="8" class="p-4"><StudentBillDetail :row="row" /></td>
            </tr>
          </template>

          <tr v-if="!loading && !filteredStudents.length">
            <td colspan="8" class="p-4 text-center text-gray-500">{{ emptyText }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <div class="space-y-3 md:hidden">
      <p v-if="loading" class="rounded-lg border bg-white p-6 text-center text-gray-500">Loading preview...</p>

      <article v-for="row in filteredStudents" :key="row.student_id" class="rounded-lg border bg-white p-4 shadow-sm">
        <div class="flex items-start gap-3">
          <input
            type="checkbox"
            class="mt-1 rounded border"
            :value="row.student_id"
            v-model="selectedIds"
            :disabled="row.status === 'invoiced'"
            :aria-label="`Select ${row.name}`"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <h2 class="min-w-0 break-words font-semibold text-gray-900">{{ row.name }}</h2>
              <span class="shrink-0 rounded px-2 py-0.5 text-xs font-medium" :class="statusClass(row.status)">{{ statusLabel(row.status) }}</span>
            </div>
            <p class="text-sm text-gray-500">{{ row.admission_number }}</p>
          </div>
        </div>

        <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-gray-500">Total</dt>
            <dd class="mt-0.5 font-medium text-gray-800">{{ formatCurrency(row.total) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Net payable</dt>
            <dd class="mt-0.5 font-semibold text-gray-900">{{ formatCurrency(row.net_payable) }}</dd>
          </div>
        </dl>

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

      <div v-if="!loading && !filteredStudents.length" class="rounded-lg border bg-white p-6 text-center text-gray-500">
        {{ emptyText }}
      </div>
    </div>

    <!-- Not enrolled -->
    <details v-if="preview?.not_enrolled?.length" class="rounded border p-3">
      <summary class="cursor-pointer text-sm font-medium">
        {{ preview.not_enrolled.length }} active {{ preview.not_enrolled.length === 1 ? 'student has' : 'students have' }} no enrollment for this term's year
      </summary>
      <p class="mt-2 text-sm text-gray-600">They can't be billed in this class until they are enrolled.</p>
      <ul class="mt-2 divide-y rounded border text-sm">
        <li v-for="s in preview.not_enrolled" :key="s.student_id ?? s.id" class="flex justify-between gap-3 p-2.5">
          <span class="min-w-0 break-words">{{ s.name }}</span>
          <span class="shrink-0 text-gray-500">{{ s.admission_number }}</span>
        </li>
      </ul>
    </details>

    <!-- Apply / remove charge modal -->
    <div v-if="applyModal" class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" @click.self="applyModal = false">
      <form class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:max-w-md sm:rounded-lg sm:p-6" @submit.prevent="submitApply">
        <h2 class="text-lg font-semibold">{{ applyForm.action === 'add' ? 'Add charge' : 'Remove charge' }}</h2>
        <p class="text-sm text-gray-500">{{ selectedIds.length }} {{ selectedIds.length === 1 ? 'student' : 'students' }} · {{ currentTermName }}</p>

        <div class="mt-4 space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium" for="ap-charge">Charge</label>
            <select id="ap-charge" v-model="applyForm.charge" required class="w-full rounded border px-3 py-2">
              <option value="" disabled>Select charge</option>
              <option v-for="c in activeCharges" :key="c.id" :value="c.id">
                {{ c.name }}{{ c.assignment === 'opt_in' ? ' (selected students)' : '' }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium" for="ap-reason">Reason (optional)</label>
            <input id="ap-reason" v-model.trim="applyForm.reason" maxlength="255" class="w-full rounded border px-3 py-2" placeholder="e.g. Approved by bursar" />
          </div>
        </div>

        <p class="mt-3 text-xs text-gray-500">Students already invoiced for this term are skipped. Existing invoices don't change.</p>
        <p v-if="modalError" class="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ modalError }}</p>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" @click="applyModal = false" class="w-full rounded border px-4 py-2 hover:bg-gray-50 sm:w-auto">Cancel</button>
          <button type="submit" :disabled="saving" class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto">
            {{ saving ? 'Saving...' : applyForm.action === 'add' ? 'Add charge' : 'Remove charge' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Grant discount modal -->
    <div v-if="discountModal" class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" @click.self="discountModal = false">
      <form class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:max-w-lg sm:rounded-lg sm:p-6" @submit.prevent="submitDiscount">
        <h2 class="text-lg font-semibold">Grant discount</h2>
        <p class="text-sm text-gray-500">{{ selectedIds.length }} {{ selectedIds.length === 1 ? 'student' : 'students' }} · {{ currentTermName }}</p>

        <div class="mt-4 space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium" for="d-kind">Type</label>
              <select id="d-kind" v-model="discountForm.kind" class="w-full rounded border px-3 py-2">
                <option value="percent">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
                <option value="pays_only">Student pays only</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium" for="d-value">{{ valueLabel }}</label>
              <input
                id="d-value"
                v-model="discountForm.value"
                type="number"
                required
                :min="discountForm.kind === 'pays_only' ? 0 : 1"
                :max="discountForm.kind === 'percent' ? 100 : undefined"
                :step="discountForm.kind === 'percent' ? 'any' : 1"
                class="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div v-if="discountForm.kind !== 'pays_only'">
            <label class="mb-1 block text-sm font-medium" for="d-base">Applies to</label>
            <select id="d-base" v-model="discountForm.base" class="w-full rounded border px-3 py-2">
              <option value="fee">School fees only</option>
              <option value="invoice">Whole invoice</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium" for="d-reason">Reason</label>
            <select id="d-reason" v-model="discountForm.reason" class="w-full rounded border px-3 py-2">
              <option v-for="r in discountReasons" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium" for="d-note">Note{{ discountForm.reason === 'other' ? '' : ' (optional)' }}</label>
            <input id="d-note" v-model.trim="discountForm.note" :required="discountForm.reason === 'other'" class="w-full rounded border px-3 py-2" />
          </div>

          <label class="flex items-start gap-2 text-sm">
            <input v-model="discountForm.ongoing" type="checkbox" class="mt-0.5 rounded border" />
            <span>Keep applying in future terms<span class="block text-xs text-gray-500">Off: this term only, for students not yet invoiced.</span></span>
          </label>

          <div v-if="discountForm.ongoing">
            <label class="mb-1 block text-sm font-medium" for="d-ends">Ends on (optional)</label>
            <input id="d-ends" v-model="discountForm.ends_on" type="date" class="w-full rounded border px-3 py-2" />
          </div>
        </div>

        <p v-if="modalError" class="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ modalError }}</p>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" @click="discountModal = false" class="w-full rounded border px-4 py-2 hover:bg-gray-50 sm:w-auto">Cancel</button>
          <button type="submit" :disabled="saving" class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto">
            {{ saving ? 'Saving...' : 'Grant discount' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Discounts & exceptions modal -->
    <div v-if="listModal" class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" @click.self="listModal = false">
      <div class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border bg-white p-4 shadow-lg sm:max-w-2xl sm:rounded-lg sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold">Discounts &amp; exceptions</h2>
            <p class="text-sm text-gray-500">{{ currentTermName }}</p>
          </div>
          <button @click="listModal = false" class="shrink-0 text-gray-500 hover:text-gray-800" aria-label="Close">Close</button>
        </div>

        <p v-if="listError" class="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ listError }}</p>
        <p v-if="listLoading" class="mt-4 text-sm text-gray-500">Loading...</p>

        <template v-else>
          <h3 class="mt-5 text-sm font-semibold text-gray-700">Active discounts</h3>
          <ul class="mt-2 divide-y rounded border">
            <li v-for="d in discounts" :key="d.id" class="flex items-start justify-between gap-3 p-3 text-sm">
              <div class="min-w-0">
                <div class="break-words font-medium">{{ d.student_name }} <span class="font-normal text-gray-500">{{ d.admission_number }}</span></div>
                <div class="text-gray-600">{{ discountText(d) }}</div>
                <div class="text-xs text-gray-500">
                  {{ d.reason_label ?? d.reason }} · {{ d.ongoing ? `Ongoing${d.ends_on ? ' until ' + d.ends_on : ''}` : d.term_name }}
                </div>
                <div v-if="d.note" class="text-xs text-gray-500">{{ d.note }}</div>
              </div>
              <button @click="endOne(d)" class="shrink-0 text-red-600 hover:underline">End</button>
            </li>
            <li v-if="!discounts.length" class="p-4 text-center text-sm text-gray-500">No active discounts for this term.</li>
          </ul>

          <h3 class="mt-6 text-sm font-semibold text-gray-700">Charge exceptions</h3>
          <ul class="mt-2 divide-y rounded border">
            <li v-for="a in adjustments" :key="a.id" class="p-3 text-sm">
              <div class="break-words font-medium">{{ a.student_name }} <span class="font-normal text-gray-500">{{ a.admission_number }}</span></div>
              <div class="text-gray-600">{{ a.action === 'add' ? 'Added' : 'Removed' }}: {{ a.charge_name }}</div>
              <div v-if="a.reason" class="text-xs text-gray-500">{{ a.reason }}</div>
            </li>
            <li v-if="!adjustments.length" class="p-4 text-center text-sm text-gray-500">No charge exceptions for this term.</li>
          </ul>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  getCharges,
  getChargePreview,
  applyCharge,
  grantDiscount,
  getDiscounts,
  getChargeAdjustments,
  endDiscount,
  unwrapList,
  errorMessage,
} from '../../api/charge'
import { listTerms } from '../../api/term'
import { getClassLevels } from '@/api/classes'
import StudentBillDetail from './StudentBillDetail.vue'
import { useBillingContext } from '../../composables/useBillingContext'

const discountReasons = [
  { value: 'staff_child', label: 'Staff child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'bursary', label: 'Bursary' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'mid_term', label: 'Mid-term admission' },
  { value: 'other', label: 'Other' },
]

const terms = ref([])
const classLevels = ref([])
const { term: selectedTerm, classLevel: selectedClass } = useBillingContext()
const applyCredit = ref(true)
const search = ref('')

const preview = ref(null)
const loading = ref(false)
const pageError = ref('')
const notice = ref(null)
const selectedIds = ref([])
const expanded = ref(new Set())

// ---------- helpers ----------
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(Number(value || 0))

const termLabel = (t) => [t.name, t.academic_year_name ?? t.academic_year].filter(Boolean).join(' · ')
const currentTermName = computed(() => {
  const t = terms.value.find((x) => x.id === selectedTerm.value)
  return t ? termLabel(t) : ''
})

const statusLabel = (s) => ({ ready: 'Ready', changed: 'Changed', invoiced: 'Invoiced' }[s] ?? s)
const statusClass = (s) =>
  ({
    ready: 'bg-green-100 text-green-800',
    changed: 'bg-blue-100 text-blue-800',
    invoiced: 'bg-gray-200 text-gray-700',
  }[s] ?? 'bg-gray-100 text-gray-700')

// ---------- preview ----------
const students = computed(() => preview.value?.students ?? [])
const selectable = computed(() => students.value.filter((s) => s.status !== 'invoiced'))
const allSelected = computed(() => selectable.value.length > 0 && selectable.value.every((s) => selectedIds.value.includes(s.student_id)))

const counts = computed(() => {
  const c = { ready: 0, changed: 0, invoiced: 0 }
  students.value.forEach((s) => { if (s.status in c) c[s.status]++ })
  return c
})
const pendingNet = computed(() =>
  students.value.filter((s) => s.status !== 'invoiced').reduce((sum, s) => sum + Number(s.net_payable || 0), 0),
)

const filteredStudents = computed(() => {
  const q = search.value.toLowerCase()
  return students.value.filter(
    (s) => (s.name || '').toLowerCase().includes(q) || String(s.admission_number || '').toLowerCase().includes(q),
  )
})

const emptyText = computed(() => {
  if (!selectedTerm.value || !selectedClass.value) return 'Select a term and class to see the student bills.'
  if (preview.value?.blockers?.length) return 'Resolve the issue above to see student bills.'
  return 'No enrolled students found for this class and term.'
})

const loadPreview = async () => {
  if (!selectedTerm.value || !selectedClass.value) {
    preview.value = null
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
    // keep only selections that are still selectable
    const ok = new Set(selectable.value.map((s) => s.student_id))
    selectedIds.value = selectedIds.value.filter((id) => ok.has(id))
  } catch (err) {
    preview.value = null
    pageError.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

watch([selectedTerm, selectedClass], () => {
  selectedIds.value = []
  expanded.value = new Set()
  loadPreview()
})

const toggleAll = () => {
  selectedIds.value = allSelected.value ? [] : selectable.value.map((s) => s.student_id)
}

const toggleExpanded = (id) => {
  const next = new Set(expanded.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expanded.value = next
}

const studentName = (id) => students.value.find((s) => s.student_id === id)?.name ?? `Student #${id}`

// Build a readable notice from a bulk-action response
const buildNotice = (title, res, extra = []) => {
  const lines = [...extra]
  if (res.skipped_invoiced?.length)
    lines.push(`Skipped, already invoiced: ${res.skipped_invoiced.map(studentName).join(', ')}`)
  ;(res.invalid ?? []).forEach((i) => lines.push(`${studentName(i.student_id)}: ${i.detail}`))
  return { title, lines, invalid: res.invalid }
}

// ---------- charges for the modal ----------
const charges = ref([])
const activeCharges = computed(() => charges.value.filter((c) => c.is_active))
const loadCharges = async () => {
  try {
    charges.value = unwrapList(await getCharges({ active: 1 }))
  } catch (err) {
    pageError.value = errorMessage(err)
  }
}

// ---------- apply / remove ----------
const applyModal = ref(false)
const applyForm = reactive({ charge: '', action: 'add', reason: '' })
const saving = ref(false)
const modalError = ref('')

const openApply = (action) => {
  Object.assign(applyForm, { charge: '', action, reason: '' })
  modalError.value = ''
  applyModal.value = true
}

const submitApply = async () => {
  saving.value = true
  modalError.value = ''
  try {
    const res = await applyCharge({
      charge: applyForm.charge,
      term: selectedTerm.value,
      student_ids: selectedIds.value,
      action: applyForm.action,
      reason: applyForm.reason || undefined,
    })
    const chargeName = charges.value.find((c) => c.id === applyForm.charge)?.name ?? 'Charge'
    notice.value = buildNotice(`${chargeName} updated`, res, [
      `Added for ${res.created} · removed for ${res.voided} · unchanged for ${res.unchanged}`,
    ])
    applyModal.value = false
    selectedIds.value = []
    await loadPreview()
  } catch (err) {
    modalError.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}

// ---------- discounts ----------
const discountModal = ref(false)
const emptyDiscount = () => ({ kind: 'percent', value: '', base: 'fee', reason: 'bursary', note: '', ongoing: false, ends_on: '' })
const discountForm = reactive(emptyDiscount())
const valueLabel = computed(() =>
  ({ percent: 'Percentage (1–100)', fixed: 'Amount off (KES)', pays_only: 'Student pays (KES)' }[discountForm.kind]),
)

const openDiscount = () => {
  Object.assign(discountForm, emptyDiscount())
  modalError.value = ''
  discountModal.value = true
}

const submitDiscount = async () => {
  modalError.value = ''
  const value = Number(discountForm.value)
  if (discountForm.kind !== 'percent' && !Number.isInteger(value)) {
    modalError.value = 'Enter a whole shilling amount.'
    return
  }
  if (discountForm.kind === 'percent' && !(value > 0 && value <= 100)) {
    modalError.value = 'Percentage must be above 0 and at most 100.'
    return
  }
  saving.value = true
  try {
    const payload = {
      term: selectedTerm.value,
      student_ids: selectedIds.value,
      kind: discountForm.kind,
      value: String(value),
      reason: discountForm.reason,
      note: discountForm.note,
      ongoing: discountForm.ongoing,
    }
    if (discountForm.kind !== 'pays_only') payload.base = discountForm.base
    if (discountForm.ongoing && discountForm.ends_on) payload.ends_on = discountForm.ends_on

    const res = await grantDiscount(payload)
    const extra = [`Granted to ${res.created} · unchanged for ${res.unchanged}`]
    if (res.invoiced_this_term?.length)
      extra.push(`Already invoiced this term (applies from next invoice): ${res.invoiced_this_term.map(studentName).join(', ')}`)
    notice.value = buildNotice('Discount granted', res, extra)
    discountModal.value = false
    selectedIds.value = []
    await loadPreview()
  } catch (err) {
    modalError.value =
      err?.response?.status === 403
        ? "Your role can't grant discounts. Ask an admin, bursar or principal."
        : errorMessage(err)
  } finally {
    saving.value = false
  }
}

// ---------- discounts & exceptions list ----------
const listModal = ref(false)
const listLoading = ref(false)
const listError = ref('')
const discounts = ref([])
const adjustments = ref([])

const discountText = (d) => {
  if (d.kind === 'percent') return `${Number(d.value)}% off ${d.base === 'invoice' ? 'the invoice' : 'school fees'}`
  if (d.kind === 'fixed') return `${formatCurrency(d.value)} off ${d.base === 'invoice' ? 'the invoice' : 'school fees'}`
  return `Pays only ${formatCurrency(d.value)}`
}

const loadLists = async () => {
  listLoading.value = true
  listError.value = ''
  try {
    const [d, a] = await Promise.all([
      getDiscounts({ term: selectedTerm.value }),
      getChargeAdjustments({ term: selectedTerm.value }),
    ])
    discounts.value = unwrapList(d)
    adjustments.value = unwrapList(a)
  } catch (err) {
    listError.value = errorMessage(err)
  } finally {
    listLoading.value = false
  }
}

const openDiscounts = () => {
  listModal.value = true
  loadLists()
}

const endOne = async (d) => {
  if (!window.confirm(`End this discount for ${d.student_name}? It stops applying to future invoices. Existing invoices don't change.`)) return
  listError.value = ''
  try {
    await endDiscount(d.id)
    await Promise.all([loadLists(), loadPreview()])
  } catch (err) {
    listError.value =
      err?.response?.status === 403 ? "Your role can't end discounts." : errorMessage(err)
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