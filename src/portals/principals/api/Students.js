
import api from '../../../api/axios'

export default {
  
  async list(params = {}) {
    const res = await api.get('/students/', { params })
    return res.data
  },

  /*async listAll(params = {}) {
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
*/
async listAll(params = {}) {
  // First request tells us how many records/pages exist.
  const firstResponse = await api.get('/students/', {
    params: {
      ...params,
      page: 1,
    },
  })

  const firstData = firstResponse.data

  // Non-paginated response
  if (Array.isArray(firstData)) {
    return firstData
  }

  const firstResults = Array.isArray(firstData?.results)
    ? firstData.results
    : []

  const totalCount = Number(firstData?.count || firstResults.length)

  // Determine page size from the first response.
  const pageSize = firstResults.length || totalCount

  if (!pageSize || totalCount <= pageSize) {
    return firstResults
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  // Fetch remaining pages concurrently.
  const requests = []

  for (let page = 2; page <= totalPages; page++) {
    requests.push(
      api.get('/students/', {
        params: {
          ...params,
          page,
        },
      })
    )
  }

  const responses = await Promise.all(requests)

  const remainingResults = responses.flatMap((response) => {
    const data = response.data

    return Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
        ? data
        : []
  })

  return [...firstResults, ...remainingResults]
},
  
  async listpaginate(page = 1, search = '') {
    const params = {
        page,
    }

    if (search.trim()) {
        params.search = search.trim()
    }

    const res = await api.get('/students/', { params })

    return res.data
},

  /*async listpaginate(page = 1) {
    return api.get(`/students/?page=${page}`).then(res => res.data)
  },*/

 
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