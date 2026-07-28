<template>
  <div class="fixed inset-0 z-50 flex justify-end">

    <div class="absolute inset-0 bg-black/30" @click="$emit('close')"></div>

    <div
      class="relative ml-auto w-full sm:w-[420px] h-full bg-white shadow-2xl flex flex-col"
      @click.stop
    >

      <div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
        <div>
          <p class="text-xs text-gray-500">Selected Date</p>
          <h2 class="text-lg font-semibold text-gray-800">
            {{ selectedDate }}
          </h2>
        </div>

        <button @click="$emit('close')" class="text-gray-500 text-lg">✕</button>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-8">

        <div>
          <h3 class="text-sm font-bold text-gray-700 mb-4">
            Scheduled Events ({{ events.length }})
          </h3>

          <div v-if="events.length" class="space-y-3">

            <div
              v-for="event in events"
              :key="event.id"
              class="p-3 rounded-xl border bg-white"
            >
              <div class="flex justify-between items-start">
                <p class="font-semibold text-gray-800">
                  {{ event.title }}
                </p>

                <span
                  class="text-[10px] px-2 py-0.5 rounded-full text-white font-bold uppercase"
                  :style="{ backgroundColor: event.categoryColor }"
                >
                  {{ event.category }}
                </span>
              </div>

              <div class="mt-2 text-[10px] text-gray-500 flex gap-3">
                <span>{{ formatTime(event.start) }}</span>
                <span v-if="event.location">{{ event.location }}</span>
              </div>
            </div>

          </div>

          <div v-else class="text-center text-gray-400 py-6 bg-gray-50 rounded-xl border">
            No events for this day
          </div>
        </div>

        <div class="pt-6 border-t">
          <h3 class="text-sm font-bold text-gray-700 mb-4">
            Create Event
          </h3>

          <div class="space-y-4">

            <input
              v-model="form.title"
              placeholder="Event title"
              class="w-full border rounded-xl px-4 py-2 text-sm"
            />

            <textarea
              v-model="form.description"
              placeholder="Description"
              class="w-full border rounded-xl px-4 py-2 text-sm resize-none"
              rows="2"
            />

            <input
              v-model="form.location"
              placeholder="Location"
              class="w-full border rounded-xl px-4 py-2 text-sm"
            />

            <div class="flex gap-2 items-center">

              <button
                @click="showCategoryModal = true"
                class="px-3 py-2 border rounded-lg text-sm"
              >
                +
              </button>

              <select
                v-model="form.category"
                class="flex-1 border rounded-xl px-4 py-2 text-sm"
              >
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>

            </div>

            <div class="grid grid-cols-2 gap-2">
              <input v-model="form.startTime" type="time" class="border rounded-xl px-3 py-2 text-sm" />
              <input v-model="form.endTime" type="time" class="border rounded-xl px-3 py-2 text-sm" />
            </div>

            <button
              @click="handleCreate"
              :disabled="submitting || !form.title"
              class="w-full bg-blue-600 text-white py-3 rounded-xl disabled:bg-gray-300"
            >
              {{ submitting ? 'Creating...' : 'Create Event' }}
            </button>

          </div>
        </div>

      </div>
    </div>

    <div
      v-if="showCategoryModal"
      class="fixed inset-0 z-[60] flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/40" @click="showCategoryModal = false"></div>

      <div class="relative bg-white w-80 p-5 rounded-xl space-y-4" @click.stop>

        <input
          v-model="newCategory.name"
          placeholder="Category name"
          class="w-full border rounded px-3 py-2 text-sm"
        />

        <input
          v-model="newCategory.color"
          type="color"
          class="w-full h-10"
        />

        <div class="flex justify-end gap-2">
          <button @click="showCategoryModal = false" class="px-3 py-1 border rounded">
            Cancel
          </button>

          <button
            @click="handleCreateCategory"
            :disabled="catLoading || !newCategory.name"
            class="px-3 py-1 bg-blue-600 text-white rounded"
          >
            {{ catLoading ? 'Saving...' : 'Save' }}
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { createEvent, getCategories, createCategory } from '../api/calendar'

const props = defineProps({
  selectedDate: String,
  events: Array
})

const emit = defineEmits(['close', 'created'])

const submitting = ref(false)
const catLoading = ref(false)

const categories = ref([])
const showCategoryModal = ref(false)

const form = reactive({
  title: '',
  description: '',
  location: '',
  category: null,
  startTime: '08:00',
  endTime: '10:00'
})

const newCategory = reactive({
  name: '',
  color: '#3b82f6'
})

const loadCategories = async () => {
  categories.value = await getCategories()
  if (categories.value.length && !form.category) {
    form.category = categories.value[0].id
  }
}

onMounted(loadCategories)

const handleCreateCategory = async () => {
  if (!newCategory.name) return

  catLoading.value = true

  try {
    const created = await createCategory({
      name: newCategory.name,
      color: newCategory.color
    })

    categories.value.push(created)
    form.category = created.id

    showCategoryModal.value = false

    newCategory.name = ''
    newCategory.color = '#3b82f6'
  } finally {
    catLoading.value = false
  }
}

const handleCreate = async () => {
  if (!form.title) return

  submitting.value = true

  try {
    await createEvent({
      title: form.title,
      description: form.description,
      location: form.location,
      start_datetime: `${props.selectedDate}T${form.startTime}:00Z`,
      end_datetime: `${props.selectedDate}T${form.endTime}:00Z`,
      category: form.category,
      target_audience: []
    })

    emit('created')
    emit('close')

    form.title = ''
    form.description = ''
    form.location = ''
    form.startTime = '08:00'
    form.endTime = '10:00'
  } finally {
    submitting.value = false
  }
}

const formatTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>