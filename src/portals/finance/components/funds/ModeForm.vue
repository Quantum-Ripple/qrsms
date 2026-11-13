<script setup>
import { computed, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { createPaymentMode, updatePaymentMode } from '../../api/fee'
import PhonePreview from './PhonePreview.vue'
import { formatAccount } from '@/utils/PaymentSteps'

const props = defineProps({
  mode: { type: Object, default: null }, // null = adding a new mode
})
const emit = defineEmits(['saved', 'cancel'])
const toast = useToast()
 
const FEE_ITEMS = [
  { code: 'fees', label: 'School fees' },
  { code: 'transport', label: 'Transport' },
  { code: 'uniform', label: 'Uniform' },
  { code: 'other', label: 'Other charges' },
]
 
const blank = () => ({
  name: '',
  kind: 'paybill',
  business_number: '',
  bank_name: '',
  account_name: '',
  account_number: '',
  branch: '',
  account_format: '{admission}',
  applies_to: [],
  steps: [''],
  is_active: true,
})
 
const form = reactive({ ...blank(), ...(props.mode ? JSON.parse(JSON.stringify(props.mode)) : {}) })
if (!form.steps.length) form.steps.push('')
 
const accountExample = computed(() => formatAccount(form))
 
const saving = ref(false)
const errors = ref({})
 
const input =
  'h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-[15px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600'
 
function addStep() {
  form.steps.push('')
}
function removeStep(i) {
  form.steps.splice(i, 1)
  if (!form.steps.length) form.steps.push('')
}
 
// Send only the fields that belong to the chosen type, so old values never linger.
function payload() {
  const p = {
    name: form.name,
    kind: form.kind,
    applies_to: form.applies_to,
    steps: form.kind === 'app' ? [] : form.steps.filter((s) => s.trim()),
    business_number: ['paybill', 'till'].includes(form.kind) ? form.business_number : '',
    account_format: form.kind === 'paybill' ? form.account_format : '{admission}',
    branch: form.kind === 'bank' ? form.branch : '',
    bank_name: form.kind === 'bank' ? form.bank_name : '',
    account_name: form.kind === 'bank' ? form.account_name : '',
    account_number: form.kind === 'bank' ? form.account_number : '',
  }
  if (!props.mode) p.is_active = true
  return p
}
 
async function save() {
  saving.value = true
  errors.value = {}
  try {
    const body = payload()
    const saved = props.mode
      ? await updatePaymentMode(props.mode.id, body)
      : await createPaymentMode(body)
    toast.success('Saved. Parents can see it now.')
    emit('saved', saved)
  } catch (e) {
    const data = e.response?.data
    if (data && typeof data === 'object') {
      const flat = {}
      for (const [k, v] of Object.entries(data)) flat[k] = Array.isArray(v) ? v.join(' ') : String(v)
      errors.value = flat
      if (flat.detail) toast.error(flat.detail)
    } else {
      toast.error('Could not save. Please try again.')
    }
  } finally {
    saving.value = false
  }
}
</script>
 
<template>
  <div class="space-y-6">
    <div>
      <button class="text-sm text-slate-600 hover:text-slate-900" @click="emit('cancel')">
        &larr; Payment modes
      </button>
      <h1 class="mt-1 text-2xl font-bold text-slate-900">
        {{ mode ? mode.name : 'Add payment mode' }}
      </h1>
    </div>
 
    <div class="flex flex-col lg:flex-row gap-8 items-start">
      <form
        class="flex-1 min-w-0 w-full rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5"
        @submit.prevent="save"
      >
        <!-- Name + type -->
        <div class="grid sm:grid-cols-[1fr_200px] gap-4">
          <label class="block space-y-1.5">
            <span class="text-[13px] font-semibold text-slate-900">Mode name</span>
            <input v-model="form.name" type="text" maxlength="80" :class="input" placeholder="e.g. M-Pesa Paybill" />
            <span v-if="errors.name" class="text-sm text-red-700">{{ errors.name }}</span>
          </label>
          <label class="block space-y-1.5">
            <span class="text-[13px] font-semibold text-slate-900">Type</span>
            <select v-model="form.kind" :class="input">
              <option value="app">Pay in the app</option>
              <option value="paybill">M-Pesa Paybill</option>
              <option value="till">M-Pesa Till (Buy Goods)</option>
              <option value="bank">Bank</option>
              <option value="other">Cash or other</option>
            </select>
            <span v-if="errors.kind" class="text-sm text-red-700">{{ errors.kind }}</span>
          </label>
        </div>
 
        <!-- Till (Buy Goods) -->
        <label v-if="form.kind === 'till'" class="block space-y-1.5">
          <span class="text-[13px] font-semibold text-slate-900">Till number</span>
          <input v-model="form.business_number" type="text" inputmode="numeric" maxlength="20" :class="input" />
          <span v-if="errors.business_number" class="text-sm text-red-700">{{ errors.business_number }}</span>
        </label>
 
        <!-- Paybill -->
        <div v-if="form.kind === 'paybill'" class="grid sm:grid-cols-2 gap-4">
          <label class="block space-y-1.5">
            <span class="text-[13px] font-semibold text-slate-900">Business number</span>
            <input v-model="form.business_number" type="text" inputmode="numeric" maxlength="20" :class="input" />
            <span v-if="errors.business_number" class="text-sm text-red-700">{{ errors.business_number }}</span>
          </label>
          <label class="block space-y-1.5">
            <span class="text-[13px] font-semibold text-slate-900">Account number format</span>
            <input v-model="form.account_format" type="text" maxlength="60" :class="input" placeholder="{admission}" />
            <span class="block text-xs text-slate-600">Parents will type: <b class="text-slate-900">{{ accountExample }}</b></span>
            <span v-if="errors.account_format" class="text-sm text-red-700">{{ errors.account_format }}</span>
          </label>
          <p class="sm:col-span-2 text-xs text-slate-600">
            {admission} becomes the child's admission number. A school paybill usually needs only
            {admission}. A bank paybill often needs the school's number first, like 3456798#{admission}.
          </p>
        </div>
 
        <!-- Bank -->
        <div v-if="form.kind === 'bank'" class="grid sm:grid-cols-3 gap-4">
          <label class="block space-y-1.5">
            <span class="text-[13px] font-semibold text-slate-900">Bank</span>
            <input v-model="form.bank_name" type="text" maxlength="60" :class="input" placeholder="KCB, Equity..." />
            <span v-if="errors.bank_name" class="text-sm text-red-700">{{ errors.bank_name }}</span>
          </label>
          <label class="block space-y-1.5">
            <span class="text-[13px] font-semibold text-slate-900">Account name</span>
            <input v-model="form.account_name" type="text" maxlength="100" :class="input" />
          </label>
          <label class="block space-y-1.5">
            <span class="text-[13px] font-semibold text-slate-900">Account number</span>
            <input v-model="form.account_number" type="text" maxlength="40" :class="input" />
            <span v-if="errors.account_number" class="text-sm text-red-700">{{ errors.account_number }}</span>
          </label>
          <label class="block space-y-1.5">
            <span class="text-[13px] font-semibold text-slate-900">Branch (optional)</span>
            <input v-model="form.branch" type="text" maxlength="60" :class="input" />
          </label>
        </div>
 
        <!-- Applies to -->
        <fieldset>
          <legend class="text-[13px] font-semibold text-slate-900 mb-2">Applies to</legend>
          <div class="flex flex-wrap gap-x-6 gap-y-2">
            <label v-for="item in FEE_ITEMS" :key="item.code" class="flex items-center gap-2 text-sm text-slate-900">
              <input v-model="form.applies_to" type="checkbox" :value="item.code" class="h-5 w-5 accent-emerald-700" />
              {{ item.label }}
            </label>
          </div>
          <p class="mt-1.5 text-xs text-slate-600">Leave all unticked to use this mode for every fee item.</p>
          <span v-if="errors.applies_to" class="text-sm text-red-700">{{ errors.applies_to }}</span>
        </fieldset>
 
        <!-- Steps -->
        <div v-if="form.kind !== 'app'" class="space-y-2">
          <span class="text-[13px] font-semibold text-slate-900">
            {{ form.kind === 'other' ? 'What parents should do' : 'Custom steps (optional)' }}
          </span>
          <p v-if="form.kind !== 'other'" class="text-xs text-slate-600">
            Leave empty and parents see our standard steps. Add your own only if your school does it differently.
          </p>
          <div v-for="(s, i) in form.steps" :key="i" class="flex items-center gap-2">
            <span class="h-7 w-7 shrink-0 rounded-full bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center">
              {{ i + 1 }}
            </span>
            <input
              v-model="form.steps[i]"
              type="text"
              maxlength="200"
              :class="input"
              :aria-label="`Step ${i + 1}`"
            />
            <button
              type="button"
              class="h-11 w-11 shrink-0 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
              :aria-label="`Remove step ${i + 1}`"
              @click="removeStep(i)"
            >
              &times;
            </button>
          </div>
          <button
            type="button"
            class="h-11 px-4 rounded-lg border border-dashed border-emerald-700 text-emerald-700 text-sm font-semibold hover:bg-emerald-50"
            :disabled="form.steps.length >= 12"
            @click="addStep"
          >
            Add step
          </button>
          <p v-if="errors.steps" class="text-sm text-red-700">{{ errors.steps }}</p>
        </div>
 
        <!-- Actions -->
        <div class="flex justify-end gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            class="h-11 px-5 rounded-xl border border-slate-400 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50"
            @click="emit('cancel')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="h-11 px-6 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 disabled:opacity-60"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : 'Save and publish' }}
          </button>
        </div>
      </form>
 
      <!-- Live preview -->
      <div class="hidden lg:flex flex-col items-center gap-2">
        <span class="text-xs font-semibold text-slate-600">Live preview</span>
        <PhonePreview :mode="form" />
      </div>
    </div>
  </div>
</template>
 