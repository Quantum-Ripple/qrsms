<template>
  <div class="border rounded-lg p-4 space-y-4 bg-gray-50">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Class Level
        </label>
        <select
          v-model="localAssignment.class_level"
          class="w-full border rounded-lg px-3 py-2"
          required
        >
          <option disabled value="">Select Class</option>
          <option v-for="level in classLevels" :key="level" :value="level">
            {{ level }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">
          Stream
        </label>
        <select
          v-model="localAssignment.stream"
          class="w-full border rounded-lg px-3 py-2"
          required
        >
          <option disabled value="">Select Stream</option>
          <option v-for="stream in streams" :key="stream" :value="stream">
            {{ stream }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">
          Subject
        </label>
        <select
          v-model="localAssignment.subject"
          class="w-full border rounded-lg px-3 py-2"
          required
        >
          <option disabled value="">Select Subject</option>
          <option v-for="subject in subjects" :key="subject" :value="subject">
            {{ subject }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <label class="flex items-center space-x-2 text-sm text-gray-700">
        <input
          type="checkbox"
          v-model="localAssignment.is_class_teacher"
          class="rounded border-gray-300"
        />
        <span>Is Class Teacher</span>
      </label>

      <button
        v-if="removable"
        type="button"
        @click="$emit('remove')"
        class="text-sm text-red-600 hover:underline"
      >
        Remove
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  removable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'remove'])

const classLevels = [
  'Grade 1', 'Grade 2', 'Grade 3',
  'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8',
]

const streams = ['East', 'West', 'North', 'South']
const subjects = ['MATH', 'ENG', 'KISW', 'CRE', 'SCI']

const localAssignment = reactive({ ...props.modelValue })

watch(
  localAssignment,
  () => {
    emit('update:modelValue', { ...localAssignment })
  },
  { deep: true }
)
</script>
