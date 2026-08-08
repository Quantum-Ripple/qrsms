<template>
  <div class="min-h-screen bg-gray-50 px-3 py-4 sm:px-6 sm:py-6">
    <div class="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Attendance Session Details</h1>
          <p class="text-sm text-slate-500">Class attendance and student records for the selected session.</p>
        </div>
        <router-link :to="{ name: 'PrincipalAttendance' }" class="text-blue-600 hover:underline text-sm">← Back to Attendance</router-link>
      </div>

      <div v-if="loading" class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-600">Loading session details...</div>
      <div v-else-if="!session" class="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-600">No session details available.</div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="rounded-xl bg-slate-50 p-4">
            <p class="text-sm text-gray-500">Class Instance</p>
            <p class="mt-2 font-medium text-slate-900">{{ session.class_instance_label || session.class_instance || session.class_instance_id || 'N/A' }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <p class="text-sm text-gray-500">Date</p>
            <p class="mt-2 font-medium text-slate-900">{{ session.session_date || session.date || session.attendance_date || 'N/A' }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <p class="text-sm text-gray-500">Status</p>
            <p class="mt-2 font-medium text-slate-900">{{ session.status || 'Submitted' }}</p>
          </div>
        </div>

        <div class="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th class="px-4 py-3">Student</th>
                <th class="px-4 py-3">Admission</th>
                <th class="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-for="record in session.records || []" :key="record.student || record.id" class="hover:bg-slate-50">
                <td class="px-4 py-3">{{ record.full_name || record.student_name || record.name || record.student }}</td>
                <td class="px-4 py-3">{{ record.admission_number || record.admission_no || '—' }}</td>
                <td class="px-4 py-3">{{ record.status || 'N/A' }}</td>
              </tr>
              <tr v-if="!(session.records || []).length">
                <td colspan="3" class="px-4 py-6 text-center text-slate-500">No student attendance records available.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getAttendanceSession, getAttendanceRecords } from '../api/attendance.js'

const route = useRoute()
const session = ref(null)
const loading = ref(true)

async function loadSession() {
  loading.value = true
  try {
    const id = route.params.id
    session.value = await getAttendanceSession(id)
  } catch (error) {
    try {
      const response = await getAttendanceRecords({ attendance_id: route.params.id })
      if (Array.isArray(response)) {
        session.value = response[0] || null
      } else {
        session.value = response
      }
    } catch (err) {
      console.error('Failed to load attendance session detail:', err)
      session.value = null
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadSession)
</script>
