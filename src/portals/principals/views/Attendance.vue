<template>
  <div class="min-h-screen bg-gray-50 px-3 py-4 sm:px-6 sm:py-6">
    <AttendanceFilters
      :filters="filters"
      :classLevels="classLevels"
      :streams="streams"
      :classInstanceOptions="classInstanceOptions"
      :termOptions="termOptions"
      @apply="loadAttendance"
      @reset="resetFilters"
      @class-level-change="onClassLevelChange"
    />

    <div class="mt-2 mb-6 flex gap-3">
      <button @click="exportPDF" :disabled="!attendanceRecords.length" class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300">Export PDF</button>
      <button @click="printReport" :disabled="!attendanceRecords.length" class="inline-flex items-center justify-center rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400">Print</button>
    </div>

    <div class="grid gap-4 lg:grid-cols-4 mb-6">
      <div class="rounded-xl bg-white p-4 shadow">
        <p class="text-sm text-gray-500">Total Sessions</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">{{ summary.total_sessions }}</p>
      </div>
      <div class="rounded-xl bg-white p-4 shadow">
        <p class="text-sm text-gray-500">Total Records</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">{{ summary.total_records }}</p>
      </div>
      <div class="rounded-xl bg-white p-4 shadow">
        <p class="text-sm text-gray-500">Present</p>
        <p class="mt-2 text-3xl font-semibold text-emerald-600">{{ summary.present }}</p>
      </div>
      <div class="rounded-xl bg-white p-4 shadow">
        <p class="text-sm text-gray-500">Absent</p>
        <p class="mt-2 text-3xl font-semibold text-rose-600">{{ summary.absent }}</p>
      </div>
    </div>

    <AttendanceSubmissionStatus :items="todaysSubmissionStatus" :todayDate="todayDate" @view="viewAttendanceSession" />

    <div class="grid gap-4 xl:grid-cols-3 mb-6">
      <div class="rounded-xl bg-white p-4 shadow">
        <p class="text-sm text-gray-500">Excused / Late / Other</p>
        <div class="mt-3 flex flex-wrap gap-3">
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Excused: {{ statusCounts.EXCUSED || 0 }}</span>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Late: {{ statusCounts.LATE || 0 }}</span>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">Other: {{ summary.other }}</span>
        </div>
      </div>

      <div class="rounded-xl bg-white p-4 shadow xl:col-span-2">
        <p class="text-sm text-gray-500">Attendance Submission Status</p>
        <div class="mt-4 space-y-2">
          <div v-if="submissionStatus.length" class="grid gap-2 sm:grid-cols-2">
            <div v-for="item in submissionStatus" :key="item.key" class="rounded-xl border border-slate-200 p-3">
              <p class="text-sm font-medium text-slate-700">{{ item.class_level || 'Unknown class' }} • {{ item.stream || 'All streams' }}</p>
              <p class="mt-1 text-sm text-slate-500">Status: <span :class="item.status === 'Submitted' ? 'text-emerald-600' : 'text-amber-600'">{{ item.status }}</span></p>
            </div>
          </div>
          <div v-else class="rounded-xl border border-slate-200 p-3 text-sm text-gray-500">No submission status available for the selected filters.</div>
        </div>
      </div>
    </div>

    <AttendanceRecordsTable :rows="tableRows" :loading="loading" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchClassLevels, fetchStreams } from '../api/config.js'
import { listTerms } from '../api/term.js'
import { getAttendanceSummary, getAttendanceRecords } from '../api/attendance.js'
import { fetchClassInstances } from '../api/promotions.js'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import AttendanceFilters from '../components/attendance/AttendanceFilters.vue'
import AttendanceSubmissionStatus from '../components/attendance/AttendanceSubmissionStatus.vue'
import AttendanceRecordsTable from '../components/attendance/AttendanceRecordsTable.vue'

const classLevels = ref([])
const streams = ref([])
const classInstances = ref([])
const termOptions = ref([])
const filters = ref({
  class_level: '',
  stream: '',
  class_instance: '',
  range: 'daily',
  term: '',
  from: '',
  to: '',
})
const summary = ref({
  total_sessions: 0,
  total_records: 0,
  status_counts: {},
  present: 0,
  absent: 0,
  other: 0,
})
const attendanceRecords = ref([])
const todaysAttendanceSessions = ref([])
const loading = ref(false)

const statusCounts = computed(() => summary.value.status_counts || {})
const todayDate = new Date().toISOString().slice(0, 10)

