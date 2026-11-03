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
    <p v-else-if="open && query && !results.length" class="mt-1 text-sm text-gray-500">No students match.</p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { studentName, studentAdmission } from '../../api/payment'

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

const labelFor = (s) => [studentName(s), studentAdmission(s)].filter(Boolean).join(' · ')

watch(
  () => props.modelValue,
  (id) => {
    if (id && !query.value) {
      const s = props.students.find((x) => x.id === id)
      if (s) query.value = labelFor(s)
    }
  },
  { immediate: true },
)

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return props.students
    .filter((s) => s.id !== props.excludeId)
    .filter((s) => labelFor(s).toLowerCase().includes(q))
    .slice(0, 8)
})

// typing clears the current pick so a stale id is never submitted
const onInput = () => {
  open.value = true
  emit('update:modelValue', '')
}

const pick = (s) => {
  emit('update:modelValue', s.id)
  query.value = labelFor(s)
  open.value = false
}
</script>