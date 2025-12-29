<template>
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-2xl font-semibold mb-6">My Notes</h1>

 
    <div v-if="loading" class="text-center text-gray-500 py-10">
      Loading notes...
    </div>

   
    <div v-else-if="Object.keys(groupedNotes).length === 0" class="text-center text-gray-500 py-10">
      No notes available for your class.
    </div>

    
    <div v-else class="space-y-10">
      <div
        v-for="(notes, subject) in groupedNotes"
        :key="subject"
        class="space-y-4"
      >
        <h2 class="text-xl font-semibold text-gray-800 border-b pb-1">
          {{ subject }}
        </h2>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="note in notes"
            :key="note.id"
            class="bg-white border rounded-lg p-4 hover:shadow-md transition"
          >
            <h3 class="font-semibold text-lg mb-1">
              {{ note.title }}
            </h3>

            <p class="text-sm text-gray-600 mb-2">
              {{ note.content }}
            </p>

            <div class="flex justify-between items-center text-xs text-gray-500">
              <span>
                {{ formatDate(note.created_at) }}
              </span>
              <div class="flex gap-2 mt-2">
  <a
    v-if="note.file"
    :href="note.file"
    download
    class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
  >
    Download
  </a>
  <a
    v-if="note.file"
    :href="note.file"
    target="_blank"
    rel="noopener noreferrer"
    class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
  >
    Read
  </a>
</div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { getNotes } from "../api/lms";
export default {
  name: "NotesPage",

  data() {
    return {
      notes: [],
      loading: false,
    };
  },

  computed: {
    groupedNotes() {
      
      const sorted = [...this.notes].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

 
      return sorted.reduce((groups, note) => {
        const subject = note.subject || "Other";
        if (!groups[subject]) {
          groups[subject] = [];
        }
        groups[subject].push(note);
        return groups;
      }, {});
    },
  },

 async mounted() {
  this.loading = true;
  try {
    const data = await getNotes();
    this.notes = data.results ?? data;
  } catch (error) {
    console.error("Failed to load notes", error);
  } finally {
    this.loading = false;
  }
},


  methods: {
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
};
</script>
