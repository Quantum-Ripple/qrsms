import api from '../../../api/axios'

export const getClassPerformance = (params) => {
  return api.get("/analytics/class-performance/", { params });
};

export const getStreamComparison = (params) => {
  return api.get("/analytics/stream-comparison/", { params });
};

export const getSubjectPerformance = (params) => {
  return api.get("/analytics/subject-performance/", { params });
};

export const getRankings = (params) => {
  return api.get("/analytics/rankings/", { params });
};