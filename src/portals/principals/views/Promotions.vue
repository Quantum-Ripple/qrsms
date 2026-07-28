<template>
  <div class="p-6 space-y-6">

    <!-- HEADER -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold">Student Promotion</h1>
      
      </div>

      <button
        @click="openGenerateModal"
        class="bg-purple-600 text-white px-4 py-2 rounded">
        Generate Next Year Structure
      </button>
    </div>

    <!-- SOURCE + TARGET -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

      <!-- SOURCE -->
      <!-- SOURCE YEAR -->
<div>
  <label class="block text-sm mb-1">Source Year</label>
  <select v-model="sourceYear" @change="filterSourceClasses"
    class="w-full border px-3 py-2 rounded">
    <option disabled value="">Select year</option>
    <option v-for="y in academicYears" :key="y.id" :value="y.id">
      {{ y.name || y.year }}
    </option>
  </select>
</div>

<!-- SOURCE CLASS -->
<div>
  <label class="block text-sm mb-1">Source Class</label>
  <select v-model="sourceClass" @change="loadStudents"
    class="w-full border px-3 py-2 rounded">
    <option disabled value="">Select class</option>
    <option v-for="c in filteredSourceClasses" :key="c.id" :value="c.id">
      {{ c.display_name }}
    </option>
  </select>
</div>

      <!-- ACTION -->
      <div>
        <label class="block text-sm mb-1">Action</label>
        <select v-model="action"
          class="w-full border px-3 py-2 rounded">
          <option value="PROMOTE">Promote</option>
          <option value="REPEAT">Repeat</option>
          <option value="TRANSFER">Transfer</option>
          <option value="GRADUATE">Graduate</option>
        </select>
      </div>

      <!-- TARGET -->
      <!-- TARGET YEAR -->
<div v-if="requiresTarget">
  <label class="block text-sm mb-1">Target Year</label>
  <select v-model="targetYear" @change="filterTargetClasses"
    class="w-full border px-3 py-2 rounded">
    <option disabled value="">Select year</option>
    <option v-for="y in academicYears" :key="y.id" :value="y.id">
      {{ y.name || y.year }}
    </option>
  </select>
</div>

<!-- TARGET CLASS -->
<div v-if="requiresTarget">
  <label class="block text-sm mb-1">Target Class</label>
  <select v-model="targetClass"
    class="w-full border px-3 py-2 rounded">
    <option disabled value="">Select class</option>
    <option v-for="c in filteredTargetClasses" :key="c.id" :value="c.id">
      {{ c.display_name }}
    </option>
  </select>
</div>

    </div>

    <!-- STUDENTS -->
    <div v-if="students.length">
      <div class="flex justify-between mb-2">
        <h2 class="font-medium">Students</h2>
        <button @click="toggleAll" class="text-blue-600 text-sm">
          {{ allSelected ? 'Deselect All' : 'Select All' }}
        </button>
      </div>

      <div class="border rounded max-h-80 overflow-y-auto">
        <div v-for="s in students" :key="s.student"
          class="flex items-center px-3 py-2 border-b">
          <input type="checkbox"
            :value="s.student"
            v-model="selectedStudents"
            class="mr-3" />
          <span>{{ s.student_name }}</span>
        </div>
      </div>
    </div>

    <!-- SUBMIT -->
    <button
      @click="submitPromotion"
      :disabled="!canSubmit || loading"
      class="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
      {{ loading ? 'Processing...' : 'Submit' }}
    </button>


    <!-- GENERATE MODAL -->
    <div v-if="showGenerateModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

      <div class="bg-white p-6 rounded w-full max-w-md space-y-4">

        <h2 class="text-lg font-semibold">Generate Next Year</h2>

        <select v-model="generateForm.source_year"
          class="w-full border px-3 py-2 rounded">
          <option disabled value="">Source Year</option>
          <option v-for="y in academicYears" :key="y.id" :value="y.id">
            {{ y.name || y.year }}
          </option>
        </select>

        <select v-model="generateForm.target_year"
          class="w-full border px-3 py-2 rounded">
          <option disabled value="">Target Year</option>
          <option v-for="y in academicYears" :key="y.id" :value="y.id">
            {{ y.name || y.year }}
          </option>
        </select>

        <div class="flex justify-end gap-2">
          <button @click="showGenerateModal=false"
            class="border px-4 py-2 rounded">
            Cancel
          </button>

          <button
            @click="generateStructure"
            :disabled="loading"
            class="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50">
            {{ loading ? 'Generating...' : 'Generate' }}
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import { useToast } from 'vue-toastification'
import {
  fetchClassInstances,
  fetchEnrollments,
  promoteStudents,
  fetchAcademicYears,
  generateNextYearStructure
} from '../api/promotions'

