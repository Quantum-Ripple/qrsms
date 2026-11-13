<template>
  <div class="relative">
    <label class="mb-1 block text-sm font-medium" :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      v-model="query"
      type="search"
      autocomplete="off"
      class="w-full rounded border px-3 py-2"
      placeholder="Search name or admission no..."
      @focus="open = true"
      @input="onInput"
      @keydown.esc="open = false"
    />

    <ul
      v-if="open && results.length"
      class="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border bg-white shadow-lg"
    >
      <li v-for="s in results" :key="s.id">
        <button type="button" class="w-full px-3 py-2 text-left hover:bg-gray-50" @click="pick(s)">
          <span class="font-medium">{{ studentName(s) }}</span>
          <span class="ml-2 text-sm text-gray-500">{{ studentAdmission(s) }}</span>
        </button>
      </li>
    </ul>
    <p v-else-if="open && query && searching" class="mt-1 text-sm text-gray-500">Searching...</p>
    <p v-else-if="open && query && !results.length" class="mt-1 text-sm text-gray-500">No students match.</p>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { studentName, studentAdmission } from '../../api/payment'
import { searchStudents } from '../../api/Students'

const props = defineProps({
  modelValue: { type: [Number, String], default: '' },
  students: { type: Array, default: () => [] },
  label: { type: String, default: 'Student' },
  inputId: { type: String, default: 'student-select' },
  excludeId: { type: [Number, String], default: '' },
})
const emit = defineEmits(['update:modelValue'])

const query = ref('')
const open = ref(false)
const results = ref([])
const searching = ref(false)

let timer = null
let seq = 0

const labelFor = (s) => [studentName(s), studentAdmission(s)].filter(Boolean).join(' · ')

// preselect when opened from a student page
watch(
  () => props.modelValue,
  (id) => {
    if (id && !query.value) {
      const s = props.students.find((x) => String(x.id) === String(id))
      if (s) query.value = labelFor(s)
    }
  },
  { immediate: true },
)

const runSearch = async (q) => {
  const mine = ++seq // ignore out-of-order responses
  searching.value = true
  try {
    // The backend matches the whole string against ONE field at a time, so
    // "john doe" would find nothing. Search by the longest word, then narrow
    // by every word on the client.
    const words = q.toLowerCase().split(/\s+/).filter(Boolean)
    const longest = [...words].sort((a, b) => b.length - a.length)[0]

    const list = await searchStudents(longest, { status: 'all' })
    if (mine !== seq) return

    results.value = list
      .filter((s) => !props.excludeId || String(s.id) !== String(props.excludeId))
      .filter((s) => {
        const label = labelFor(s).toLowerCase()
        return words.every((w) => label.includes(w))
      })
      .slice(0, 8)
  } catch {
    if (mine === seq) results.value = []
  } finally {
    if (mine === seq) searching.value = false
  }
}

// typing clears the current pick so a stale id is never submitted
const onInput = () => {
  open.value = true
  emit('update:modelValue', '')
  clearTimeout(timer)

  const q = query.value.trim()
  if (!q) {
    seq++
    results.value = []
    searching.value = false
    return
  }
  timer = setTimeout(() => runSearch(q), 250)
}

const pick = (s) => {
  emit('update:modelValue', s.id)
  query.value = labelFor(s)
  results.value = []
  open.value = false
}

onBeforeUnmount(() => clearTimeout(timer))
</script>