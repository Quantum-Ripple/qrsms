<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  fetchConfigurations,
  createClassLevel,
  createStream,
  deleteClassLevel,
  deleteStream,
  updateClassLevel,
  updateStream
} from '../api/config'

import {
  getAcademicYears,
  createAcademicYear
} from '../api/promotions' 

const academicYears = ref([])

const configurations = ref([])
const loading = ref(false)

const showYearModal = ref(false)
const showGradeModal = ref(false)

const newYear = ref({
  year: '',
  start_date: '',
  end_date: '',
  is_current: false
})

const newGrade = ref({
  name: ''
})

const loadConfigurations = async () => {
  loading.value = true
  try {
    const res = await fetchConfigurations()
    configurations.value = res.data
  } finally {
    loading.value = false
  }
}

const loadAcademicYears = async () => {
  const res = await getAcademicYears()
  academicYears.value = res.data
}

onMounted(async () => {
  await loadConfigurations()
  await loadAcademicYears()
})

const currentYear = computed(() =>
  academicYears.value.find(y => y.is_current)
)

const addAcademicYear = async () => {
  await createAcademicYear(newYear.value)
  showYearModal.value = false
  newYear.value = { year: '', start_date: '', end_date: '', is_current: false }
  await loadAcademicYears()
}

const addGrade = async () => {
  if (!newGrade.value.name?.trim()) return

  await createClassLevel({ name: newGrade.value.name.trim() })
  showGradeModal.value = false
  newGrade.value = { name: '' }
  await loadConfigurations()
}

const addStream = async (classLevelId, name) => {
  await createStream({ class_level: classLevelId, name })
  await loadConfigurations()
}

const removeStream = async (id) => {
  if(!confirm('Are you sure you want to delete this stream?')) return
  await deleteStream(id)
  await loadConfigurations()
}

const removeClass = async (id) => {
  if (!confirm('Delete this grade and all streams?')) return
  await deleteClassLevel(id)
  await loadConfigurations()
}
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="bg-blue-50 border border-blue-200 p-4 rounded-xl flex justify-between items-center">

    <div>
      <p class="text-sm text-gray-500">Current Academic Year</p>
      <h1 class="text-xl font-bold">
        {{ currentYear?.year || 'No active year' }}
      </h1>
    </div>

    <button
      @click="showYearModal = true"
      class="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Add Academic Year
    </button>

  </div>

    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-center">
      <div>
        <p class="text-sm text-gray-500">Class Levels</p>
        <h2 class="text-lg font-semibold">Manage Grades</h2>
      </div>

      <button
        @click="showGradeModal = true"
        class="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Add Another Grade
      </button>
    </div>
    
  

    <div v-if="loading" class="text-gray-500">Loading...</div>

    <div v-for="grade in configurations" :key="grade.id"
         class="bg-white shadow rounded-xl p-4 border">

      <!-- Grade Header -->
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-semibold">
          {{ grade.name }}
        </h2>

        <!--<button
          @click="removeClass(grade.id)"
          class="text-red-500 hover:text-red-700 text-sm"
        >
          Delete Grade
        </button>-->
      </div>

      <!-- Streams -->
      <div class="mt-4 space-y-2">

        <div
          v-for="stream in grade.streams"
          :key="stream.id"
          class="flex justify-between items-center bg-gray-50 p-2 rounded"
        >
          <span>{{ stream.name }}</span>

          <button
            @click="removeStream(stream.id)"
            class="text-red-400 hover:text-red-600 text-sm"
          >
            Delete
          </button>
        </div>

        <!-- Add Stream -->
        <div class="flex gap-2 mt-3">
          <input
            v-model="grade.newStream"
            placeholder="New stream"
            class="border p-2 rounded w-full"
          />

          <button
            @click="addStream(grade.id, grade.newStream)"
            class="bg-blue-500 text-white px-3 rounded"
          >
            Add
          </button>
        </div>

      </div>
    </div>
    <!-- ACADEMIC YEAR MODAL -->
<div
  v-if="showYearModal"
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
>
  <div class="bg-white w-96 p-6 rounded-xl space-y-4">

    <h2 class="text-lg font-bold">Create Academic Year</h2>

    <input
      v-model="newYear.year"
      placeholder="Year (e.g. 2026)"
      class="border p-2 w-full rounded"
    />

    <input
      v-model="newYear.start_date"
      type="date"
      class="border p-2 w-full rounded"
    />

    <input
      v-model="newYear.end_date"
      type="date"
      class="border p-2 w-full rounded"
    />

    <label class="flex items-center gap-2">
      <input type="checkbox" v-model="newYear.is_current" />
      Set as current year
    </label>

    <div class="flex justify-end gap-2">

      <button
        @click="showYearModal = false"
        class="px-3 py-1 border rounded"
      >
        Cancel
      </button>

      <button
        @click="addAcademicYear"
        class="bg-green-600 text-white px-4 py-1 rounded"
      >
        Save
      </button>

    </div>

  </div>
</div>

<!-- GRADE MODAL -->
<div
  v-if="showGradeModal"
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
>
  <div class="bg-white w-96 p-6 rounded-xl space-y-4">
    <h2 class="text-lg font-bold">Create Grade</h2>

    <input
      v-model="newGrade.name"
      placeholder="Grade name (e.g. Grade 10)"
      class="border p-2 w-full rounded"
    />

    <div class="flex justify-end gap-2">
      <button
        @click="showGradeModal = false"
        class="px-3 py-1 border rounded"
      >
        Cancel
      </button>

      <button
        @click="addGrade"
        class="bg-green-600 text-white px-4 py-1 rounded"
      >
        Save
      </button>
    </div>
  </div>
</div>
  </div>
</template>