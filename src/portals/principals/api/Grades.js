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

export const getClassResults = async (examId, classLevelId, params = {}) => {
  try {
    const res = await api.get('/analytics/class-results/', {
      params: { exam: examId, class_level: classLevelId, ...params },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching class results:', error);
    throw error;
  }
};

export const getStudentPerformance = async (studentId) => {
  try {
    const res = await api.get('/analytics/student-performance/', {
      params: { student: studentId },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching student performance:', error);
    throw error;
  }
};



export const getExamDashboard = async () => {
  try {
    const response = await api.get("/exams/dashboard/");

    return {
      summary: {
        exams_count: response.data?.summary?.exams_count ?? 0,
        missing_marks: response.data?.summary?.missing_marks ?? 0,
        ready_to_release: response.data?.summary?.ready_to_release ?? 0,
        scheduled: response.data?.summary?.scheduled ?? 0,
      },
      exams: Array.isArray(response.data?.exams)
        ? response.data.exams
        : [],
    };
  } catch (error) {
    console.error("Error fetching exam dashboard:", error);
    throw error;
  }
};



// ---------- Results release ----------

export const getReleaseReadiness = async (examId) => {
  try {
    const res = await api.get('/results/readiness/', { params: { exam: examId } });
    return res.data;
  } catch (error) {
    console.error('Error fetching release readiness:', error);
    throw error;
  }
};

export const getMissingStudents = async ({ exam, classLevel, stream, subject }) => {
  try {
    const params = { exam, class_level: classLevel, subject };
    if (stream) params.stream = stream; // omit when the class has no stream
    const res = await api.get('/results/missing-students/', { params });
    return res.data;
  } catch (error) {
    console.error('Error fetching missing students:', error);
    throw error;
  }
};

export const getReleaseHistory = async (params = {}) => {
  try {
    const res = await api.get('/results/releases/', { params });
    return Array.isArray(res.data) ? res.data : res.data.results ?? [];
  } catch (error) {
    console.error('Error fetching release history:', error);
    throw error;
  }
};

// Returns { parents_reached } without releasing anything
export const previewRelease = async (payload) => {
  try {
    const res = await api.post('/results/release/', { ...payload, dry_run: true });
    return res.data;
  } catch (error) {
    console.error('Error previewing release:', error);
    throw error;
  }
};

// payload: { exam, audience: 'all' | 'balance_below', balance_threshold?, force? }
export const releaseResults = async (payload) => {
  try {
    const res = await api.post('/results/release/', payload);
    return res.data;
  } catch (error) {
    // 409 = marks missing; the caller handles it, so don't log it as a failure
    if (error.response?.status !== 409) console.error('Error releasing results:', error);
    throw error;
  }
};

export const withdrawResults = async (examId) => {
  try {
    const res = await api.post('/results/withdraw/', { exam: examId });
    return res.data;
  } catch (error) {
    console.error('Error withdrawing results:', error);
    throw error;
  }
};