
import api from '../../../api/axios'

export function getStudentFinanceDetails(studentId) {
  return api.get(`/student/${studentId}/`)
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
