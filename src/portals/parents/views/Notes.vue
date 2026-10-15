<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-6 gap-4">
      <h1 class="text-2xl font-semibold">
        Notes<span v-if="child.selected"> · {{ child.selected.full_name }}</span>
      </h1>

      <select
        v-if="child.children.length > 1"
        :value="child.selectedId"
        @change="child.select(Number($event.target.value))"
        class="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[200px]"
      >
        <option v-for="s in child.children" :key="s.id" :value="s.id">
          {{ s.full_name }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-10">Loading notes...</div>

    <div v-else-if="error" class="text-center text-red-600 py-10">{{ error }}</div>

    <div
      v-else-if="Object.keys(groupedNotes).length === 0"
      class="text-center text-gray-500 py-10"
    >
      No notes posted for this class yet.
    </div>

    <div v-else class="space-y-10">
      <div v-for="(items, subject) in groupedNotes" :key="subject" class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 border-b pb-1">{{ subject }}</h2>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="note in items"
            :key="note.id"
            class="bg-white border rounded-lg p-4 hover:shadow-md transition"
          >
            <h3 class="font-semibold text-lg mb-1">{{ note.title }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ note.content }}</p>

            <div class="flex justify-between items-center text-xs text-gray-500 mt-3">
              <span>{{ formatDate(note.created_at) }}</span>

              <a
                v-if="note.file"
                :href="note.file"
                target="_blank"
                rel="noopener"
                class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Open file
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useChildStore } from "../store/childStore";
import { getChildNotes } from "../api/lms";

const child = useChildStore();

const notes = ref([]);
const loading = ref(false);
const error = ref("");

let requestId = 0; // ignore stale responses if the parent switches child quickly

const fetchNotes = async () => {
  if (!child.selectedId) {
    notes.value = [];
    return;
  }
  const myRequest = ++requestId;
  loading.value = true;
  error.value = "";
  try {
    const data = await getChildNotes(child.selectedId);
    if (myRequest === requestId) notes.value = data;
  } catch (e) {
    if (myRequest === requestId) {
      console.error("Failed to load notes", e);
      error.value = "Could not load notes. Please try again.";
      notes.value = [];
    }
  } finally {
    if (myRequest === requestId) loading.value = false;
  }
};

const groupedNotes = computed(() => {
  const sorted = [...notes.value].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  return sorted.reduce((groups, note) => {
    const subject = note.subject_display || note.subject || "Other";
    (groups[subject] ||= []).push(note);
    return groups;
  }, {});
});

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

watch(() => child.selectedId, fetchNotes);

onMounted(async () => {
  await child.load();
  await fetchNotes();
});
</script>