const classInstanceOptions = computed(() =>
  classInstances.value.map((ci) => ({
    value: ci.id ?? ci.class_instance ?? ci.class_instance_id,
    label: ci.class_instance_name || ci.name || `${ci.class_level_name || ci.class_level || 'Unknown'} ${ci.stream_name || ci.stream || ''}`.trim(),
  }))
)

const router = useRouter()

function viewAttendanceSession(sessionId) {
  if (!sessionId) return
  router.push({ name: 'PrincipalAttendanceSessionDetail', params: { id: sessionId } })
}

const tableRows = computed(() =>
  attendanceRecords.value.map((record, index) => {
    const classInstance = classInstances.value.find((ci) => {
      const id = ci.id ?? ci.class_instance_id ?? ci.class_instance
      const recordId = record.class_instance_id ?? record.class_instance
      return recordId && id === recordId
    })
    const date = record.date || record.session_date || record.attendance_date || ''
    const class_level = record.class_level || record.class_level_name || record.grade || classInstance?.class_level_name || classInstance?.class_level || ''
    const stream = record.stream || record.stream_name || record.stream_display || classInstance?.stream_name || classInstance?.stream || ''
    const counts = record.status_counts || record.attendance_summary || {}
    const present = record.present ?? counts.PRESENT ?? counts.present ?? (Array.isArray(record.records) ? record.records.filter((r) => r.status === 'PRESENT').length : 0)
    const absent = record.absent ?? counts.ABSENT ?? counts.absent ?? (Array.isArray(record.records) ? record.records.filter((r) => r.status === 'ABSENT').length : 0)
    const excused = record.excused ?? counts.EXCUSED ?? counts.excused ?? (Array.isArray(record.records) ? record.records.filter((r) => r.status === 'EXCUSED').length : 0)
    const late = record.late ?? counts.LATE ?? counts.late ?? (Array.isArray(record.records) ? record.records.filter((r) => r.status === 'LATE').length : 0)
    const total_records = record.total_records ?? record.records_count ?? record.total_students ?? (Array.isArray(record.records) ? record.records.length : present + absent + excused + late)
    const status = record.submitted === true || ['submitted', 'Submitted', 'done', 'completed'].includes(record.status)
      ? 'Submitted'
      : record.submitted === false || ['pending', 'Pending'].includes(record.status)
      ? 'Pending'
      : record.status || 'Unknown'

    return {
      key: `${date}-${class_level}-${stream}-${index}`,
      date,
      class_level,
      stream,
      present,
      absent,
      excused,
      late,
      total_records,
      status,
    }
  })
)

const todaysSubmissionStatus = computed(() => {
  const map = new Map()

  classInstances.value.forEach((ci) => {
    const class_level = ci.class_level_name || ci.class_level || ''
    const stream = ci.stream_name || ci.stream || ''
    const label = ci.class_instance_name || ci.name || `${class_level} ${stream}`.trim() || 'Unknown class'
    map.set(`${class_level}|${stream}`, {
      class_level,
      stream,
      label,
      status: 'Pending',
      sessionId: null,
      classInstanceId: ci.id ?? ci.class_instance_id ?? ci.class_instance,
    })
  })

  todaysAttendanceSessions.value.forEach((session) => {
    const class_level = session.class_level || session.class_level_name || ''
    const stream = session.stream || session.stream_name || ''
    const sessionId = session.id ?? session.attendance_id ?? session.pk
    const classInstanceId = session.class_instance_id ?? session.class_instance
    const label = session.class_instance_label || session.class_instance || `${class_level} ${stream}`.trim() || 'Unknown class'
    const key = `${class_level}|${stream}|${classInstanceId ?? sessionId}`
    const existing = map.get(key) || { class_level, stream, label, status: 'Pending', sessionId: null }
    existing.status = 'Submitted'
    existing.sessionId = sessionId
    map.set(key, existing)
  })

  return Array.from(map.values()).sort((a, b) => {
    if (a.class_level === b.class_level) return a.stream.localeCompare(b.stream)
    return a.class_level.localeCompare(b.class_level)
  })
})

const components = {
  AttendanceFilters,
  AttendanceSubmissionStatus,
  AttendanceRecordsTable,
}

