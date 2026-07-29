
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-6xl mx-auto px-4 py-8">

      <!-- Header -->
      <div class="mb-8">
       

        <h1 class="text-3xl font-bold text-slate-900 mt-1">
          Student Attendance
        </h1>

      
      </div>

      <!-- Student Selector -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6">

        <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Select Student
        </label>

        <div v-if="studentsLoading" class="text-sm text-slate-500 mt-2">
          Loading students...
        </div>

        <div v-else-if="students.length === 0" class="text-sm text-amber-600 mt-2">
          No students linked to this account.
        </div>

        <div v-else-if="students.length === 1" class="mt-2 font-semibold text-slate-800">
          {{ students[0].full_name }}
        </div>

        <select
          v-else
          v-model="selectedStudentId"
          @change="onStudentChange"
          class="mt-2 w-full max-w-xs border border-slate-300 rounded-lg px-4 py-2 text-sm"
        >
          <option value="" disabled>Select student</option>
          <option v-for="s in students" :key="s.id" :value="s.id">
            {{ s.full_name }}
          </option>
        </select>

      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-slate-500 animate-pulse">
        Loading attendance records...
      </div>

      <!-- Error -->
      <div v-else-if="error"
           class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {{ error }}
      </div>

      <!-- Empty -->
      <div
        v-else-if="attendanceEntries.length === 0"
        class="bg-white border border-slate-200 rounded-xl p-10 text-center"
      >
        <div class="text-3xl mb-3">📅</div>

        <h3 class="text-lg font-semibold text-slate-800">
          No attendance records
        </h3>

        
      </div>

      <!-- Attendance Content -->
      <div v-else class="space-y-6">

        <!-- Summary -->
        <div class="grid md:grid-cols-3 gap-4">

          <div class="bg-white border rounded-xl p-4 shadow-sm">
            <p class="text-xs text-slate-500 uppercase">Present</p>
            <p class="text-2xl font-bold text-green-600">
              {{ summary.present }}
            </p>
          </div>

          <div class="bg-white border rounded-xl p-4 shadow-sm">
            <p class="text-xs text-slate-500 uppercase">Absent</p>
            <p class="text-2xl font-bold text-red-600">
              {{ summary.absent }}
            </p>
          </div>

          <div class="bg-white border rounded-xl p-4 shadow-sm">
            <p class="text-xs text-slate-500 uppercase">Excused</p>
            <p class="text-2xl font-bold text-yellow-600">
              {{ summary.excused }}
            </p>
          </div>

        </div>

        <!-- Timeline Attendance -->
        <div
          v-for="day in attendanceEntries"
          :key="day.date"
          class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
        >

          <!-- Date Header -->
          <div class="bg-slate-100 px-5 py-3 flex justify-between items-center">
            <h3 class="font-semibold text-slate-800">
              {{ formatDate(day.date) }}
            </h3>

            <span
              class="text-xs font-semibold px-3 py-1 rounded-full"
              :class="badgeColor(day.status)"
            >
              {{ day.status }}
            </span>
          </div>

          <!-- Records -->
          <div class="p-5 space-y-3">

            <div
              v-for="record in day.records"
              :key="record.time_marked"
              class="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p class="text-sm font-medium text-slate-800">
                  {{ record.status }}
                </p>

                <p class="text-xs text-slate-500">
                  Marked by {{ record.marked_by }}
                </p>
              </div>

              <div class="text-sm text-slate-600">
                {{ record.time_marked }}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  </div>
</template>


<script setup>

import { ref, computed, onMounted } from 'vue'
import { getAttendance } from '../api/attendance'
import { getStudent } from '../api/Students'

const attendance = ref({})
const loading = ref(false)
const error = ref(null)

const students = ref([])
const studentsLoading = ref(true)
const selectedStudentId = ref('')

/* Fetch Attendance */

const fetchAttendance = async (studentId) => {

  if (!studentId) return

  loading.value = true
  error.value = null

  try {

    const res = await getAttendance(studentId)

    attendance.value = res.data ?? {}

  } catch (err) {

    console.error(err)

    error.value = "Failed to load attendance records."

    attendance.value = {}

  } finally {

    loading.value = false

  }

}

/* Student change */

const onStudentChange = async () => {

  await fetchAttendance(selectedStudentId.value)

}

/* Load students */

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

    error.value = "Cannot load students."

  } finally {

    studentsLoading.value = false

  }

})

/* Transform Attendance */

const attendanceEntries = computed(() => {

  return Object.entries(attendance.value).map(([date, records]) => {

    const status = records[0]?.status ?? "UNKNOWN"

    return {

      date,

      status,

      records

    }

  })

})

/* Summary */

const summary = computed(() => {

  let present = 0
  let absent = 0
  let excused = 0

  attendanceEntries.value.forEach(day => {

    if (day.status === "PRESENT") present++
    if (day.status === "ABSENT") absent++
    if (day.status === "EXCUSED") excused++

  })

  return { present, absent, excused }

})

/* Helpers */

function formatDate(date) {

  return new Date(date).toLocaleDateString(undefined,{
    weekday:"long",
    month:"short",
    day:"numeric",
    year:"numeric"
  })

}

function badgeColor(status) {

  switch(status){

    case "PRESENT":
      return "bg-green-100 text-green-700"

    case "ABSENT":
      return "bg-red-100 text-red-700"

    case "EXCUSED":
      return "bg-yellow-100 text-yellow-700"

    default:
      return "bg-slate-100 text-slate-600"

  }

}

</script>


<style scoped>

</style>