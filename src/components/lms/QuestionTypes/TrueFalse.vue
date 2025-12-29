<template>
  <div class="space-y-2">
    <p>{{ question.text }}</p>
    <div class="flex gap-4">
      <button @click="$emit('update:modelValue', true)" :class="btnClass(true)">True</button>
      <button @click="$emit('update:modelValue', false)" :class="btnClass(false)">False</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['question', 'modelValue'],
  methods: {
    btnClass(val) {
      return `px-4 py-2 rounded border ${this.modelValue === val ? 'bg-blue-500 text-white' : 'bg-white border-gray-300'}`;
    },
  },
};
</script>
