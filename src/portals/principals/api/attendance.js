import api from '../../../api/axios'

export const getAttendanceSummary = async (params = {}) => {
  const response = await api.get('/attendance/summary/', { params })
  return response.data
}

export const getAttendanceRecords = async (params = {}) => {
  const response = await api.get('/attendance/', { params })
  return response.data
}

export const getAttendanceSession = async (sessionId) => {
  const response = await api.get(`/attendance/${sessionId}/`)
  return response.data
}
export default {
  getAttendanceSummary,
  getAttendanceRecords,
  getAttendanceSession,
}


export async function fetchComplianceDashboard(params = {}) {
  const response = await api.get('/attendance-principal/compliance/', { params })
  return response.data
}
 
/**
 * Fetch the roll-call roster for a single class on a single date.
 */
export async function fetchRollCall(classInstanceId, date) {
  const response = await api.get('/attendance-principal/roll-call/', {
    params: { class_instance: classInstanceId, date }
  })
  return response.data
}
 
/**
 * Fetch a student's term attendance summary for the drill-down drawer.
 * @param {number|string} studentId
 * @param {string} [term] - optional term id/name; backend falls back to
 *   the school's current term when omitted.
 */
export async function fetchStudentTermSummary(studentId, term) {
  const response = await api.get(`/attendance/student/${studentId}/term-summary/`, {
    params: term ? { term } : {}
  })
  return response.data
}
 
// Placeholder — backend action not wired yet (deferred, per earlier plan).
// Kept here so the UI can call it without a code change once it exists;
// currently unused by any component.
export async function sendAttendanceReminder(classInstanceId) {
  const response = await api.post(`/attendance-principal/${classInstanceId}/remind/`)
  return response.data
}
 