export default {
  name: 'Promotion',

  setup() {
    const toast = useToast()
    return { toast }
  },

  data() {
    return {
      classInstances: [],
      sourceClass: '',
      targetClass: '',
      action: 'PROMOTE',

      students: [],
      selectedStudents: [],

      academicYears: [],

      loading: false,
      result: null,

      sourceYear: '',
      targetYear: '',
      filteredSourceClasses: [],
      filteredTargetClasses: [],

      showGenerateModal: false,
      generateForm: {
        source_year: '',
        target_year: ''
      }
    }
  },

  watch: {
  sourceYear(newVal) {
    if (!this.targetYear) {
      this.targetYear = newVal
    }
  }
},

  computed: {
    requiresTarget() {
      return ['PROMOTE', 'REPEAT', 'TRANSFER'].includes(this.action)
    },

    allSelected() {
      return this.students.length &&
        this.selectedStudents.length === this.students.length
    },

   canSubmit() {
  if (!this.sourceYear || !this.sourceClass) return false
  if (!this.students.length) return false
  if (!Array.isArray(this.selectedStudents) || !this.selectedStudents.length) return false

  if (this.requiresTarget) {
    if (!this.targetYear || !this.targetClass) return false
    if (Number(this.sourceClass) === Number(this.targetClass)) return false
  }

  return true
}
  },

  methods: {
    async loadClassInstances() {
      try {
        const data = await fetchClassInstances()
        this.classInstances = Array.isArray(data) ? data : data.results
      } catch (e) {
        console.error(e)
      }
    },

    async loadStudents() {
      const sourceClassId = Number(this.sourceClass)
      if (!sourceClassId) return

      try {
        const data = await fetchEnrollments({
          class_instance: sourceClassId,
          active_only: true
        })

        this.students = Array.isArray(data) ? data : []
        this.selectedStudents = []
      } catch (e) {
        console.error(e)
      }
    },

    toggleAll() {
      this.selectedStudents = this.allSelected
        ? []
        : this.students.map(s => s.student)
    },

    async submitPromotion() {
      if (!this.canSubmit) return

      this.loading = true
      this.result = null

      try {
        const payload = {
          source_class_instance: Number(this.sourceClass),
          student_ids: [...new Set(this.selectedStudents)],
          action: this.action
        }

        if (this.requiresTarget) {
          payload.target_class_instance = Number(this.targetClass)
        }

        const res = await promoteStudents(payload)
        this.result = res

        if (Array.isArray(res?.success) && res.success.length) {
          this.toast.success(`Promotion successful: ${res.success.length} student(s) updated`)
        }

        if (Array.isArray(res?.failed) && res.failed.length) {
          this.toast.error(`Promotion completed with ${res.failed.length} failed item(s)`)
        }

        await this.loadStudents()

      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    openGenerateModal() {
      this.showGenerateModal = true
      this.loadAcademicYears()
    },

    async loadAcademicYears() {
      try {
        const data = await fetchAcademicYears()
        this.academicYears = Array.isArray(data) ? data : data.results
      } catch (e) {
        console.error(e)
      }
    },

    async generateStructure() {
      const { source_year, target_year } = this.generateForm

      if (!source_year || !target_year) {
        alert('Both years required')
        return
      }

      if (source_year === target_year) {
        alert('Cannot use same year')
        return
      }

      this.loading = true

      try {
        const res = await generateNextYearStructure({
          source_academic_year: source_year,
          target_academic_year: target_year
        })

        alert(`Created: ${res.created.length}, Skipped: ${res.skipped.length}`)

        await this.loadClassInstances()

        this.showGenerateModal = false

      } catch (e) {
        console.error(e)
        alert(e.response?.data?.error || 'Generation failed')
      } finally {
        this.loading = false
      }
    },
    async filterSourceClasses() {
  if (!this.sourceYear) return

  try {
    const data = await fetchClassInstances({
      academic_year: this.sourceYear
    })

    this.filteredSourceClasses = Array.isArray(data) ? data : data.results
    this.sourceClass = ''   // reset selection
    this.students = []
    this.selectedStudents = []
  } catch (e) {
    console.error(e)
  }
},

async filterTargetClasses() {
  if (!this.targetYear) return

  try {
    const data = await fetchClassInstances({
      academic_year: this.targetYear
    })

    this.filteredTargetClasses = Array.isArray(data) ? data : data.results
    this.targetClass = ''
  } catch (e) {
    console.error(e)
  }
}
  },

  mounted() {
    this.loadClassInstances(),
    this.loadAcademicYears()
  }
}
</script>