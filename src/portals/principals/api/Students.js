
import api from './axios'

export default {
  
  async list(params = {}) {
    const res = await api.get('/students/', { params })
    return res.data
  },

 
  async get(id) {
    const res = await api.get(`/students/${id}/`)
    return res.data
  },

  async create(payload) {
    const res = await api.post('/students-with-parents/', payload)
    return res.data
  },

  async update(id, payload) {
    const res = await api.patch(`/students/${id}/`, payload)
    
    return res.data
  },

  
  async remove(id) {
    const res = await api.delete(`/students/${id}/`)
    return res.status === 204 || res.status === 200
  },
}
