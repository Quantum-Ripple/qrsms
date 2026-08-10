
import api from '../../../api/axios'


export const listTerms = async () => {
  const response = await api.get('/terms/')
  return response.data
}


export const createTerm = async (payload) => {
  const response = await api.post('/terms/', payload)
  return response.data
}
export const deleteTerm = async (id) => {
  const response = await api.delete(`/terms/${id}/`)
  return response.data
}


export default {
  listTerms,
  createTerm,
  deleteTerm
}


