import api from '../../../api/axios'



const normalizeEvent = (e) => {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,

    start: e.start_datetime,
    end: e.end_datetime,
    isAllDay: e.is_all_day,

    // UI helper
    date: e.start_datetime ? e.start_datetime.split('T')[0] : null,

    // category
    category: e.category?.name || 'General',
    categoryId: e.category?.id,
    categoryColor: e.category?.color || '#6B7280',

    // academic
    academicYear: e.academic_year?.id,

    // access control
    targetAudience: e.target_audience || [],

    createdBy: e.created_by,
    createdAt: e.created_at
  }
}



export const getEvents = async (params = {}) => {
  const res = await api.get('/events/', { params })

  const data = Array.isArray(res.data)
    ? res.data
    : (res.data.results || [])

  return data.map(normalizeEvent)
}

export const getEvent = async (id) => {
  const res = await api.get(`/events/${id}/`)
  return normalizeEvent(res.data)
}

export const createEvent = async (data) => {
  const payload = {
    title: data.title,
    description: data.description || '',
    location: data.location || '',

    start_datetime: data.start_datetime,
    end_datetime: data.end_datetime,
    is_all_day: data.is_all_day || false,

    academic_year: data.academic_year || null,
    category: data.category || null,

    target_audience: data.target_audience || [],
    metadata: data.metadata || {}
  }

  const res = await api.post('/events/', payload)
  return normalizeEvent(res.data)
}

export const updateEvent = async (id, data) => {
  const res = await api.patch(`/events/${id}/`, data)
  return normalizeEvent(res.data)
}

export const deleteEvent = async (id) => {
  await api.delete(`/events/${id}/`)
}



export const getAcademicYears = async () => {
  const res = await api.get('/academic-years/')
  return res.data
}



export const getCategories = async () => {
  const res = await api.get('/categories/')
  return res.data
}

export const createCategory = async (data) => {
  const res = await api.post('/categories/', data)
  return res.data
}