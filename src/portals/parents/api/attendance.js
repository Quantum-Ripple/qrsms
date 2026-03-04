import api from '../../../api/axios'


export function getAttendance(studentId){
  return api.get(`/attendance/student/${studentId}/`)
}