<template>
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

      <div class="bg-[#173458] text-white px-5 py-4 flex items-start justify-between">
        <div>
          <h2 class="text-lg font-semibold">{{ data?.student.name || studentName }}</h2>
          <p class="text-sm text-blue-100">
            <span v-if="data?.student.admission_number">Adm. {{ data.student.admission_number }} · </span>
            Payment history
          </p>
        </div>
        <button class="text-white/80 hover:text-white text-xl leading-none" @click="$emit('close')">✕</button>
      </div>

      <div class="p-5 overflow-y-auto">
        <div v-if="loading" class="text-center text-gray-500 py-10">Loading payments...</div>
        <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>

        <template v-else>
          <!-- totals -->
          <div class="grid grid-cols-3 gap-3 mb-5">
            <div class="rounded-lg bg-gray-50 border p-3">
              <p class="text-xs text-gray-500">Total billed</p>
              <p class="font-semibold text-gray-800">{{ money(data.totals.billed) }}</p>
            </div>
            <div class="rounded-lg bg-green-50 border border-green-100 p-3">
              <p class="text-xs text-green-700">Total paid</p>
              <p class="font-semibold text-green-800">{{ money(data.totals.paid) }}</p>
            </div>
            <div
              class="rounded-lg border p-3"
              :class="data.totals.balance > 0 ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'"
            >
              <p class="text-xs" :class="data.totals.balance > 0 ? 'text-amber-700' : 'text-blue-700'">
                {{ data.totals.balance < 0 ? 'Overpaid' : 'Balance' }}
              </p>
              <p class="font-semibold" :class="data.totals.balance > 0 ? 'text-amber-800' : 'text-blue-800'">
                {{ money(Math.abs(data.totals.balance)) }}
              </p>
            </div>
          </div>

          <div v-if="!data.payments.length" class="text-center text-gray-500 py-8">
            No payments recorded for this student yet.
          </div>

          <!-- desktop table -->
          <div v-else class="hidden sm:block overflow-x-auto border rounded-md">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 text-left">
                <tr>
                  <th class="px-3 py-2">Date</th>
                  <th class="px-3 py-2">For</th>
                  <th class="px-3 py-2">Method</th>
                  <th class="px-3 py-2">Reference</th>
                  <th class="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in data.payments" :key="p.id" class="border-t">
                  <td class="px-3 py-2 whitespace-nowrap">{{ formatDate(p.date) }}</td>
                  <td class="px-3 py-2">
                    <span class="font-medium">{{ p.kind }}</span>
                    <span class="block text-xs text-gray-500">{{ p.term }}<template v-if="p.academic_year">, {{ p.academic_year }}</template></span>
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap">{{ methodLabel(p.method) }}</td>
                  <td class="px-3 py-2 font-mono text-xs">{{ p.reference || '—' }}</td>
                  <td class="px-3 py-2 text-right font-semibold whitespace-nowrap">{{ money(p.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- mobile cards -->
          <div v-if="data.payments.length" class="sm:hidden space-y-2">
            <div v-for="p in data.payments" :key="p.id" class="border rounded-md p-3">
              <div class="flex justify-between">
                <span class="font-medium">{{ p.kind }}</span>
                <span class="font-bold">{{ money(p.amount) }}</span>
              </div>
              <p class="text-xs text-gray-500">{{ p.term }}<template v-if="p.academic_year">, {{ p.academic_year }}</template></p>
              <p class="text-sm text-gray-600 mt-1">{{ formatDate(p.date) }} · {{ methodLabel(p.method) }}</p>
              <p v-if="p.reference" class="text-xs font-mono text-gray-500">{{ p.reference }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getStudentPayments } from '../../api/finance' // adjust path

const props = defineProps({
  studentId: { type: [Number, String], required: true },
  studentName: { type: String, default: '' },
})
const emit = defineEmits(['close'])

const data = ref(null)
const loading = ref(true)
const error = ref('')

const money = (v) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(v || 0)

const formatDate = (d) => new Date(d).toLocaleDateString('en-GB')

const METHODS = { mpesa: 'M-Pesa', cash: 'Cash', bank: 'Bank' }
const methodLabel = (m) => METHODS[String(m).toLowerCase()] || m || '—'

const onKey = (e) => { if (e.key === 'Escape') emit('close') }

onMounted(async () => {
  window.addEventListener('keydown', onKey)
  try {
    data.value = await getStudentPayments(props.studentId)
  } catch {
    error.value = 'Failed to load this student\'s payments.'
  } finally {
    loading.value = false
  }
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>