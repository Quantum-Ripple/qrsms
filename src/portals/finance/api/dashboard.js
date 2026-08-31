import api from '../../../api/axios'

export const overview = async (termId) => {
  const response = await api.get('/overview/', {
    params: termId ? { term: termId } : {},
  })
  return response.data
}


export const feeByMonth = async (termId) => {
  const response = await api.get('/fees-by-month', {
    params: termId ? { term: termId } : {},
  })
  return response.data
}


export const feeByClass = async (termId) => {
  const response = await api.get('/fees-by-class', {
    params: termId ? { term: termId } : {},
  })
  return response.data
}