<template>
  <select
    v-if="child.children.length > 1"
    :value="child.selectedId"
    @change="child.select(Number($event.target.value))"
    class="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm
           focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[200px]"
  >
    <option v-for="s in child.children" :key="s.id" :value="s.id">{{ s.full_name }}</option>
  </select>
</template>

<script setup>
import { useChildStore } from "../store/childStore";
const child = useChildStore();
</script>