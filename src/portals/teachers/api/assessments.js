import api from './axios';



/* =========================
   STRANDS
========================= */

export const getStrands = async () => {
  try {
    const res = await api.get('/strands/');
    return Array.isArray(res.data) ? res.data : res.data.results ?? [];
  } catch (error) {
    console.error('Error fetching strands:', error);
    throw error;
  }
};


export const createStrand = async (payload) => {
  try {
    const res = await api.post('/strands/', payload);
    return res.data;
  } catch (error) {
    console.error('Error creating strand:', error);
    throw error;
  }
};

export const getSubStrands = async (subject, classLevel) => {
  const res = await api.get("/substrands/", {
    params: {
      subject,
      class_level: classLevel
    }
  })
  return Array.isArray(res.data) ? res.data : res.data.results ?? []
}



/* =========================
   RUBRIC SCORES
========================= */

export const getRubricScores = async (examId) => {
  const res = await api.get(`/rubric-scores/`, {
    params: { exam: examId }
  })
  return res.data
}


export const createRubricScore = async (data) => {
  try {
    const res = await api.post('/rubric-scores/', data);
    return res.data;
  } catch (error) {
    console.error('Error creating rubric score:', error);
    throw error;
  }
};


export const updateRubricScore = async (scoreId, data) => {
  try {
    const res = await api.patch(`/rubric-scores/${scoreId}/`, data);
    return res.data;
  } catch (error) {
    console.error('Error updating rubric score:', error);
    throw error;
  }
};


export const getSubjectScores = async (examId, subject) => {
  try {
    const res = await api.get("/subject-exam-scores/", {
      params: {
        exam: examId,
        subject: subject
      }
    });

    return Array.isArray(res.data) ? res.data : res.data.results ?? [];
  } catch (error) {
    console.error("Error fetching subject scores:", error);
    throw error;
  }
};

export const getAllSubjectScores = async (examId) => {
  try {
    const res = await api.get("/subject-exam-scores/", {
      params: { exam: examId }
    })
    return Array.isArray(res.data) ? res.data : res.data.results ?? []
  } catch (error) {
    console.error("Error fetching all subject scores:", error)
    throw error
  }
}


export const createSubjectScore = async (data) => {
  try {
    const res = await api.post("/subject-exam-scores/", data);
    return res.data;
  } catch (error) {
    console.error("Error creating subject score:", error);
    throw error;
  }
};


export const updateSubjectScore = async (scoreId, data) => {
  try {
    const res = await api.patch(`/subject-exam-scores/${scoreId}/`, data);
    return res.data;
  } catch (error) {
    console.error("Error updating subject score:", error);
    throw error;
  }
};

export const bulkSaveSubjectScores = async (payload) => {

  try {

    const res = await api.post("/subject-exam-scores/bulk/", payload)

    return res.data

  } catch (error) {

    console.error("Error saving subject scores:", error)

    throw error
  }

}

/* =========================
   TERM WEIGHTS
========================= */

export const getTermWeights = async (examId) => {
  try {
    const res = await api.get("/term-weights/", {
      params: { exam: examId }
    })
    return Array.isArray(res.data) ? res.data : res.data.results ?? []
  } catch (error) {
    console.error("Error fetching term weights:", error)
    throw error
  }
}

export const createTermWeights = async (data) => {
  try {
    const res = await api.post("/term-weights/", data)
    return res.data
  } catch (error) {
    console.error("Error creating term weights:", error)
    throw error
  }
}

export const updateTermWeights = async (weightId, data) => {
  try {
    const res = await api.patch(`/term-weights/${weightId}/`, data)
    return res.data
  } catch (error) {
    console.error("Error updating term weights:", error)
    throw error
  }
}

export const bulkSaveRubricScores = async (payload) => {

  try {

    const res = await api.post("/rubric-scores/bulk/", payload)

    return res.data

  } catch (error) {

    console.error("Error saving rubric scores:", error)

    throw error
  }

}