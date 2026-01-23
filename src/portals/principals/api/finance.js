
import api from './axios'  


export const getFinanceSummary = async () => {
  try {
    const response = await api.get('/overview/')
    return response.data
  } catch (error) {
    console.error('Error fetching finance summary:', error)
    throw error
  }
}

export const getMonthlyFinanceSummary = async () => {
  try {
    const response = await api.get('/fees-by-month/')
    return response.data
  } catch (error) {
    console.error('Error fetching monthly finance summary:', error)
    throw error
  }}

export const getClasswiseFinanceSummary = async () => {
  try {
    const response = await api.get('/fees-by-class/')
    return response.data
  }catch (err){
    console.error('Error fetching classwise finance summary:', err )
    throw err
  }}


export const getTransactions = async () => {
  try {
    const response = await api.get('/payments/')
    return response.data
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw error
  }
}


export const getExpenditures = async () => {
  try {
    const response = await api.get('/expenditures/')
    return response.data
  } catch (error) {
    console.error('Error fetching expenditures:', error)
    throw error
  }
}

export const createInvoice = async (data) => {
  try {
    const response = await api.post('/invoices/', data)
    return response.data
  } catch (error) {
    console.error('Error creating invoice:', error)
    throw error
  }
}

export const getPayment = async (id) => {
  try {
    const response = await api.get(`/payments/${id}/`)
    return response.data
  } catch (error) {
    console.error('Error fetching payment:', error)
    throw error
  }
}