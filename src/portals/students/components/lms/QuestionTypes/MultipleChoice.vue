<template>
  <div class="space-y-2">
  
    <p class="font-semibold">{{ question.text }}</p>

    <div v-for="option in question.options" :key="option.id" class="flex items-center">
      <input
        type="checkbox"
        :id="'option-' + option.id"
        :value="option.id"               
        v-model="selected"                 
        class="mr-2"
      />
      <label :for="'option-' + option.id">{{ option.text }}</label>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    question: { type: Object, required: true },
    modelValue: { type: Array, default: () => [] },
  },
  data() {
    return {
      selected: [...this.modelValue], 
    };
  },
  watch: {
    selected(newVal) {
      this.$emit('update:modelValue', newVal); 
    },
    modelValue(newVal) {
      if (JSON.stringify(newVal) !== JSON.stringify(this.selected)) {
        this.selected = [...newVal];
      }
    },
  },
};
</script>

