import api from '../../../api/axios'


export const listExams = async (params = {}) => {
  try {
    const res = await api.get('/exams/', { params });
    return Array.isArray(res.data) ? res.data : res.data.results ?? [];
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};


export const createExam = async(payload)=>{
  try{
    const response = await api.post('/exams/', payload);
    return response.data;
  }
  catch(error){
    console.error('Error creating exam:', error);
    throw error;
  }
};

export const getPrincipalDashboard = async (examId, params = {}) => {
  try {
    const res = await api.get('/analytics/principal-dashboard/', {
      params: { exam: examId, ...params },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching principal dashboard:', error);
    throw error;
  }
};

export const getExamComparison = async (params = {}) => {
  try {
    const res = await api.get('/analytics/exam-comparison/', { params });
    return Array.isArray(res.data) ? res.data : res.data.results ?? [];
  } catch (error) {
    console.error('Error fetching exam comparison:', error);
    throw error;
  }
};

export const getTeacherDashboard = async (examId, subject, params = {}) => {
  try {
    const res = await api.get('/analytics/teacher-dashboard/', {
      params: { exam: examId, subject, ...params },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    throw error;
  }
};