import api from '../../../api/axios'

export const listTerms = async () => {
    const response = await api.get('/terms/')
    return response.data
}

export const fetchTerms = async () => {
    const response = await api.get('/terms/')
    return response.data
}

export const fetchAcademicYears = async () => {
  const res = await api.get('/academic-years/')
  return res.data
}