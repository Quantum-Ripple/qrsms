import api from './axios'

// All helpers return response.data; PDF/CSV downloads return the response Blob.
// The existing Axios instance is expected to have /api/v1 as its baseURL.
const root = '/payroll'
const get = async (path, config) => (await api.get(`${root}${path}`, config)).data
const post = async (path, payload = {}) => (await api.post(`${root}${path}`, payload)).data
const patch = async (path, payload) => (await api.patch(`${root}${path}`, payload)).data
const del = async (path, config) => (await api.delete(`${root}${path}`, config)).data

// Fetch the whole school roster rather than silently displaying only page 1.
const getAllPages = async (firstPath) => {
  const rows = []
  let next = firstPath
  for (let page = 0; next && page < 100; page += 1) {
    const payload = (await api.get(next)).data
    if (Array.isArray(payload)) return [...rows, ...payload]
    rows.push(...(payload?.results ?? []))
    next = payload?.next ?? null
  }
  if (next) throw new Error('Too many pages returned by this endpoint.')
  return rows
}

// DRF may return either an array or { count, results, next, previous }.
export const asRows = (data) => Array.isArray(data) ? data : (data?.results ?? [])
export const getErrorMessage = (error) => {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.detail) return String(data.detail)
  if (data?.non_field_errors) return data.non_field_errors.join(' ')
  if (data && typeof data === 'object') {
    const lines = Object.entries(data).map(([field, value]) =>
      `${field === 'error' ? '' : `${field}: `}${Array.isArray(value) ? value.join(', ') : String(value)}`)
    return lines.join(' · ') || 'Request failed.'
  }
  return error?.message || 'Something went wrong. Please try again.'
}
export const kenyaMonth = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit',
  }).formatToParts(new Date())
  const part = (type) => parts.find((p) => p.type === type)?.value
  return { year: Number(part('year')), month: Number(part('month')) }
}
export const kenyaDateTimeNow = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date())
  const part = (type) => parts.find((p) => p.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`
}
// Backend requires a timezone-aware value; input labels explicitly say Nairobi time.
export const nairobiISO = (localDateTime) => localDateTime ? `${localDateTime}:00+03:00` : ''
export const money = (value) => new Intl.NumberFormat('en-KE', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(Number(value || 0))
export const payrollMonthName = (year, month) => new Intl.DateTimeFormat('en-KE', {
  month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)))

// Profiles / recurring allowances
export const getPayrollProfiles = () => getAllPages(`${root}/profiles/`)
export const getPayrollProfile = (id) => get(`/profiles/${id}/`)
export const createPayrollProfile = (body) => post('/profiles/', body)
export const updatePayrollProfile = (id, body) => patch(`/profiles/${id}/`, body)
export const getPayrollAllowances = (profileId) => get(`/profiles/${profileId}/allowances/`)
export const createPayrollAllowance = (profileId, body) => post(`/profiles/${profileId}/allowances/`, body)
export const updatePayrollAllowance = (id, body) => patch(`/allowances/${id}/`, body)
export const disablePayrollAllowance = (id) => del(`/allowances/${id}/`)

// Runs and draft roster
export const getPayrollRuns = () => getAllPages(`${root}/runs/`)
export const getPayrollRun = (id) => get(`/runs/${id}/`)
export const createPayrollRun = (year, month) => post('/runs/', { year, month })
export const getPayrollReview = (id) => get(`/runs/${id}/review/`)
export const getPayrollRunSummary = (id) => get(`/runs/${id}/summary/`)
export const getPayrollEligibility = (id) => get(`/runs/${id}/eligibility/`)
export const submitPayrollRun = (id) => post(`/runs/${id}/submit/`)
export const approvePayrollRun = (id, fingerprint) => post(`/runs/${id}/approve/`, { fingerprint })
export const returnPayrollRun = (id, reason) => post(`/runs/${id}/return/`, { reason })
export const addPayrollEmployee = (runId, profile) => post(`/runs/${runId}/employees/`, { profile })
export const refreshPayrollEmployee = (lineId, reason) => post(`/lines/${lineId}/roster/`, { reason })
export const removePayrollEmployee = (lineId, reason) => del(`/lines/${lineId}/roster/`, { data: { reason } })
export const updatePayrollLine = (lineId, body) => patch(`/lines/${lineId}/`, body)
export const createPayrollEarning = (lineId, label, amount) => post(`/lines/${lineId}/earnings/`, { label, amount })
export const removePayrollEarning = (id) => del(`/earnings/${id}/`)
export const createPayrollDeduction = (lineId, label, amount) => post(`/lines/${lineId}/deductions/`, { label, amount })
export const removePayrollDeduction = (id) => del(`/deductions/${id}/`)
export const overridePayrollDeduction = (id, amount, reason) => post(`/deductions/${id}/override/`, { amount, reason })
export const addPayrollCorrectionNote = (runId, reason) => post(`/runs/${runId}/correction-note/`, { reason })

// Advances (teacher self-service and bursar-assisted non-teaching consent)
export const getPayrollAdvances = () => getAllPages(`${root}/advances/`)
export const createTeacherAdvance = (body) => post('/advances/', body)
export const startAssistedAdvance = (body) => post('/advances/assisted/start/', body)
export const completeAssistedAdvance = (body) => post('/advances/assisted/complete/', body)
export const recommendPayrollAdvance = (id, note = '') => post(`/advances/${id}/recommend/`, { note })
export const declinePayrollAdvance = (id, note = '') => post(`/advances/${id}/decline/`, { note })
export const approvePayrollAdvance = (id, note = '') => post(`/advances/${id}/approve/`, { note })
export const rejectPayrollAdvance = (id, note = '') => post(`/advances/${id}/reject/`, { note })
export const cancelPayrollAdvance = (id, reason) => post(`/advances/${id}/cancel/`, { reason })
export const getAdvanceDisbursementAuthorization = (id) => get(`/advances/${id}/disbursement-authorization/`)
export const recordAdvanceDisbursement = (id, cash) => post(`/advances/${id}/disburse/`, cash)

// Confirmed cash (manual recording does not initiate a transfer)
export const recordPayrollSalaryPayment = (lineId, cash) => post(`/lines/${lineId}/pay/`, cash)
export const reversePayrollSalaryRecording = (id, reason) => post(`/payments/${id}/reverse/`, { reason })
export const getPayrollCashEvents = () => getAllPages(`${root}/cash-events/`)
export const reconcilePayrollCashEvent = (id) => post(`/cash-events/${id}/reconcile/`)
export const dismissPayrollCashEvent = (id, reason) => post(`/cash-events/${id}/dismiss/`, { reason })
export const recordPayrollRemittance = (runId, body) => post(`/runs/${runId}/remittances/`, body)
export const reversePayrollRemittance = (cashEventId, reason) => post(`/cash-events/${cashEventId}/reverse-remittance/`, { reason })

// Reports / self-service
export const getPayrollReport = (query = {}) => get('/reports/', { params: query })
export const getPayrollAudit = (query = {}) => get('/audit/', { params: query })
export const getMyPayroll = () => get('/me/pay/')
export const getPayslip = (lineId) => get(`/payslips/${lineId}/`)
export const downloadPayslip = (lineId) => api.get(`${root}/payslips/${lineId}/pdf/`, { responseType: 'blob' })
export const downloadPayrollPDF = (runId) => api.get(`${root}/runs/${runId}/report.pdf/`, { responseType: 'blob' })
export const downloadPayrollCSV = (runId) => api.get(`${root}/runs/${runId}/export.csv/`, { responseType: 'blob' })
export const saveBlob = (response, filename) => {
  const url = URL.createObjectURL(new Blob([response.data], {
    type: response.headers?.['content-type'] || 'application/octet-stream',
  }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

// Existing staff directory routes are NOT part of the payroll API. Confirm these
// two paths against your teachers/urls.py before enabling the pick-list.
export const PAYROLL_STAFF_DIRECTORY_PATHS = {
  teacher: '/teachers/',
  non_teaching: '/non-teaching-staff/',
}
export const getPayrollStaffDirectory = async (kind) => {
  const path = PAYROLL_STAFF_DIRECTORY_PATHS[kind]
  if (!path) throw new Error(`No staff directory route configured for ${kind}`)
  return getAllPages(path)
}
