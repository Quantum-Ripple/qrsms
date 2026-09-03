import api from '../../../api/axios'

export default {
  async list(params = {}) {
    const res = await api.get('/parents/', { params })
    return res.data
  },

  async listPaginated(page = 1, search = '') {
    const params = {
      page,
    }

    if (search) {
      params.search = search
    }

    const res = await api.get('/parents/', { params })
    return res.data
  },

  async get(id) {
    const res = await api.get(`/parents/${id}/`)
    return res.data
  },

  async update(id, payload) {
    const res = await api.patch(`/parents/${id}/`, payload)
    return res.data
  },

  async remove(id) {
    const res = await api.delete(`/parents/${id}/`)
    return res.status === 204 || res.status === 200
  },

  async resetPassword(id, data) {
    const res = await api.post(`/parents/${id}/reset-password/`, data)
    return res.data
  },
  async createAccount(id, data) {
    const res = await api.post(`/parents/${id}/create-account/`, data)
    return res.data
  }
}