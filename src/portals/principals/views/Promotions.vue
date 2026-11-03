<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold">Student Promotion</h1>
        <p class="text-sm text-gray-500">{{ actionHint }}</p>
      </div>
      <button @click="openGenerateModal" class="bg-purple-600 text-white px-4 py-2 rounded">
        Generate Next Year Structure
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm mb-1">Source Year</label>
        <select v-model="sourceYear" class="w-full border px-3 py-2 rounded">
          <option disabled value="">Select year</option>
          <option v-for="y in academicYears" :key="y.id" :value="y.id">{{ y.name || y.year }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">Source Class</label>
        <select v-model="sourceClass" @change="loadStudents" class="w-full border px-3 py-2 rounded">
          <option disabled value="">Select class</option>
          <option v-for="c in sourceClasses" :key="c.id" :value="c.id">{{ c.display_name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">Action</label>
        <select v-model="action" class="w-full border px-3 py-2 rounded">
          <option value="PROMOTE">Promote</option>
          <option value="REPEAT">Repeat</option>
          <option value="TRANSFER">Transfer</option>
          <option value="GRADUATE">Graduate</option>
          <option value="WITHDRAW">Withdraw</option>
        </select>
      </div>

      <div v-if="requiresTarget">
        <label class="block text-sm mb-1">Target Year</label>
        <select v-model="targetYear" class="w-full border px-3 py-2 rounded">
          <option disabled value="">Select year</option>
          <option v-for="y in targetYears" :key="y.id" :value="y.id">{{ y.name || y.year }}</option>
        </select>
      </div>

      <div v-if="requiresTarget">
        <label class="block text-sm mb-1">Target Class</label>
        <select v-model="targetClass" class="w-full border px-3 py-2 rounded">
          <option disabled value="">Select class</option>
          <option v-for="c in selectableTargetClasses" :key="c.id" :value="c.id">{{ c.display_name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">Note (optional)</label>
        <input v-model="note" maxlength="255" class="w-full border px-3 py-2 rounded"
               placeholder="e.g. Left for another school" />
      </div>
    </div>

    <div v-if="students.length">
      <div class="flex justify-between mb-2">
        <h2 class="font-medium">Students ({{ selectedStudents.length }} of {{ students.length }} selected)</h2>
        <button @click="toggleAll" class="text-blue-600 text-sm">
          {{ allSelected ? 'Deselect All' : 'Select All' }}
        </button>
      </div>
      <div class="border rounded max-h-80 overflow-y-auto">
        <label v-for="s in students" :key="s.student" class="flex items-center px-3 py-2 border-b cursor-pointer">
          <input type="checkbox" :value="s.student" v-model="selectedStudents" class="mr-3" />
          <span class="mr-3 text-gray-500">{{ s.admission_number }}</span>
          <span>{{ s.student_name }}</span>
        </label>
      </div>
    </div>
    <p v-else-if="sourceClass" class="text-sm text-gray-500">No active students in this class.</p>

    <div class="flex flex-wrap gap-3">
      <button @click="run(true)" :disabled="!canSubmit || loading"
              class="border border-blue-600 text-blue-700 px-4 py-2 rounded disabled:opacity-50">
        {{ loading && !previewed ? 'Checking...' : 'Preview' }}
      </button>
      <button v-if="previewed && previewed.success.length" @click="run(false)" :disabled="loading"
              class="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
        {{ loading ? 'Processing...' : `Confirm (${previewed.success.length})` }}
      </button>
    </div>

    <div v-if="previewed" class="rounded border p-4 space-y-3">
      <h3 class="font-medium">
        Preview: {{ previewed.success.length }} student(s) will be {{ outcomeLabel }}
      </h3>
      <ul class="max-h-60 overflow-y-auto divide-y text-sm">
        <li v-for="p in previewed.preview" :key="p.student_id" class="flex justify-between gap-3 py-1">
          <span>{{ p.admission_number }} · {{ p.name }}</span>
          <span class="text-gray-600">{{ p.from }} → {{ p.to }}</span>
        </li>
      </ul>
      <div v-if="previewed.failed.length" class="rounded border border-amber-200 bg-amber-50 p-3 text-sm">
        <p class="font-medium">{{ previewed.failed.length }} student(s) cannot be processed:</p>
        <ul class="mt-1 list-disc pl-5">
          <li v-for="f in previewed.failed" :key="f.student_id">{{ studentName(f.student_id) }}: {{ f.reason }}</li>
        </ul>
      </div>
    </div>

    <div v-if="result" class="rounded border border-green-200 bg-green-50 p-4 text-sm space-y-2">
      <p class="font-medium">Done: {{ result.success.length }} student(s) updated.</p>
      <div v-if="result.failed.length">
        <p class="font-medium text-amber-800">{{ result.failed.length }} could not be updated:</p>
        <ul class="list-disc pl-5">
          <li v-for="f in result.failed" :key="f.student_id">{{ studentName(f.student_id) }}: {{ f.reason }}</li>
        </ul>
      </div>
    </div>

    <div v-if="showGenerateModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div class="bg-white p-6 rounded w-full max-w-md space-y-4">
        <h2 class="text-lg font-semibold">Generate Next Year</h2>
        <select v-model="generateForm.source_year" class="w-full border px-3 py-2 rounded">
          <option disabled value="">Source Year</option>
          <option v-for="y in academicYears" :key="y.id" :value="y.id">{{ y.name || y.year }}</option>
        </select>
        <select v-model="generateForm.target_year" class="w-full border px-3 py-2 rounded">
          <option disabled value="">Target Year</option>
          <option v-for="y in academicYears" :key="y.id" :value="y.id">{{ y.name || y.year }}</option>
        </select>
        <div class="flex justify-end gap-2">
          <button @click="showGenerateModal = false" class="border px-4 py-2 rounded">Cancel</button>
          <button @click="generateStructure" :disabled="loading"
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
  generateNextYearStructure,
} from '../api/promotions'

const unwrap = (d) => (Array.isArray(d) ? d : d?.results ?? [])

export default {
  name: 'Promotion',

  setup() {
    return { toast: useToast() }
  },

  data() {
    return {
      academicYears: [],
      sourceYear: '',
      sourceClass: '',
      targetYear: '',
      targetClass: '',
      action: 'PROMOTE',
      note: '',
      sourceClasses: [],
      targetClasses: [],
      students: [],
      selectedStudents: [],
      previewed: null,
      result: null,
      loading: false,
      showGenerateModal: false,
      generateForm: { source_year: '', target_year: '' },
    }
  },

  computed: {
    requiresTarget() {
      return ['PROMOTE', 'REPEAT', 'TRANSFER'].includes(this.action)
    },
    isLeaving() {
      return ['GRADUATE', 'WITHDRAW'].includes(this.action)
    },
    actionHint() {
      return {
        PROMOTE: 'Move students to a different class level in a later year.',
        REPEAT: 'Keep students in the same class level in a later year.',
        TRANSFER: 'Move students to another class within the same year.',
        GRADUATE: 'Students finish school and become inactive.',
        WITHDRAW: 'Students leave the school and become inactive.',
      }[this.action]
    },
    outcomeLabel() {
      return {
        PROMOTE: 'promoted',
        REPEAT: 'set to repeat',
        TRANSFER: 'transferred',
        GRADUATE: 'graduated (they will become inactive)',
        WITHDRAW: 'withdrawn (they will become inactive)',
      }[this.action]
    },
    sourceYearObj() {
      return this.academicYears.find((y) => y.id === this.sourceYear)
    },
    targetYears() {
      const src = this.sourceYearObj
      if (!src) return []
      if (this.action === 'TRANSFER') return [src]
      return this.academicYears
        .filter((y) => y.start_date > src.start_date)
        .sort((a, b) => a.start_date.localeCompare(b.start_date))
    },
    sourceInstance() {
      return this.sourceClasses.find((c) => c.id === Number(this.sourceClass))
    },
    selectableTargetClasses() {
      const src = this.sourceInstance
      if (!src) return this.targetClasses
      if (this.action === 'REPEAT') return this.targetClasses.filter((c) => c.class_level === src.class_level)
      if (this.action === 'PROMOTE') return this.targetClasses.filter((c) => c.class_level !== src.class_level)
      return this.targetClasses.filter((c) => c.id !== src.id)
    },
    allSelected() {
      return this.students.length && this.selectedStudents.length === this.students.length
    },
    canSubmit() {
      if (!this.sourceYear || !this.sourceClass || !this.selectedStudents.length) return false
      if (this.requiresTarget && (!this.targetYear || !this.targetClass)) return false
      return true
    },
    payloadSignature() {
      return JSON.stringify([this.sourceClass, this.targetClass, this.action, this.note, [...this.selectedStudents].sort()])
    },
  },

  watch: {
    async sourceYear() {
      this.sourceClass = ''
      this.students = []
      this.selectedStudents = []
      await this.loadSourceClasses()
      this.applyDefaultTargetYear()
    },
    action() {
      this.targetClass = ''
      this.applyDefaultTargetYear()
    },
    targetYear() {
      this.targetClass = ''
      this.loadTargetClasses()
    },
    payloadSignature() {
      this.previewed = null
    },
  },

  methods: {
    errorText(e) {
      const d = e?.response?.data
      if (!d) return 'Something went wrong. Please try again.'
      if (typeof d === 'string') return d
      if (d.detail) return d.detail
      if (d.error) return d.error
      return Object.values(d).flat().join(' ')
    },

    studentName(id) {
      const s = this.students.find((x) => x.student === id)
      return s ? s.student_name : `Student ${id}`
    },

    applyDefaultTargetYear() {
      if (!this.requiresTarget) {
        this.targetYear = ''
        return
      }
      const options = this.targetYears
      this.targetYear = !options.length ? '' : this.action === 'TRANSFER' ? this.sourceYear : options[0].id
    },

    async loadAcademicYears() {
      try {
        this.academicYears = unwrap(await fetchAcademicYears())
      } catch (e) {
        this.toast.error(this.errorText(e))
      }
    },

    async loadSourceClasses() {
      if (!this.sourceYear) return
      try {
        this.sourceClasses = unwrap(await fetchClassInstances({ academic_year: this.sourceYear }))
      } catch (e) {
        this.toast.error(this.errorText(e))
      }
    },

    async loadTargetClasses() {
      if (!this.targetYear) {
        this.targetClasses = []
        return
      }
      try {
        this.targetClasses = unwrap(await fetchClassInstances({ academic_year: this.targetYear }))
      } catch (e) {
        this.toast.error(this.errorText(e))
      }
    },

    async loadStudents() {
      const id = Number(this.sourceClass)
      if (!id) return
      try {
        const data = await fetchEnrollments({ class_instance: id, active_only: true })
        this.students = unwrap(data)
        this.selectedStudents = []
        this.result = null
      } catch (e) {
        this.toast.error(this.errorText(e))
      }
    },

    toggleAll() {
      this.selectedStudents = this.allSelected ? [] : this.students.map((s) => s.student)
    },

    async run(dryRun) {
      if (!this.canSubmit) return
      if (!dryRun && this.isLeaving) {
        const verb = this.action === 'GRADUATE' ? 'graduate' : 'withdraw'
        if (!window.confirm(`${verb[0].toUpperCase() + verb.slice(1)} ${this.selectedStudents.length} student(s)? They will become inactive.`)) return
      }
      this.loading = true
      try {
        const payload = {
          source_class_instance: Number(this.sourceClass),
          student_ids: [...new Set(this.selectedStudents)],
          action: this.action,
          dry_run: dryRun,
        }
        if (this.requiresTarget) payload.target_class_instance = Number(this.targetClass)
        if (this.note.trim()) payload.note = this.note.trim()

        const res = await promoteStudents(payload)
        if (dryRun) {
          this.previewed = res
          return
        }
        this.result = res
        if (res.success?.length) this.toast.success(`${res.success.length} student(s) updated`)
        if (res.failed?.length) this.toast.error(`${res.failed.length} student(s) could not be updated`)
        await this.loadStudents()
      } catch (e) {
        this.toast.error(this.errorText(e))
      } finally {
        this.loading = false
      }
    },

    openGenerateModal() {
      this.showGenerateModal = true
    },

    async generateStructure() {
      const { source_year, target_year } = this.generateForm
      if (!source_year || !target_year) return this.toast.error('Choose both years.')
      if (source_year === target_year) return this.toast.error('The two years must be different.')
      this.loading = true
      try {
        const res = await generateNextYearStructure({
          source_academic_year: source_year,
          target_academic_year: target_year,
        })
        this.toast.success(`Created ${res.created.length}, skipped ${res.skipped.length}`)
        this.showGenerateModal = false
        await this.loadSourceClasses()
        await this.loadTargetClasses()
      } catch (e) {
        this.toast.error(this.errorText(e))
      } finally {
        this.loading = false
      }
    },
  },

  async mounted() {
    await this.loadAcademicYears()
    const current = this.academicYears.find((y) => y.is_current) ?? this.academicYears[0]
    if (current) this.sourceYear = current.id
  },
}
</script>