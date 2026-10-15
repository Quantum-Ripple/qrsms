import api from "../../../api/axios";

const childBase = (studentId) => `/parent/children/${studentId}`;

const unwrap = (data) => (Array.isArray(data) ? data : data?.results ?? []);

// ---- Notes ----
export const getChildNotes = async (studentId, params = {}) => {
  const res = await api.get(`${childBase(studentId)}/notes/`, { params });
  return unwrap(res.data);
};

// ---- Assignments (ready for the next page) ----
export const getChildAssignments = async (studentId, params = {}) => {
  const res = await api.get(`${childBase(studentId)}/assignments/`, {
    params: { include: "none", ...params }, // list only, no questions
  });
  return unwrap(res.data);
};

export const getChildAssignment = async (studentId, assignmentId) => {
  const res = await api.get(`${childBase(studentId)}/assignments/${assignmentId}/`);
  return res.data;
};

export const getChildAssignmentSummary = async (studentId) => {
  const res = await api.get(`${childBase(studentId)}/assignments/summary/`);
  return res.data;
};

export const submitChildAssignment = async (studentId, assignmentId, answers) => {
  const res = await api.post(
    `${childBase(studentId)}/assignments/${assignmentId}/submit/`,
    { answers }
  );
  return res.data;
};

export const getChildAssignmentResult = async (studentId, assignmentId) => {
  const res = await api.get(
    `${childBase(studentId)}/assignments/${assignmentId}/my-result/`
  );
  return res.data;
};