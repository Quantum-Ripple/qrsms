
import api from '../../../api/axios'

export default {

  async list(params = {}) {
    const res = await api.get('/teachers/', { params })
    return res.data
  },
 async listpaginate(page = 1, search = '') {
  const params = {
    page,
  }

  if (search.trim()) {
    params.search = search.trim()
  }

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

  // Update 
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
  async listOtherStaff(page = 1) {
    return api.get(`/non-teaching-staff/?page=${page}`).then(res => res.data)
  },

  async getOtherStaff(id) {
    const res = await api.get(`/non-teaching-staff/${id}/`)
    return res.data
  },

  async createOtherStaff(payload) {
    const res = await api.post('/non-teaching-staff/', payload)
    return res.data
  },

  async updateOtherStaff(id, payload) {
    const res = await api.patch(`/non-teaching-staff/${id}/`, payload)
    return res.data
  },

  async removeOtherStaff(id) {
    const res = await api.delete(`/non-teaching-staff/${id}/`)
    return res.status === 204 || res.status === 200
  },
}