const submissionStatus = computed(() => {
  const selectedClassLevel = filters.value.class_level
  const selectedStream = filters.value.stream
  const selectedInstance = filters.value.class_instance
  const hasRecords = attendanceRecords.value.length > 0

  if (selectedInstance) {
    return [
      {
        key: selectedInstance,
        class_level: selectedClassLevel || 'Unknown class',
        stream: selectedStream || 'Unknown stream',
        status: hasRecords ? 'Submitted' : 'Pending',
      },
    ]
  }

  if (selectedClassLevel || selectedStream) {
    return [
      {
        key: `${selectedClassLevel || 'all'}|${selectedStream || 'all'}`,
        class_level: selectedClassLevel || 'All levels',
        stream: selectedStream || 'All streams',
        status: hasRecords ? 'Submitted' : 'Pending',
      },
    ]
  }

  return []
})

function normalizeList(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.results)) return response.results
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.items)) return response.items
  return []
}

async function loadClassLevels() {
  try {
    const response = await fetchClassLevels()
    const payload = normalizeList(response)
    classLevels.value = [...new Set(payload.map((item) => item?.name).filter(Boolean))].sort()
  } catch (err) {
    console.error('Failed to load class levels:', err)
  }
}

async function loadStreams(classLevel) {
  if (!classLevel) {
    streams.value = []
    return
  }

  try {
    const response = await fetchStreams({ class_level: classLevel })
    const payload = normalizeList(response)
    streams.value = [...new Set(payload.map((item) => item?.name).filter(Boolean))].sort()
  } catch (err) {
    console.error('Failed to load streams:', err)
  }
}

async function loadClassInstances() {
  try {
    const response = await fetchClassInstances({ active_only: true })
    classInstances.value = normalizeList(response)
  } catch (err) {
    console.error('Failed to load class instances:', err)
  }
}

async function loadTermOptions() {
  try {
    const response = await listTerms()
    termOptions.value = normalizeList(response).map((term) => ({
      id: term.id ?? term.name,
      name: term.name ?? term.id,
    }))
  } catch (err) {
    console.error('Failed to load terms:', err)
  }
}

function buildDateParams() {
  const params = {}

  if (filters.value.class_level) params.class_level = filters.value.class_level
  if (filters.value.stream) params.stream = filters.value.stream
  if (filters.value.class_instance) {
    params.class_instance = filters.value.class_instance
    params.class_instance_id = filters.value.class_instance
  }

  if (filters.value.range === 'term') {
    if (filters.value.term) {
      params.term = filters.value.term
      params.term_name = filters.value.term
    }
    return params
  }

  const today = new Date()
  const formattedToday = today.toISOString().slice(0, 10)

  let fromDate = null
  let toDate = null

  if (filters.value.range === 'daily') {
    params.date = formattedToday
    params.attendance_date = formattedToday
    return params
  }

  if (filters.value.range === 'weekly') {
    const day = today.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    fromDate = new Date(today)
    fromDate.setDate(today.getDate() + mondayOffset)
    toDate = today
  } else if (filters.value.range === 'monthly') {
    fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
    toDate = today
  } else if (filters.value.range === 'custom') {
    if (filters.value.from) fromDate = new Date(filters.value.from)
    if (filters.value.to) toDate = new Date(filters.value.to)
  }

  if (fromDate && toDate) {
    params.from_date = fromDate.toISOString().slice(0, 10)
    params.to_date = toDate.toISOString().slice(0, 10)
    params.start_date = params.from_date
    params.end_date = params.to_date
  }

  return params
}

function normalizeAttendanceParams(params = {}) {
  const normalized = { ...params }
  if (normalized.date && !normalized.attendance_date) {
    normalized.attendance_date = normalized.date
  }
  if (normalized.attendance_date && !normalized.date) {
    normalized.date = normalized.attendance_date
  }
  if ((normalized.from_date || normalized.to_date) && (!normalized.start_date || !normalized.end_date)) {
    normalized.start_date = normalized.start_date || normalized.from_date
    normalized.end_date = normalized.end_date || normalized.to_date
  }
  if ((normalized.start_date || normalized.end_date) && (!normalized.from_date || !normalized.to_date)) {
    normalized.from_date = normalized.from_date || normalized.start_date
    normalized.to_date = normalized.to_date || normalized.end_date
  }
  if (normalized.class_instance && !normalized.class_instance_id) {
    normalized.class_instance_id = normalized.class_instance
  }
  if (normalized.term && !normalized.term_name) {
    normalized.term_name = normalized.term
  }
  return normalized
}

