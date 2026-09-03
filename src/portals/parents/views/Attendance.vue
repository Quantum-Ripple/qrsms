
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-5xl mx-auto px-4 py-6 sm:py-8">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">
          Student Attendance
        </h1>
      
      </div>

      <!-- Student Selector -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 mb-6">

        <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Student
        </label>

        <div v-if="studentsLoading" class="text-sm text-slate-500 mt-2">
          Loading students...
        </div>

        <div
          v-else-if="students.length === 0"
          class="text-sm text-amber-600 mt-2"
        >
          No students linked to this account.
        </div>

        <div
          v-else-if="students.length === 1"
          class="mt-2 font-semibold text-slate-800"
        >
          {{ students[0].full_name }}
        </div>

        <select
          v-else
          v-model="selectedStudentId"
          @change="onStudentChange"
          class="mt-2 w-full sm:max-w-xs border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="" disabled>Select student</option>

          <option
            v-for="student in students"
            :key="student.id"
            :value="student.id"
          >
            {{ student.full_name }}
          </option>
        </select>

      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="bg-white border border-slate-200 rounded-2xl p-10 text-center"
      >
        <div class="animate-pulse text-sm text-slate-500">
          Loading attendance...
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl"
      >
        {{ error }}
      </div>

      <!-- No student -->
      <div
        v-else-if="students.length === 0"
        class="bg-white border border-slate-200 rounded-2xl p-10 text-center"
      >
        <div class="text-3xl mb-3">👤</div>

        <h3 class="text-lg font-semibold text-slate-800">
          No students found
        </h3>
      </div>

      <!-- Attendance -->
      <div v-else class="space-y-5">

        <!-- Summary -->
        <div class="grid grid-cols-3 gap-3 sm:gap-4">

          <div class="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#4ade80]"></span>
              <span class="text-xs sm:text-sm text-slate-500">
                Present
              </span>
            </div>

            <p class="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {{ summary.present }}
            </p>
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#f87171]"></span>
              <span class="text-xs sm:text-sm text-slate-500">
                Absent
              </span>
            </div>

            <p class="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {{ summary.absent }}
            </p>
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#facc15]"></span>
              <span class="text-xs sm:text-sm text-slate-500">
                Late
              </span>
            </div>

            <p class="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {{ summary.late }}
            </p>
          </div>

        </div>

        <!-- Calendar -->
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          <!-- Calendar Header -->
          <div class="px-4 sm:px-6 py-4 border-b border-slate-100">

            <div class="flex items-center justify-between">

              <button
                @click="previousMonth"
                class="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition"
                aria-label="Previous month"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div class="text-center">
                <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                  {{ monthName }}
                </h2>

                <p class="text-xs text-slate-500 mt-0.5">
                  {{ currentYear }}
                </p>
              </div>

              <button
                @click="nextMonth"
                class="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition"
                aria-label="Next month"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

            </div>

          </div>

          <!-- Weekdays -->
          <div class="grid grid-cols-7 px-2 sm:px-4 pt-4">

            <div
              v-for="day in weekdays"
              :key="day"
              class="text-center text-[10px] sm:text-xs font-semibold text-slate-400 uppercase"
            >
              {{ day }}
            </div>

          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-y-2 sm:gap-y-3 px-2 sm:px-4 py-4">

            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="min-h-[58px] sm:min-h-[72px] flex flex-col items-center justify-start"
            >

              <!-- Empty calendar cell -->
              <template v-if="!day.date">
                <div></div>
              </template>

              <template v-else>

                <button
                  @click="selectDate(day)"
                  :disabled="day.isFuture"
                  class="relative flex flex-col items-center focus:outline-none"
                  :class="{
                    'cursor-pointer': !day.isFuture,
                    'cursor-default': day.isFuture
                  }"
                >

                  <!-- Date -->
                  <span
                    class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm sm:text-base transition"
                    :class="dateNumberClass(day)"
                  >
                    {{ day.day }}
                  </span>

                  <!-- Attendance circle -->
                  <span
                    v-if="day.status"
                    class="mt-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full"
                    :style="{ backgroundColor: statusColor(day.status) }"
                  ></span>

                </button>

              </template>

            </div>

          </div>

          <!-- Legend -->
          <div class="border-t border-slate-100 px-4 sm:px-6 py-4">

            <div class="flex flex-wrap justify-center gap-x-4 gap-y-2">

              <div class="flex items-center gap-1.5 text-xs text-slate-600">
                <span class="w-3 h-3 rounded-full bg-[#4ade80]"></span>
                Present
              </div>

              <div class="flex items-center gap-1.5 text-xs text-slate-600">
                <span class="w-3 h-3 rounded-full bg-[#f87171]"></span>
                Absent
              </div>

              <div class="flex items-center gap-1.5 text-xs text-slate-600">
                <span class="w-3 h-3 rounded-full bg-[#facc15]"></span>
                Late
              </div>

              <div class="flex items-center gap-1.5 text-xs text-slate-600">
                <span class="w-3 h-3 rounded-full bg-[#9ca3af]"></span>
                Excused
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

    <!-- Date Details Modal -->
    <Transition name="fade">

      <div
        v-if="selectedDate"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click.self="closeDateDetails"
      >

        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
          @click="closeDateDetails"
        ></div>

        <!-- Modal -->
        <div
          class="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xl p-5 sm:p-6"
        >

          <!-- Close -->
          <button
            @click="closeDateDetails"
            class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Date -->
          <p class="text-sm text-slate-500">
            {{ formatFullDate(selectedDate.date) }}
          </p>

          <div class="flex items-center gap-3 mt-4">

            <span
              class="w-4 h-4 rounded-full"
              :style="{ backgroundColor: statusColor(selectedDate.status) }"
            ></span>

            <h3 class="text-xl font-bold text-slate-900">
              {{ statusLabel(selectedDate.status) }}
            </h3>

          </div>

          <!-- Details -->
          <div
            v-if="selectedDate.record"
            class="mt-5 space-y-3 bg-slate-50 rounded-xl p-4"
          >

            <div
              v-if="selectedDate.record.time_marked"
              class="flex justify-between gap-4"
            >
              <span class="text-sm text-slate-500">
                Time marked
              </span>

              <span class="text-sm font-medium text-slate-800">
                {{ formatTime(selectedDate.record.time_marked) }}
              </span>
            </div>

            <div
              v-if="selectedDate.record.marked_by"
              class="flex justify-between gap-4"
            >
              <span class="text-sm text-slate-500">
                Marked by
              </span>

              <span class="text-sm font-medium text-slate-800 text-right break-all">
                {{ selectedDate.record.marked_by }}
              </span>
            </div>

          </div>

          <!-- No record -->
          <div
            v-else
            class="mt-5 bg-slate-50 rounded-xl p-4"
          >
            <p class="text-sm text-slate-600">
              No attendance was recorded for this day.
            </p>
          </div>

        </div>

      </div>

    </Transition>

  </div>
