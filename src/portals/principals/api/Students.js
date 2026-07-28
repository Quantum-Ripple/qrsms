
import api from '../../../api/axios'

export default {
  
  async list(params = {}) {
    const res = await api.get('/students/', { params })
    return res.data
  },

  async listAll(params = {}) {
    const allResults = []
    let page = 1

    while (true) {
      const response = await api.get('/students/', {
        params: { ...params, page }
      })
      const data = response.data

      if (Array.isArray(data)) {
        return data
      }

      const results = Array.isArray(data?.results) ? data.results : []
      if (!results.length) {
        break
      }

      allResults.push(...results)

      if (!data?.next) {
        break
      }

      page += 1
    }

    return allResults
  },

  async listpaginate(page = 1) {
    return api.get(`/students/?page=${page}`).then(res => res.data)
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


export const fetchNextAdmissionNumber = () => {
  return api.get("/students/next-admission-number/")
}