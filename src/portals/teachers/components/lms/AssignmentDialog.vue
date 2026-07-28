<script setup>
import { reactive, ref } from 'vue'
import { SUBJECTS } from '../../../../constants/subjects'
import { STREAMS } from '../../../../constants/streams'
import { GRADES } from '../../../../constants/grades'
import { useClassStore } from '@/stores/classStore'

const emit = defineEmits(['close', 'continue'])
const classStore = useClassStore()

/*const availableSubjects = [
  { code: 'MATH', name: 'Mathematics' },
  { code: 'ENG', name: 'English' },
  { code: 'SCI', name: 'Science' },
  { code: 'HIS', name: 'History' }
]*/

//const grades = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)
//const streams = ['North', 'South', 'East', 'West']

const form = reactive({
  title: '',
  subject: '',
  class_level: '',
  stream: '',
  class_instance: '',
  due_date: ''
})

const goToBuilder = () => {
  emit('continue', {
    title: form.title,
    subject: form.subject,
    class_level: form.class_level,
    stream: form.stream,
    class_instance: classStore.activeClass?.class_instance || form.class_instance,
    due_date: form.due_date
  })
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white w-full max-w-2xl rounded-lg p-6 max-h-[90vh] overflow-y-auto">
      <h3 class="text-xl font-semibold mb-4">Add Assignment</h3>

      <div class="space-y-3">
        <input
          v-model="form.title"
          placeholder="Title"
          class="w-full p-2 border rounded"
        />

        <select v-model="form.subject" class="w-full p-2 border rounded">
          <option disabled value="">Select Subject</option>
          <option
            v-for="subject in SUBJECTS"
            :key="subject.Value"
            :value="subject.value"
          >
            {{ subject.label }}
          </option>
        </select>

        <select v-model="form.class_level" class="w-full p-2 border rounded">
          <option disabled value="">Select Class</option>
          <option v-for="g in GRADES" :key="g.value" :value="g.value">
            {{ g.value }}
          </option>
        </select>

        <select v-model="form.stream" class="w-full p-2 border rounded">
          <option disabled value="">Select Stream</option>
          <option v-for="s in STREAMS" :key="s.Value">
            {{ s.label }}
          </option>
        </select>

        <div>
          <label class="block text-sm font-medium mb-1">Deadline</label>
          <input
            type="date"
            v-model="form.due_date"
            class="w-full p-2 border rounded"
          />
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button @click="emit('close')" class="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            @click="goToBuilder"
            class="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