</template>


<script setup>

import { ref, computed, onMounted } from 'vue'
import { getAttendance } from '../api/attendance'
import { getStudent } from '../api/Students'


/* -------------------------------------------------------
   State
------------------------------------------------------- */

const attendance = ref({})
const loading = ref(false)
const error = ref(null)

const students = ref([])
const studentsLoading = ref(true)
const selectedStudentId = ref('')

const today = new Date()

const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const selectedDate = ref(null)


/* -------------------------------------------------------
   Constants
------------------------------------------------------- */

const weekdays = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
]

const STATUS_COLORS = {
  PRESENT: '#4ade80',
  ABSENT: '#f87171',
  LATE: '#facc15',
  EXCUSED: '#9ca3af'
}


/* -------------------------------------------------------
   Fetch Attendance
------------------------------------------------------- */

const fetchAttendance = async (studentId) => {

  if (!studentId) return

  loading.value = true
  error.value = null

  try {

    const res = await getAttendance(studentId)

    attendance.value = res.data ?? {}

  } catch (err) {

    console.error(err)

    error.value = 'Failed to load attendance records.'
    attendance.value = {}

  } finally {

    loading.value = false

  }

}


/* -------------------------------------------------------
   Student Change
------------------------------------------------------- */

const onStudentChange = async () => {

  selectedDate.value = null

  await fetchAttendance(selectedStudentId.value)

}


/* -------------------------------------------------------
   Load Students
------------------------------------------------------- */

onMounted(async () => {

  studentsLoading.value = true

  try {

    const data = await getStudent()

    students.value = Array.isArray(data) ? data : []

    if (students.value.length === 1) {

      selectedStudentId.value = students.value[0].id

      await fetchAttendance(selectedStudentId.value)

    }

  } catch (err) {

    console.error(err)

    error.value = 'Cannot load students.'

  } finally {

    studentsLoading.value = false

  }

})


