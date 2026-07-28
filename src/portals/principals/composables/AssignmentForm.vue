
<template>
  <div class="border rounded-lg p-4 space-y-4 bg-gray-50">

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

      <!-- CLASS -->
      <div>
        <label class="label">Class Level</label>
        <select v-model="localAssignment.class_level" class="field">
          <option value="">Select Class</option>
          <option
            v-for="cls in classLevels"
            :key="cls.id"
            :value="cls.id"
          >
            {{ cls.name || cls.class_level_name || cls.class_level || `Class ${cls.id}` }}
          </option>
        </select>
      </div>

      <!-- STREAM -->
      <div>
        <label class="label">Stream</label>
        <select
          v-model="localAssignment.stream"
          class="field"
          :disabled="!localAssignment.class_level"
        >
          <option value="">Select Stream</option>
          <option
            v-for="stream in streams"
            :key="stream.id"
            :value="stream.id"
          >
            {{ stream.name || stream.stream_name || stream.label || `Stream ${stream.id}` }}
          </option>
        </select>
      </div>

      <!-- SUBJECT -->
      <div>
        <label class="label">Subject</label>
        <select v-model="localAssignment.subject" class="field">
          <option value="">Select Subject</option>
          <option
            v-for="sub in SUBJECTS"
            :key="sub.value"
            :value="sub.value"
          >
            {{ sub.label }}
          </option>
        </select>
      </div>

    </div>

    <div class="flex items-center justify-between">
      <label class="flex items-center space-x-2 text-sm">
        <input type="checkbox" v-model="localAssignment.is_class_teacher" />
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
import { reactive, watch, computed } from 'vue'
import { SUBJECTS } from '@/constants/subjects.js'

const props = defineProps({
  modelValue: { type: Object, required: true },
  classLevels: { type: Array, required: true },   
  removable: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'remove'])

const localAssignment = reactive({ ...props.modelValue })


const streams = computed(() => {
  if (!localAssignment.class_level) return []

  const selected = Array.isArray(props.classLevels)
    ? props.classLevels.find(cls => Number(cls.id) === Number(localAssignment.class_level))
    : null

  return Array.isArray(selected?.streams) ? selected.streams : []
})


watch(
  () => localAssignment.class_level,
  () => {
    localAssignment.stream = ''
  }
)


watch(
  localAssignment,
  () => {
    emit('update:modelValue', { ...localAssignment })
  },
  { deep: true }
)
</script>