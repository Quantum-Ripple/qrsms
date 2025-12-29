<template>
  <div class="flex flex-col gap-2">
    <p class="font-medium">{{ question.text }}</p>
    <textarea
      v-model="answer"
      class="border rounded p-3 w-full resize-y"
      rows="10"
      placeholder="Write your response here..."
    ></textarea>
    <p class="text-sm text-gray-500">Word count: {{ wordCount }}</p>
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
  computed: {
    wordCount() {
      if (!this.answer) return 0;
      return this.answer.trim().split(/\s+/).length;
    },
  },
};
</script>

<style scoped>
textarea {
  min-height: 200px; /* Ensure enough space for long answers */
}
</style>
