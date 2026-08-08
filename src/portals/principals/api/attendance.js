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
