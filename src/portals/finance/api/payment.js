import api from '../../../api/axios'

// ---------- Payments ----------
export const getPayments = async (params = {}) => {
  const response = await api.get('/payments/', { params })
  return response.data
}

export const getPaymentById = async (id, params = {}) => {
  const response = await api.get(`/payments/${id}/`, { params })
  return response.data
}

export const recordPayment = async (payload) => {
  const response = await api.post('/payments/', payload)
  return response.data
}

export const reversePayment = async (id, reason) => {
  const response = await api.post(`/payments/${id}/reverse/`, { reason })
  return response.data
}

export const reallocatePayment = async (id, payload) => {
  // { reason, allocations: [{ invoice | transport_invoice, amount }] }
  const response = await api.post(`/payments/${id}/reallocate/`, payload)
  return response.data
}

export const transferPayment = async (id, payload) => {
  // { student, invoice?, transport_invoice?, reason }
  const response = await api.post(`/payments/${id}/transfer/`, payload)
  return response.data
}
// No update/delete on purpose: payments are immutable. Correct them with reverse/reallocate/transfer.

// ---------- Invoice detail ----------
export const getInvoice = async (id) => {
  const response = await api.get(`/invoices/${id}/`)
  return response.data
}

export const adjustInvoice = async (id, payload) => {
  // { description, amount, reason } or { charge, reason }
  const response = await api.post(`/billing/invoices/${id}/adjust/`, payload)
  return response.data
}

export const discountInvoice = async (id, payload) => {
  const response = await api.post(`/billing/invoices/${id}/discount/`, payload)
  return response.data
}

// ---------- Student finance ----------
export const getStudentFinance = async (studentId, params = {}) => {
  const response = await api.get(`/student/${studentId}/`, { params })
  return response.data
}

export const getStudentPayments = async (studentId) => {
  const response = await api.get(`/student/${studentId}/payments/`)
  return response.data
}

export const getStudentCredit = async (studentId) => {
  const response = await api.get(`/billing/students/${studentId}/credit/`)
  return response.data
}

export const applyCredit = async (payload) => {
  // { student, invoice?, transport_invoice?, amount? }
  const response = await api.post('/billing/credit/apply/', payload)
  return response.data
}

// ---------- Helpers ----------

// Turn a student's finance summary into a flat list of invoices a payment can target.
// Key names are best guesses; adjust the pick() lists if your summary uses different ones.
export const extractInvoices = (s = {}) => {
  const pick = (...candidates) => candidates.find(Array.isArray) ?? []
  return {
    fee: pick(s.school_fee_invoices, s.fee_invoices, s.invoices, s.school_fees?.invoices),
    transport: pick(s.transport_invoices, s.transport?.invoices),
  }
}

export const getInvoiceTargets = async (studentId) => {
  const s = await getStudentFinance(studentId)
  const { fee, transport } = extractInvoices(s)

  const make = (kind, inv) => ({
    key: `${kind}:${inv.id}`,
    kind,
    id: inv.id,
    balance: inv.balance != null ? Number(inv.balance) : null,
    label: [
      kind === 'transport' ? 'Transport' : 'School fees',
      inv.term_name ?? inv.term,
      `#${inv.id}`,
      inv.balance != null ? `balance ${Number(inv.balance).toLocaleString('en-KE')}` : null,
    ]
      .filter(Boolean)
      .join(' · '),
  })

  return [...fee.map((i) => make('fee', i)), ...transport.map((i) => make('transport', i))]
}

// 'fee:501' -> { invoice: 501 }, 'transport:22' -> { transport_invoice: 22 }
export const targetPayload = (key) => {
  if (!key) return {}
  const [kind, id] = key.split(':')
  return kind === 'transport' ? { transport_invoice: Number(id) } : { invoice: Number(id) }
}

export const studentName = (s) =>
  s?.full_name ?? s?.name ?? [s?.first_name, s?.last_name].filter(Boolean).join(' ')

export const studentAdmission = (s) => s?.admission_number ?? s?.admission_no ?? ''


export const getPaymentMethods = async () => {
  const response = await api.get('/payments/methods/')
  return response.data
}