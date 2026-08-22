
<template>
  <div class="space-y-6">

    <!-- ========================================================= -->
    <!-- ACADEMIC YEAR -->
    <!-- ========================================================= -->

    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div class="flex justify-between items-center">

        <div>
          <p class="text-sm text-gray-500">
            Current Academic Year
          </p>

          <h1 class="text-xl font-bold">
            {{ currentYear?.year || 'No active year' }}
          </h1>
        </div>

        <button
          @click="showYearModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Academic Year
        </button>

      </div>
    </div>


    <!-- ========================================================= -->
    <!-- TERMS -->
    <!-- ========================================================= -->

    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">

      <div class="flex justify-between items-center mb-4">

        <div>
          <p class="text-sm text-gray-500">
            School Terms
          </p>

          <h2 class="text-lg font-semibold">
            Manage Terms
          </h2>
        </div>

        <button
          @click="showTermModal = true"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Term
        </button>

      </div>


      <!-- Loading -->

      <div
        v-if="termsLoading"
        class="text-sm text-gray-500"
      >
        Loading terms...
      </div>


      <!-- No Terms -->

      <div
        v-else-if="terms.length === 0"
        class="text-sm text-gray-500 bg-gray-50 rounded-lg p-4"
      >
        No terms have been configured yet.
      </div>


      <!-- Terms -->

      <div
        v-else
        class="space-y-2"
      >

        <div
          v-for="term in terms"
          :key="term.id"
          class="flex justify-between items-center bg-gray-50 border rounded-lg p-3"
        >

          <div>

            <h3 class="font-medium">
              {{ term.name }}
            </h3>

            <p class="text-sm text-gray-500">
              {{ term.start_date }} → {{ term.end_date }}
            </p>

          </div>

          <button
            @click="removeTerm(term.id)"
            class="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>

        </div>

      </div>

    </div>


    <!-- ========================================================= -->
    <!-- CLASS LEVELS -->
    <!-- ========================================================= -->

    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">

      <div class="flex justify-between items-center">

        <div>
          <p class="text-sm text-gray-500">
            Class Levels
          </p>

          <h2 class="text-lg font-semibold">
            Manage Grades
          </h2>
        </div>

        <button
          @click="showGradeModal = true"
          class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Add Another Grade
        </button>

      </div>

    </div>


    <!-- ========================================================= -->
    <!-- CLASS LEVEL LIST -->
    <!-- ========================================================= -->

    <div
      v-if="loading"
      class="text-gray-500"
    >
      Loading...
    </div>


    <div
      v-else
      class="space-y-4"
    >

      <div
        v-for="grade in configurations"
        :key="grade.id"
        class="bg-white shadow rounded-xl p-4 border"
      >

        <!-- Grade Header -->

        <div class="flex justify-between items-center">

          <h2 class="text-lg font-semibold">
            {{ grade.name }}
          </h2>

          <button
            @click="removeClass(grade.id)"
            class="text-red-500 hover:text-red-700 text-sm"
          >
            Delete Grade
          </button>

        </div>


        <!-- Streams -->

        <div class="mt-4 space-y-2">

          <div
            v-if="!grade.streams?.length"
            class="text-sm text-gray-500"
          >
            No streams configured.
          </div>


          <div
            v-for="stream in grade.streams"
            :key="stream.id"
            class="flex justify-between items-center bg-gray-50 p-2 rounded"
          >

            <span>
              {{ stream.name }}
            </span>

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
              v-model="streamInputs[grade.id]"
              placeholder="New stream"
              class="border p-2 rounded w-full"
            />

            <LoadingButton
                type="button"
                :loading="streamLoading[grade.id]"
                loading-text="Adding..."
                class="bg-blue-500 text-white px-3 rounded hover:bg-blue-600"
                @click="addStream(grade.id)"
              >
                Add
              </LoadingButton>

          </div>

        </div>

      </div>

    </div>


    <!-- ========================================================= -->
    <!-- ACADEMIC YEAR MODAL -->
    <!-- ========================================================= -->

    <div
      v-if="showYearModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
    >

      <div
        class="bg-white rounded-xl p-6 w-full max-w-md shadow-lg"
      >

        <h2 class="text-lg font-bold mb-4">
          Create Academic Year
        </h2>


        <div class="space-y-4">

          <input
            v-model="newYear.year"
            placeholder="Year (e.g. 2026)"
            class="border p-2 w-full rounded"
          />


          <div>

            <label class="block mb-1 text-sm font-medium">
              Start Date
            </label>

            <input
              v-model="newYear.start_date"
              type="date"
              class="border p-2 w-full rounded"
            />

          </div>


          <div>

            <label class="block mb-1 text-sm font-medium">
              End Date
            </label>

            <input
              v-model="newYear.end_date"
              type="date"
              class="border p-2 w-full rounded"
            />

          </div>


          <label class="flex items-center gap-2">

            <input
              type="checkbox"
              v-model="newYear.is_current"
            />

            <span>
              Set as current year
            </span>

          </label>

        </div>


        <div class="flex justify-end gap-2 mt-6">

          <button
            @click="showYearModal = false"
            class="px-3 py-1 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            @click="addAcademicYear"
            class="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
          >
            Save
          </button>

        </div>

      </div>

    </div>


    <!-- ========================================================= -->
    <!-- TERM MODAL -->
    <!-- ========================================================= -->

  <div
  v-if="showTermModal"
  class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
