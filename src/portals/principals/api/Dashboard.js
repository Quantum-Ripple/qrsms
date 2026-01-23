import api from './axios';

export async function fetchSchoolStatistics(schoolId) {
  try {
    const response = await api.get(`/schools/${schoolId}/statistics/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching school statistics:", error);
    throw error;
  }
}

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
