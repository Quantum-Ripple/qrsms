<script setup>
const props = defineProps({
  modelValue: Object,
});
const emit = defineEmits(["update:modelValue"]);

const update = (key, value) => {
  emit("update:modelValue", {
    ...props.modelValue,
    [key]: value,
  });
};
</script>

<template>
  <div class="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4">
    
    <select
      class="border rounded px-3 py-2"
      @change="update('exam', $event.target.value)"
    >
      <option value="">Select Exam</option>
    </select>

    <select
      class="border rounded px-3 py-2"
      @change="update('class_level', $event.target.value)"
    >
      <option value="">Select Class</option>
    </select>

    <select
      class="border rounded px-3 py-2"
      @change="update('subject', $event.target.value)"
    >
      <option value="">All Subjects</option>
    </select>

  </div>
</template>