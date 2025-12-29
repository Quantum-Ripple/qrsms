<template>
  <div class="flex flex-col gap-2">
    <p>{{ question.text }}</p>
    <textarea
      v-model="answer"
      class="border rounded p-2 w-full"
      rows="4"
      placeholder="Type your answer here..."
    ></textarea>
  </div>
</template>

<script>
export default {
  props: {
    question: { type: Object, required: true },
    modelValue: { type: String, default: '' },
  },
  data() {
    return { answer: this.modelValue };
  },
  watch: {
    answer(newVal) {
      this.$emit('update:modelValue', newVal);
    },
  },
};
</script>
