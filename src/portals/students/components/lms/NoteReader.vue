<template>
  <div class="p-6 max-w-6xl mx-auto">
    
    <div class="mb-4">
      <button
        @click="$router.back()"
        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back
      </button>
    </div>

    <h1 class="text-2xl font-semibold mb-4">
      {{ note.title }}
    </h1>

    <p class="text-gray-600 mb-6">
      {{ note.content }}
    </p>

    <div class="border rounded-lg overflow-hidden h-[80vh]">
      <iframe
        v-if="note.file"
        :src="note.file"
        class="w-full h-full"
      ></iframe>
    </div>

  </div>
</template>

<script>
export default {
  name: "NoteReader",

  data() {
    return {
      note: {}
    }
  },

  mounted() {
    this.note = this.$route.query
  }
}
</script>