async function safeGetAttendanceSummary(params) {
  try {
    return await getAttendanceSummary(params)
  } catch (err) {
    if (err.response?.status === 500) {
      const fallback = { ...params }
      if (fallback.from_date || fallback.to_date) {
        fallback.start_date = fallback.from_date
        fallback.end_date = fallback.to_date
        delete fallback.from_date
        delete fallback.to_date
      }
      if (fallback.date) {
        fallback.attendance_date = fallback.date
        delete fallback.date
      }
      try {
        return await getAttendanceSummary(fallback)
      } catch (innerErr) {
        throw innerErr
      }
    }
    throw err
  }
}

async function safeGetAttendanceRecords(params) {
  try {
    return await getAttendanceRecords(params)
  } catch (err) {
    if (err.response?.status === 500) {
      const fallback = normalizeAttendanceParams(params)
      try {
        return await getAttendanceRecords(fallback)
      } catch (innerErr) {
        if (params.date || params.attendance_date) {
          const fallbackDate = params.date || params.attendance_date
          try {
            return await getAttendanceRecords({ attendance_date: fallbackDate })
          } catch (deepErr) {
            return await getAttendanceRecords({})
          }
        }
        return await getAttendanceRecords({})
      }
    }
    throw err
  }
}

async function loadAttendance() {
  loading.value = true
  try {
    const params = buildDateParams()
    const summaryResponse = await safeGetAttendanceSummary(params)
    const recordsResponse = await safeGetAttendanceRecords(params)

    summary.value = {
      total_sessions: summaryResponse?.total_sessions ?? 0,
      total_records: summaryResponse?.total_records ?? 0,
      status_counts: summaryResponse?.status_counts ?? {},
      present: summaryResponse?.present ?? 0,
      absent: summaryResponse?.absent ?? 0,
      other: summaryResponse?.other ?? 0,
    }
    attendanceRecords.value = normalizeList(recordsResponse)
  } catch (err) {
    console.error('Failed to load attendance:', err)
    summary.value = {
      total_sessions: 0,
      total_records: 0,
      status_counts: {},
      present: 0,
      absent: 0,
      other: 0,
    }
    attendanceRecords.value = []
  } finally {
    loading.value = false
  }
}

async function loadTodaysAttendanceSessions() {
  try {
    const today = new Date().toISOString().slice(0, 10)
    let response

    try {
      response = await getAttendanceRecords({ date: today })
    } catch (err) {
      if (err.response?.status === 500) {
        response = await getAttendanceRecords({})
      } else {
        throw err
      }
    }

    const sessions = normalizeList(response)
    todaysAttendanceSessions.value = sessions.filter((session) => {
      const sessionDate = session.date || session.session_date || session.attendance_date || ''
      return sessionDate.startsWith(today)
    })
  } catch (err) {
    console.error('Failed to load today\'s attendance sessions:', err)
    todaysAttendanceSessions.value = []
  }
}

function onClassLevelChange() {
  filters.value.stream = ''
  filters.value.class_instance = ''
  loadStreams(filters.value.class_level)
}

function resetFilters() {
  filters.value = {
    class_level: '',
    stream: '',
    class_instance: '',
    range: 'daily',
    term: '',
    from: '',
    to: '',
  }
  streams.value = []
}


function exportPDF() {
  if (!tableRows.value.length) return

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const headers = [['Date', 'Class Level', 'Stream', 'Present', 'Absent', 'Excused', 'Late', 'Total', 'Status']]
  const body = tableRows.value.map((row) => [row.date, row.class_level, row.stream, row.present, row.absent, row.excused, row.late, row.total_records, row.status])
  autoTable(doc, {
    head: headers,
    body,
    startY: 40,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
  })
  doc.save('attendance_report.pdf')
}

function printReport() {
  if (!tableRows.value.length) return

  const element = document.getElementById('attendancePrintTable')
  const printWindow = window.open('', '', 'width=900,height=700')
  if (!printWindow) return
  printWindow.document.write(`
    <html>
      <head>
        <title>Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f4f4f5; }
        </style>
      </head>
      <body>
        <h1>Attendance Report</h1>
        ${element?.outerHTML || ''}
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

onMounted(async () => {
  await loadClassLevels()
  await loadClassInstances()
  await loadStreams(filters.value.class_level)
  await loadTermOptions()
  await loadAttendance()
  await loadTodaysAttendanceSessions()
})
</script>
