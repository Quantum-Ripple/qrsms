
import api from './axios'

export default {

  async list(params = {}) {
    const res = await api.get('/teachers/', { params })
    return res.data
  },

  // Get a single teacher
  async get(id) {
    const res = await api.get(`/teachers/${id}/`)
    return res.data
  },

  // Create a teacher
  async create(payload) {
    const res = await api.post('/teachers/', payload)
    return res.data
  },

  // Update (partial)
  async update(id, payload) {
    console.log('Updating teacher with id:', id, 'and payload:', payload)
    const res = await api.patch(`/teachers/${id}/`, payload)
    return res.data
  },

  // Delete teacher
  async remove(id) {
    const res = await api.delete(`/teachers/${id}/`)
    return res.status === 204 || res.status === 200
  },
}
