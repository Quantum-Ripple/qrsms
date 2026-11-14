import api from '../../../api/axios'

export function getStudentFinanceDetails(studentId, termId) {
  return api.get(`/student/${studentId}/`, {
    params: termId ? { term: termId } : {},
  })
}

export function getFeeStructures(feeStructureId) {
  return api.get(`fee-structures/${feeStructureId}/`)
}

export function getPayments(paymentId) {
  return api.get(`/payments/${paymentId}/`)
}

export function getPaymentById(paymentId) {
  return api.get(`/payments/${paymentId}/`)
}

export function getInvoiceById(invoiceId) {
  return api.get(`/invoices/${invoiceId}/`)
}

export function getStudentPaymentHistory(studentId) {
  return api.get(`/student/${studentId}/payments/`)
}

export function initiateMpesaSTKPush(data) {
  return api.post(`/mpesa/stk/`, data)
}

export function getMpesaTransactionStatus(transactionId) {
  return api.get(`/mpesa/transactions/${transactionId}/`)
}

export const getHowToPay = (forItem = '') =>
  api
    .get('funds/how-to-pay/', { params: forItem ? { for: forItem } : {} })
    .then((r) => r.data)