>
  <div class="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">

    <h2 class="text-lg font-bold mb-4">
      Create Term
    </h2>

    <!-- Academic Year -->
    <div class="mb-4">
      <label class="block mb-1 font-medium">
        Academic Year
      </label>

      <select
        v-model="newTerm.academic_year"
        class="border p-2 w-full rounded"
        required
      >
        <option value="" disabled>
          Select academic year
        </option>

        <option
          v-for="year in academicYears"
          :key="year.id"
          :value="year.id"
        >
          {{ year.year }}
        </option>
      </select>
    </div>

    <!-- Term Name -->
    <div class="mb-4">
      <label class="block mb-1 font-medium">
        Term Name
      </label>

      <input
        v-model="newTerm.name"
        placeholder="e.g. Term 1"
        class="border p-2 w-full rounded"
      />
    </div>

    <!-- Start Date -->
    <div class="mb-4">
      <label class="block mb-1 font-medium">
        Start Date
      </label>

      <input
        v-model="newTerm.start_date"
        type="date"
        class="border p-2 w-full rounded"
      />
    </div>

    <!-- End Date -->
    <div class="mb-4">
      <label class="block mb-1 font-medium">
        End Date
      </label>

      <input
        v-model="newTerm.end_date"
        type="date"
        class="border p-2 w-full rounded"
      />
    </div>

    <div class="flex justify-end gap-2 pt-2">

      <button
        @click="showTermModal = false"
        class="px-3 py-1 border rounded"
      >
        Cancel
      </button>

      <button
        @click="addTerm"
        class="bg-green-600 text-white px-4 py-1 rounded"
      >
        Save Term
      </button>

    </div>

  </div>
</div>
    <!-- ========================================================= -->
    <!-- GRADE MODAL -->
    <!-- ========================================================= -->

    <div
      v-if="showGradeModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
    >

      <div
        class="bg-white rounded-xl p-6 w-full max-w-md shadow-lg"
      >

        <h2 class="text-lg font-bold mb-4">
          Create Grade
        </h2>


        <input
          v-model="newGrade.name"
          placeholder="Grade name (e.g. Grade 10)"
          class="border p-2 w-full rounded"
        />


        <div class="flex justify-end gap-2 mt-6">

          <button
            @click="showGradeModal = false"
            class="px-3 py-1 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            @click="addGrade"
            class="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
          >
            Save
          </button>

        </div>

      </div>

    </div>

  </div>
</template>



<script setup>

import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'

import LoadingButton from '@/components/LoadingButton.vue'


import {
  fetchConfigurations,
  createClassLevel,
  createStream,
  deleteClassLevel,
  deleteStream
} from '../api/config'


import {
  getAcademicYears,
  createAcademicYear
} from '../api/promotions'


import {
  listTerms,
  createTerm,
  deleteTerm
} from '../api/term'


// =========================================================
// QUERY CLIENT
// =========================================================

const queryClient = useQueryClient()


// =========================================================
// SCHOOL
// =========================================================

const user = JSON.parse(
  localStorage.getItem('user') || '{}'
)

const school_id = user.school || ''


// =========================================================
// ACADEMIC YEARS
// =========================================================

const showYearModal = ref(false)


const newYear = ref({
  year: '',
  start_date: '',
  end_date: '',
  is_current: false
})


const {
  data: academicYearsData,
  isFetching: academicYearsFetching
} = useQuery({

  queryKey: [
    'academic-years',
    school_id
  ],

  queryFn: async () => {

    const res = await getAcademicYears()

    return res.data || []

  },

  // Configuration data does not change frequently.
  staleTime: 15 * 60 * 1000,

  // Refresh when entering the page if stale.
  refetchOnMount: 'always'

})


const academicYears = computed(
  () => academicYearsData.value || []
)


const currentYear = computed(() =>
  academicYears.value.find(
    year => year.is_current
  )
)


const addAcademicYear = async () => {

  try {

    await createAcademicYear(
      newYear.value
    )


    showYearModal.value = false


    newYear.value = {
      year: '',
      start_date: '',
      end_date: '',
      is_current: false
    }


    // Refresh academic years.
    await queryClient.invalidateQueries({
      queryKey: [
        'academic-years',
        school_id
      ]
    })

  } catch (error) {

    console.error(
      'Creating academic year failed:',
      error
    )

  }

}


// =========================================================
// TERMS
// =========================================================

const showTermModal = ref(false)


const newTerm = ref({
  name: '',
  start_date: '',
  end_date: '',
  academic_year: ''
})


