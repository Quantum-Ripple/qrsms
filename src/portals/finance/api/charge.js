import api from '../../../api/axios'

// ---------- Charges (Screen 1) ----------
export const getCharges = async (params = {}) => {
  const response = await api.get('/charges/', { params })
  return response.data
}

export const getChargeById = async (id) => {
  const response = await api.get(`/charges/${id}/`)
  return response.data
}

export const createCharge = async (payload) => {
  const response = await api.post('/charges/', payload)
  return response.data
}

export const updateCharge = async (id, payload) => {
  // PATCH so we can retire/reactivate with just { is_active }
  const response = await api.patch(`/charges/${id}/`, payload)
  return response.data
}
// No deleteCharge on purpose: the backend retires charges via is_active: false

// ---------- Charge rates (Screen 1) ----------
export const getChargeRates = async (params = {}) => {
  const response = await api.get('/charge-rates/', { params })
  return response.data
}

export const createChargeRate = async (payload) => {
  const response = await api.post('/charge-rates/', payload)
  return response.data
}

export const updateChargeRate = async (id, payload) => {
  const response = await api.patch(`/charge-rates/${id}/`, payload)
  return response.data
}

export const deleteChargeRate = async (id) => {
  const response = await api.delete(`/charge-rates/${id}/`)
  return response.data
}

// ---------- Assignment grid (Screen 2) ----------
export const getChargePreview = async ({ term, class_level, apply_credit = true }) => {
  const response = await api.get('/charge-preview/', {
    params: { term, class_level, apply_credit: apply_credit ? 1 : 0 },
  })
  return response.data
}

export const applyCharge = async (payload) => {
  // { charge, term, student_ids, action: 'add' | 'remove', reason }
  const response = await api.post('/billing/charges/apply/', payload)
  return response.data
}

export const getChargeAdjustments = async (params = {}) => {
  const response = await api.get('/charge-adjustments/', { params })
  return response.data
}

export const grantDiscount = async (payload) => {
  const response = await api.post('/billing/discounts/grant/', payload)
  return response.data
}

export const getDiscounts = async (params = {}) => {
  const response = await api.get('/discounts/', { params })
  return response.data
}

export const endDiscount = async (id) => {
  const response = await api.post(`/billing/discounts/${id}/end/`)
  return response.data
}

// ---------- Generate (Screen 3) ----------
export const generateInvoices = async (payload) => {
  // { term, class_level, student_ids?, apply_credit }
  // 201 = created, 200 = nothing new. Return status too so the UI can tell them apart.
  const response = await api.post('/billing/generate/', payload)
  return { status: response.status, ...response.data }
}

export const getInvoiceBatches = async (params = {}) => {
  const response = await api.get('/invoice-batches/', { params })
  return response.data
}

export const getInvoiceBatchById = async (id) => {
  const response = await api.get(`/invoice-batches/${id}/`)
  return response.data
}

export const undoInvoiceBatch = async (id) => {
  const response = await api.post(`/billing/batches/${id}/undo/`)
  return response.data
}

// ---------- Helpers ----------
// Lists return a plain array, or { results } when ?page= is used
export const unwrapList = (data) =>
  Array.isArray(data) ? data : (data?.results ?? [])

// Turn a DRF error response into one readable string
export const errorMessage = (err) => {
  const data = err?.response?.data
  if (!data) return 'Could not reach the server. Check your connection and try again.'
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  return Object.entries(data)
    .map(([field, msgs]) => `${field}: ${[].concat(msgs).join(' ')}`)
    .join(' ')
}