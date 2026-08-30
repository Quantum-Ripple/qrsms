import api from '../../../api/axios'

export async function fetchSchoolStatistics(schoolId) {
  try {
    const response = await api.get(`/schools/${schoolId}/statistics/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching school statistics:", error);
    throw error;
  }
}

export const getFinanceSummary = async (termId) => {
  try {
    const response = await api.get('/overview/', {
      params: termId ? { term: termId } : {},
    })
    return response.data
  } catch (error) {
    console.error('Error fetching finance summary:', error)
    throw error
  }
}


export const getMonthlyFinanceSummary = async (termId) => {
  try {
    const response = await api.get('/fees-by-month/', {
      params: termId ? { term: termId } : {},
    })
    return response.data
  } catch (error) {
    console.error('Error fetching monthly finance summary:', error)
    throw error
  }}