/* -------------------------------------------------------
   Month Name
------------------------------------------------------- */

const monthName = computed(() => {

  return new Date(
    currentYear.value,
    currentMonth.value,
    1
  ).toLocaleDateString(undefined, {
    month: 'long'
  })

})


/* -------------------------------------------------------
   Calendar Days
------------------------------------------------------- */

const calendarDays = computed(() => {

  const firstDay = new Date(
    currentYear.value,
    currentMonth.value,
    1
  ).getDay()

  const daysInMonth = new Date(
    currentYear.value,
    currentMonth.value + 1,
    0
  ).getDate()

  const days = []

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {

    days.push({
      date: null
    })

  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {

    const date = formatDateKey(
      currentYear.value,
      currentMonth.value,
      day
    )

    const record = attendance.value[date]?.[0] ?? null

    const dateObject = new Date(
      currentYear.value,
      currentMonth.value,
      day
    )

    const isFuture = dateObject > today

    /*
      If there is no attendance record and the day
      has already happened, show EXCUSED/Unavailable.

      Future dates remain unmarked.
    */
    let status = null

    if (!isFuture) {

      status = record?.status ?? 'EXCUSED'

    } else if (record) {

      status = record.status

    }

    days.push({
      date,
      day,
      status,
      record,
      isFuture
    })

  }

  return days

})


/* -------------------------------------------------------
   Summary
------------------------------------------------------- */

const summary = computed(() => {

  let present = 0
  let absent = 0
  let late = 0

  Object.entries(attendance.value).forEach(
    ([date, records]) => {

      const status = records?.[0]?.status

      if (status === 'PRESENT') {
        present++
      }

      if (status === 'ABSENT') {
        absent++
      }

      if (status === 'LATE') {
        late++
      }

    }
  )

  return {
    present,
    absent,
    late
  }

})


/* -------------------------------------------------------
   Calendar Navigation
------------------------------------------------------- */

function previousMonth() {

  if (currentMonth.value === 0) {

    currentMonth.value = 11
    currentYear.value--

  } else {

    currentMonth.value--

  }

  selectedDate.value = null

}


function nextMonth() {

  if (currentMonth.value === 11) {

    currentMonth.value = 0
    currentYear.value++

  } else {

    currentMonth.value++

  }

  selectedDate.value = null

}


/* -------------------------------------------------------
   Date Selection
------------------------------------------------------- */

function selectDate(day) {

  if (!day.date || day.isFuture) return

  selectedDate.value = day

}


function closeDateDetails() {

  selectedDate.value = null

}


/* -------------------------------------------------------
   Status Helpers
------------------------------------------------------- */

function statusColor(status) {

  return STATUS_COLORS[status] ?? STATUS_COLORS.EXCUSED

}


function statusLabel(status) {

  switch (status) {

    case 'PRESENT':
      return 'Present'

    case 'ABSENT':
      return 'Absent'

    case 'LATE':
      return 'Late'

    case 'EXCUSED':
      return 'Excused'

    default:
      return 'Excused'

  }

}


/* -------------------------------------------------------
   Date Helpers
------------------------------------------------------- */

function formatDateKey(year, month, day) {

  const monthPart = String(month + 1).padStart(2, '0')
  const dayPart = String(day).padStart(2, '0')

  return `${year}-${monthPart}-${dayPart}`

}


function formatFullDate(date) {

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    undefined,
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }
  )

}


function formatTime(time) {

  if (!time) return ''

  const [hours, minutes] = time.split(':')

  const date = new Date()

  date.setHours(Number(hours))
  date.setMinutes(Number(minutes))

  return date.toLocaleTimeString(
    undefined,
    {
      hour: 'numeric',
      minute: '2-digit'
    }
  )

}


/* -------------------------------------------------------
   Date Number Styling
------------------------------------------------------- */

function dateNumberClass(day) {

  if (day.isFuture) {

    return 'text-slate-400'

  }

  if (day.date === todayKey()) {

    return 'bg-slate-900 text-white font-bold'

  }

  return 'text-slate-700 hover:bg-slate-100'

}


function todayKey() {

  return formatDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

}

</script>


<style scoped>

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
