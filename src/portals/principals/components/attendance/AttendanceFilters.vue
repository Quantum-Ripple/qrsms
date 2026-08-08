<template>
  <div class="mb-6 rounded-xl bg-white p-4 shadow sm:p-5">
    <div class="grid gap-4 md:grid-cols-4">
      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700">Class Level</label>
        <select v-model="filters.class_level" @change="handleClassLevelChange" class="w-full rounded border px-3 py-2.5 text-sm">
          <option value="">All</option>
          <option v-for="level in classLevels" :key="level" :value="level">{{ level }}</option>
        </select>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700">Stream</label>
        <select v-model="filters.stream" class="w-full rounded border px-3 py-2.5 text-sm">
          <option value="">All</option>
          <option v-for="stream in streams" :key="stream" :value="stream">{{ stream }}</option>
        </select>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700">Class Instance</label>
        <select v-model="filters.class_instance" class="w-full rounded border px-3 py-2.5 text-sm">
          <option value="">All</option>
          <option v-for="instance in classInstanceOptions" :key="instance.value" :value="instance.value">{{ instance.label }}</option>
        </select>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700">Range</label>
        <select v-model="filters.range" class="w-full rounded border px-3 py-2.5 text-sm">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="term">Term</option>
          <option value="custom">Custom</option>
        </select>
      </div>
    </div>

    <div class="mt-4 grid gap-4 md:grid-cols-3">
      <div v-if="filters.range === 'term'">
        <label class="mb-2 block text-sm font-medium text-gray-700">Term</label>
        <select v-model="filters.term" class="w-full rounded border px-3 py-2.5 text-sm">
          <option value="">All Terms</option>
          <option v-for="term in termOptions" :key="term.id" :value="term.name">{{ term.name }}</option>
        </select>
      </div>

      <div v-if="filters.range === 'custom'">
        <label class="mb-2 block text-sm font-medium text-gray-700">From</label>
        <input type="date" v-model="filters.from" class="w-full rounded border px-3 py-2.5 text-sm" />
      </div>

      <div v-if="filters.range === 'custom'">
        <label class="mb-2 block text-sm font-medium text-gray-700">To</label>
        <input type="date" v-model="filters.to" class="w-full rounded border px-3 py-2.5 text-sm" />
      </div>
    </div>

    <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-3 sm:flex-row">
        <button @click="$emit('apply')" class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Apply</button>
        <button @click="$emit('reset')" class="inline-flex items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Reset</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  filters: { type: Object, required: true },
  classLevels: { type: Array, default: () => [] },
  streams: { type: Array, default: () => [] },
  classInstanceOptions: { type: Array, default: () => [] },
  termOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['apply', 'reset', 'class-level-change'])

function handleClassLevelChange() {
  props.filters.stream = ''
  props.filters.class_instance = ''
  emit('class-level-change')
}
</script>
