<template>
  <div class="p-6 bg-gray-50 rounded-xl space-y-6">
    <!-- Header + Macro Filter -->
    <div class="flex flex-wrap justify-between items-center gap-4">
      <h2 class="text-2xl font-semibold text-gray-800">Attendance Management</h2>

      <div class="flex items-center gap-2">
        <select
          v-model="periodType"
          class="border rounded px-3 py-1.5 text-sm text-gray-700"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>

        <template v-if="periodType === 'custom'">
          <input type="date" v-model="customStart" class="border rounded px-2 py-1.5 text-sm" />
          <span class="text-gray-400 text-sm">to</span>
          <input type="date" v-model="customEnd" class="border rounded px-2 py-1.5 text-sm" />
        </template>
      </div>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-sm font-medium text-gray-500 mb-1">
          {{ periodLabel }} Attendance Rate
        </h3>
        <div v-if="loading" class="text-gray-400 text-sm">Loading…</div>
        <div v-else>
          <p class="text-3xl font-semibold text-gray-800">
            {{ attendanceRate.percentage }}%
          </p>
          <p class="text-sm text-gray-500">
            {{ attendanceRate.present }} / {{ attendanceRate.total }} students present
          </p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-sm font-medium text-gray-500 mb-1">Submission Compliance</h3>
        <div v-if="loading" class="text-gray-400 text-sm">Loading…</div>
        <p
          v-else
          class="text-3xl font-semibold"
          :class="isFullyCompliant ? 'text-gray-800' : 'text-red-600'"
        >
          {{ submission.submitted }} / {{ submission.total }} Classes Submitted
        </p>
      </div>
    </div>

    <!-- Compliance Tracker -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex items-center gap-4 mb-4 border-b">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="pb-2 text-sm font-medium border-b-2 -mb-px"
          :class="activeTab === tab.value
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="loading" class="text-gray-400 text-sm py-6 text-center">Loading classes…</div>
      <div v-else-if="filteredClasses.length === 0" class="text-gray-400 text-sm py-6 text-center">
        No classes match this filter.
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b">
            <th class="py-2 pr-4">Class Name</th>
            <th class="py-2 pr-4">Class Teacher</th>
            <th class="py-2 pr-4">Status</th>
            <th class="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in filteredClasses"
            :key="row.class_instance_id"
            class="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
            @click="openClassDetail(row)"
          >
            <td class="py-2 pr-4 font-medium text-gray-800">{{ row.display_name }}</td>
            <td class="py-2 pr-4 text-gray-600">{{ row.class_teacher || 'Not assigned' }}</td>
            <td class="py-2 pr-4">
              <span
                class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="statusBadgeClass(row.status)"
              >
                {{ statusLabel(row.status) }}
              </span>
            </td>
            <td class="py-2 pr-4">
              <button
                class="text-xs px-2 py-1 rounded border text-gray-400 border-gray-200 cursor-not-allowed"
                title="Coming soon"
                disabled
                @click.stop
              >
                Send Reminder
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!--
      TODO (next step): drill-down screen (roll-call grid + student
      profile drawer). openClassDetail() below is a placeholder until
      that component exists — confirm whether this project uses
      vue-router (push to a named route) or a local modal/drawer
      pattern before I build it, so it matches how other drill-downs
      in the app already work.
    -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { fetchComplianceDashboard } from '../api/attendance'

const periodType = ref('today')
const customStart = ref('')
const customEnd = ref('')
const activeTab = ref('all')

const loading = ref(false)
const errorMessage = ref('')

const attendanceRate = ref({ percentage: 0, present: 0, total: 0 })
const submission = ref({ submitted: 0, total: 0 })
const classes = ref([])

const tabs = [
  { value: 'all', label: 'All Classes' },
  { value: 'pending', label: 'Pending Submission' },
  { value: 'submitted', label: 'Submitted' },
]

const periodLabel = computed(() => {
  switch (periodType.value) {
    case 'today': return "Today's"
    case 'yesterday': return "Yesterday's"
    case 'week': return "This Week's"
    case 'month': return "This Month's"
    default: return 'Selected Period'
  }
})

const isFullyCompliant = computed(() =>
  submission.value.total > 0 && submission.value.submitted === submission.value.total
)

const filteredClasses = computed(() => {
  if (activeTab.value === 'pending') {
    return classes.value.filter(c => c.status !== 'SUBMITTED')
  }
  if (activeTab.value === 'submitted') {
    return classes.value.filter(c => c.status === 'SUBMITTED')
  }
  return classes.value
})

function statusLabel(status) {
  if (status === 'SUBMITTED') return 'Submitted'
  if (status === 'PARTIAL') return 'Partial'
  return 'Missing'
}

function statusBadgeClass(status) {
  if (status === 'SUBMITTED') return 'bg-green-100 text-green-700'
  if (status === 'PARTIAL') return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

// Yesterday / Custom Range are computed client-side since the backend
// only understands date / week / month / term / academic_year /
// start_date+end_date — there's no "yesterday" keyword server-side.
function buildParams() {
  const today = new Date()

  if (periodType.value === 'today') {
    return {}
  }
  if (periodType.value === 'yesterday') {
    const d = new Date(today)
    d.setDate(d.getDate() - 1)
    return { date: d.toISOString().slice(0, 10) }
  }
  if (periodType.value === 'week') {
    return { week: `${today.getFullYear()}-W${String(getISOWeek(today)).padStart(2, '0')}` }
  }
  if (periodType.value === 'month') {
    return { month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}` }
  }
  if (periodType.value === 'custom' && customStart.value && customEnd.value) {
    return { start_date: customStart.value, end_date: customEnd.value }
  }
  return {}
}

// Minimal ISO week calculation to match the backend's fromisocalendar
// expectations (YYYY-Www).
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await fetchComplianceDashboard(buildParams())
    attendanceRate.value = data.attendance_rate
    submission.value = data.submission
    classes.value = data.classes
  } catch (err) {
    console.error('Failed loading compliance dashboard:', err)
    errorMessage.value = 'Could not load attendance data. Please try again.'
  } finally {
    loading.value = false
  }
}

function openClassDetail(row) {
  // Placeholder until the drill-down component is built.
  console.log('Open class detail for', row.class_instance_id)
}

watch([periodType, customStart, customEnd], ([type], [prevType]) => {
  if (type === 'custom' && (!customStart.value || !customEnd.value)) {
    return // wait until both custom dates are picked
  }
  loadDashboard()
})

onMounted(loadDashboard)
</script>