<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import {
  getPaymentModes,
  updatePaymentMode,
  deletePaymentMode,
  reorderPaymentModes,
} from '../api/fee'
import ModeList from '../components/funds/ModeList.vue'
import ModeForm from '../components/funds/ModeForm.vue'
import PhonePreview from '../components/funds/PhonePreview.vue'

const toast = useToast()

const modes = ref([])
const loading = ref(true)
const loadError = ref('')
const busy = ref(false)
const view = ref('list') // 'list' | 'form'
const editing = ref(null) // mode being edited, null = adding

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    modes.value = await getPaymentModes()
  } catch {
    loadError.value = 'Could not load payment modes. Please try again.'
  } finally {
    loading.value = false
  }
}

function openForm(mode = null) {
  if (loading.value || busy.value || loadError.value) return
  editing.value = mode
  view.value = 'form'
}

function onSaved() {
  view.value = 'list'
  load()
}

async function toggle(mode) {
  if (busy.value) return
  busy.value = true
  try {
    const isActive = !mode.is_active
    const updated = await updatePaymentMode(mode.id, { is_active: isActive })
    Object.assign(mode, { is_active: isActive }, updated)
  } catch {
    toast.error('Could not update this mode.')
  } finally {
    busy.value = false
  }
}

async function remove(mode) {
  if (busy.value) return
  if (!window.confirm(`Delete "${mode.name}"? Parents will no longer see it.`)) return
  busy.value = true
  try {
    await deletePaymentMode(mode.id)
    modes.value = modes.value.filter((m) => m.id !== mode.id)
  } catch {
    toast.error('Could not delete this mode.')
  } finally {
    busy.value = false
  }
}

async function move({ mode, dir }) {
  if (busy.value) return
  const previous = modes.value
  const list = [...modes.value]
  const from = list.findIndex((m) => m.id === mode.id)
  const to = from + dir
  if (from < 0 || to < 0 || to >= list.length) return
  busy.value = true
  list.splice(to, 0, list.splice(from, 1)[0])
  modes.value = list // show the new order straight away
  try {
    await reorderPaymentModes(list.map((m) => m.id))
  } catch {
    modes.value = previous
    toast.error('Could not save the new order.')
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="p-4 sm:p-8 space-y-6">
    <!-- List page -->
    <template v-if="view === 'list'">
      <div class="flex flex-wrap items-start gap-4">
        <div class="flex-1 min-w-[240px]">
          <h1 class="text-2xl font-bold text-slate-900">How to pay</h1>
          
        </div>
        <button
          class="h-11 px-5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 disabled:opacity-60"
          :disabled="loading || busy || !!loadError"
          @click="openForm()"
        >
          Add payment mode
        </button>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 items-start">
        <div class="flex-1 min-w-0 w-full">
          <div v-if="loadError" role="alert" class="rounded-2xl border border-red-200 bg-white p-6 space-y-3">
            <p class="text-sm text-red-700">{{ loadError }}</p>
            <button class="h-11 px-4 rounded-lg border border-slate-400 text-sm font-semibold" @click="load">
              Try again
            </button>
          </div>
          <ModeList
            v-else
            :modes="modes"
            :loading="loading"
            :busy="busy"
            @add="openForm()"
            @edit="openForm"
            @toggle="toggle"
            @remove="remove"
            @move="move"
          />
        </div>
        <div v-if="!loading && !loadError" class="w-full lg:w-80 shrink-0 flex flex-col items-center gap-2">
          <span class="text-xs font-semibold text-slate-600">What parents see</span>
          <PhonePreview :modes="modes" />
        </div>
      </div>
    </template>

    <!-- Add / edit page -->
    <ModeForm
      v-else
      :key="editing?.id ?? 'new'"
      :mode="editing"
      @saved="onSaved"
      @cancel="view = 'list'"
    />
  </div>
</template>
