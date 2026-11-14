import { computed, reactive, ref } from 'vue'
import { getStudent } from '../../api/Students'
import { fetchTerms } from '../../api/terms'
import { fetchStudentFinance } from '../../api/financeDocuments'

// Module-scoped state keeps the selected child and term while navigating Finance pages.
const students = ref([])
const terms = ref([])
const studentId = ref('')
const termId = ref('')
const summary = ref(null)
const loading = reactive({ setup: false, summary: false })
const error = ref('')
let initialized = false
let setupPromise = null
let requestSequence = 0

const selectedStudent = computed(() => students.value.find(s => String(s.id) === String(studentId.value)))
const selectedTerm = computed(() => terms.value.find(t => String(t.id) === String(termId.value)))

function normalizeList(data) {
  const payload = data?.data ?? data
  return Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : []
}

async function loadSummary() {
  const thisRequest = ++requestSequence
  if (!studentId.value) { summary.value = null; return }
  loading.summary = true
  error.value = ''
  summary.value = null
  try {
    const result = await fetchStudentFinance(studentId.value, termId.value || undefined)
    if (thisRequest !== requestSequence) return
    summary.value = result
    if (!termId.value && result?.term?.id) termId.value = String(result.term.id)
  } catch (e) {
    if (thisRequest === requestSequence) error.value = e?.response?.data?.detail || 'Could not load student finance details.'
  } finally {
    if (thisRequest === requestSequence) loading.summary = false
  }
}

async function initialize() {
  if (initialized) return
  if (setupPromise) return setupPromise
  setupPromise = (async () => {
    loading.setup = true
    error.value = ''
    try {
      const [studentResponse, termResponse] = await Promise.all([getStudent(), fetchTerms()])
      students.value = normalizeList(studentResponse)
      terms.value = normalizeList(termResponse)
      if (!students.value.some(s => String(s.id) === String(studentId.value))) {
        studentId.value = students.value[0] ? String(students.value[0].id) : ''
      }
      if (termId.value && !terms.value.some(t => String(t.id) === String(termId.value))) termId.value = ''
      if (studentId.value) await loadSummary()
      initialized = true
    } catch (e) {
      error.value = e?.response?.data?.detail || 'Unable to load students or academic terms.'
    } finally {
      loading.setup = false
      setupPromise = null
    }
  })()
  return setupPromise
}

async function changeStudent(value) {
  studentId.value = String(value)
  await loadSummary()
}
async function changeTerm(value) {
  termId.value = String(value)
  await loadSummary()
}

export function useParentFinance() {
  return { students, terms, studentId, termId, selectedStudent, selectedTerm, summary, loading, error,
    initialize, loadSummary, changeStudent, changeTerm }
}
