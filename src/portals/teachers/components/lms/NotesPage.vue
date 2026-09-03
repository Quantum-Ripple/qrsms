<script setup>
import { ref, computed, onMounted } from "vue";
import { listNotes, deleteNote, createNote } from "../../api/lms";
import { SUBJECTS } from "../../../../constants/subjects";
import { useClassStore } from "@/stores/classStore";
import { useAuthStore } from "@/stores/authStore";

const classStore = useClassStore();
const auth = useAuthStore();

const teacherId = auth.user?.id;

const notes = ref([]);
const loading = ref(false);
const showDialog = ref(false);
const noteToDelete = ref(null);

const form = ref({
  subject: "",
  title: "",
  content: "",
  file: null,
});

const teacherNotes = computed(() =>
  notes.value.filter((n) => n.teacher_id === teacherId)
);

const groupedNotes = computed(() => {
  const groups = {};
  teacherNotes.value.forEach((note) => {
    if (!groups[note.subject]) groups[note.subject] = [];
    groups[note.subject].push(note);
  });
  return groups;
});

const fetchNotes = async () => {
  loading.value = true;
  try {
    notes.value = await listNotes();
  } finally {
    loading.value = false;
  }
};

const onFileUpload = (e) => {
  form.value.file = e.target.files[0];
};

const submitNote = async () => {
  const activeClass = classStore.activeClass;
  console.log(activeClass);

  if (!activeClass?.class_instance) {
    alert("Please select a class first.");
    return;
  }

  const fd = new FormData();
  fd.append("subject", form.value.subject);
  fd.append("title", form.value.title);
  fd.append("content", form.value.content);
  fd.append("class_instance", activeClass.class_instance);

  if (form.value.file) {
    fd.append("file", form.value.file);
  }

  await createNote(fd);

  form.value = {
    subject: "",
    title: "",
    content: "",
    file: null,
  };

  showDialog.value = false;
  await fetchNotes();
};

const confirmDelete = (note) => {
  noteToDelete.value = note;
};

const cancelDelete = () => {
  noteToDelete.value = null;
};

const removeNote = async () => {
  if (!noteToDelete.value) return;

  await deleteNote(noteToDelete.value.id);
  noteToDelete.value = null;
  await fetchNotes();
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString() +
    " " +
    d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
};

onMounted(fetchNotes);
</script>

<template>
  <div class="p-6 relative">
    <div class="flex items-center justify-between mb-6">
      <button
        @click="showDialog = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
      >
        + Add Notes
      </button>
    </div>

    <div v-if="loading" class="text-gray-600">
      Loading notes...
    </div>

    <div v-else>
      <div
        v-for="(items, subject) in groupedNotes"
        :key="subject"
        class="mb-10"
      >
        <h3 class="text-xl font-semibold mb-4 border-b pb-1">
          {{ SUBJECTS.find((s) => s.value === subject)?.label || subject }}
        </h3>

        <div class="space-y-4">
          <div
            v-for="note in items"
            :key="note.id"
            class="grid grid-cols-5 gap-4 items-center bg-white border rounded-lg p-4 shadow-sm hover:bg-gray-50"
          >
            <div class="col-span-2">
              <button
                @click="window.open(note.file_url, '_blank')"
                class="text-blue-600 font-semibold hover:underline"
              >
                {{ note.title }}
              </button>

              <p class="text-gray-600 text-sm">
                {{ note.content }}
              </p>
            </div>

            <div class="text-gray-700 text-sm">
              {{ note.class_instance_display }}
            </div>

            <div class="flex flex-col items-end space-y-1">
              <button
                @click="confirmDelete(note)"
                class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Delete
              </button>

              <span class="text-gray-500 text-xs">
                Uploaded: {{ formatDate(note.created_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div
      v-if="noteToDelete"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white w-full max-w-sm rounded-lg p-6 shadow-xl">
        <p class="mb-4 text-gray-800">
          Are you sure you want to delete
          <strong>{{ noteToDelete.title }}</strong>?
        </p>

        <div class="flex justify-end space-x-3">
          <button
            @click="cancelDelete"
            class="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            @click="removeNote"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add Note Dialog -->
    <div
      v-if="showDialog"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white w-full max-w-lg rounded-lg p-6 shadow-xl">
        <h3 class="text-xl font-semibold mb-4">
          Add New Note
        </h3>

        <label class="block text-sm font-medium mb-1">
          Class
        </label>

        <div class="w-full p-2 border rounded mb-3 bg-gray-100">
          {{ classStore.activeClass?.class_level_name }}
          {{ classStore.activeClass?.stream_name }}
        </div>

        <label class="block text-sm font-medium mb-1">
          Subject
        </label>

        <select
          v-model="form.subject"
          class="w-full p-2 border rounded mb-3"
        >
          <option disabled value="">
            Select Subject
          </option>

          <option
            v-for="s in SUBJECTS"
            :key="s.value"
            :value="s.value"
          >
            {{ s.label }}
          </option>
        </select>

        <label class="block text-sm font-medium mb-1">
          Title
        </label>

        <input
          v-model="form.title"
          type="text"
          class="w-full p-2 border rounded mb-3"
        />

        <label class="block text-sm font-medium mb-1">
          Description
        </label>

        <textarea
          v-model="form.content"
          rows="3"
          class="w-full p-2 border rounded mb-3"
        ></textarea>

        <label class="block text-sm font-medium mb-1">
          Click to Upload File
        </label>

        <input
          type="file"
          @change="onFileUpload"
          class="mb-4"
        />

        <div class="flex justify-end space-x-3 mt-4">
          <button
            @click="showDialog = false"
            class="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            @click="submitNote"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>