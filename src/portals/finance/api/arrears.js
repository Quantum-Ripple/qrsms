
import api from '../../../api/axios'

const base = '/arrears/'

export const getArrearsOverview = async (params = {}) => {
  const response = await api.get(base, { params })
  return response.data
}

export const getStudentArrears = async (studentId) => {
  const response = await api.get(`${base}students/${studentId}/`)
  return response.data
}

export const getLegacyArrears = async (params = {}) => {
  const response = await api.get(`${base}legacy/`, { params })
  return response.data
}

export const getLegacyArrear = async (id) => {
  const response = await api.get(`${base}legacy/${id}/`)
  return response.data
}

export const createLegacyArrear = async (payload) => {
  const response = await api.post(`${base}legacy/`, payload)
  return response.data
}

export const importLegacyArrears = async (file) => {
  const form = new FormData()
  form.append('file', file)

  const response = await api.post(
    `${base}legacy/import/`,
    form
  )
  return response.data
}

export const approveLegacyArrear = async (id) => {
  const response = await api.post(`${base}legacy/${id}/approve/`)
  return response.data
}

export const voidLegacyArrear = async (id, reason) => {
  const response = await api.post(
    `${base}legacy/${id}/void/`,
    { reason }
  )
  return response.data
}

export const searchArrearsStudents = async (search = '') => {
  const response = await api.get('/students/', {
    params: { search, page_size: 30 }
  })
  return response.data
}