const {
  data: termsData,
  isFetching: termsFetching
} = useQuery({

  queryKey: [
    'terms',
    school_id
  ],

  queryFn: async () => {

    const res = await listTerms()

    return res || []

  },

  staleTime: 10 * 60 * 1000,

  refetchOnMount: 'always'

})


const terms = computed(
  () => termsData.value || []
)


const addTerm = async () => {

  if (!newTerm.value.name?.trim()) {
    return
  }

  if (!newTerm.value.academic_year) {
    return
  }

  if (!newTerm.value.start_date) {
    return
  }

  if (!newTerm.value.end_date) {
    return
  }


  try {

    await createTerm({

      name:
        newTerm.value.name.trim(),

      academic_year:
        newTerm.value.academic_year,

      start_date:
        newTerm.value.start_date,

      end_date:
        newTerm.value.end_date

    })


    showTermModal.value = false


    newTerm.value = {

      name: '',

      academic_year: '',

      start_date: '',

      end_date: ''

    }


    // Refresh terms.
    await queryClient.invalidateQueries({
      queryKey: [
        'terms',
        school_id
      ]
    })


  } catch (error) {

    console.error(
      'Creating term failed:',
      error.response?.data || error
    )

  }

}


const removeTerm = async (id) => {

  if (
    !confirm(
      'Are you sure you want to delete this term?'
    )
  ) {
    return
  }


  try {

    await deleteTerm(id)


    // Refresh terms.
    await queryClient.invalidateQueries({
      queryKey: [
        'terms',
        school_id
      ]
    })


  } catch (error) {

    console.error(
      'Deleting term failed:',
      error
    )

  }

}


// =========================================================
// CLASS LEVELS / STREAMS
// =========================================================

const showGradeModal = ref(false)


const newGrade = ref({
  name: ''
})
const streamInputs = ref({})
const streamLoading = ref({})


const {
  data: configurationsData,
  isFetching: configurationsFetching
} = useQuery({

  queryKey: [
    'configurations',
    school_id
  ],

  queryFn: async () => {

    const res =
      await fetchConfigurations()

    return res.data || []

  },

  staleTime: 10 * 60 * 1000,

  refetchOnMount: 'always'

})


const configurations = computed(
  () => configurationsData.value || []
)


const addGrade = async () => {

  if (!newGrade.value.name?.trim()) {
    return
  }


  try {

    await createClassLevel({

      name:
        newGrade.value.name.trim()

    })


    showGradeModal.value = false


    newGrade.value = {
      name: ''
    }


    // Refresh class levels + streams.
    await queryClient.invalidateQueries({
      queryKey: [
        'configurations',
        school_id
      ]
    })


  } catch (error) {

    console.error(
      'Creating grade failed:',
      error
    )

  }

}
/*
const addStream = async (classLevelId) => {
  const name = streamInputs.value[classLevelId]?.trim()

  console.log('Adding stream:', {
    classLevelId,
    name
  })

  if (!name) {
    console.warn('Stream name is empty')
    return
  }

  try {
    await createStream({
      class_level: classLevelId,
      name: name
    })

    // Clear the input after successful creation
    streamInputs.value[classLevelId] = ''

    // Refresh configurations
    await queryClient.invalidateQueries({
      queryKey: [
        'configurations',
        school_id
      ]
    })

  } catch (error) {
    console.error(
      'Creating stream failed:',
      error.response?.data || error
    )
  }
}
*/

const addStream = async (classLevelId) => {
  const name = streamInputs.value[classLevelId]?.trim()

  if (!name) {
    return
  }

  streamLoading.value[classLevelId] = true

  try {
    await createStream({
      class_level: classLevelId,
      name: name
    })

    streamInputs.value[classLevelId] = ''

    await queryClient.invalidateQueries({
      queryKey: [
        'configurations',
        school_id
      ]
    })

  } catch (error) {
    console.error(
      'Creating stream failed:',
      error.response?.data || error
    )

  } finally {
    streamLoading.value[classLevelId] = false
  }
}

const removeStream = async (id) => {
  if (
    !confirm(
      'Are you sure you want to delete this stream?'
    )
  ) {
    return
  }

  try {
    await deleteStream(id)

    await queryClient.invalidateQueries({
      queryKey: [
        'configurations',
        school_id
      ]
    })

  } catch (error) {

    const message =
      error.response?.data?.detail ||
      'Unable to delete this stream.'

    alert(message)

    console.error(
      'Deleting stream failed:',
      error.response?.data || error
    )
  }
}

const removeClass = async (id) => {
  if (
    !confirm(
      'Delete this grade and all streams?'
    )
  ) {
    return
  }

  try {
    await deleteClassLevel(id)

    await queryClient.invalidateQueries({
      queryKey: [
        'configurations',
        school_id
      ]
    })

  } catch (error) {

    const message =
      error.response?.data?.detail ||
      'Unable to delete this grade.'

    alert(message)

    console.error(
      'Deleting grade failed:',
      error.response?.data || error
    )
  }
}

</script>
