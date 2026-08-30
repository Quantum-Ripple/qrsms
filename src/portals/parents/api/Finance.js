
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

export function initiateMpesaSTKPush(data) {

  return api.post(`/mpesa/stk/`, data)
}

export function getMpesaTransactionStatus(transactionId) {
  return api.get(`/mpesa/transactions/${transactionId}/`)
}
