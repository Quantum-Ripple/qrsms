import api from './axios'


export const getNotes = async() => {
    try{
        const response = await api.get('/notes/')
        return response.data
    }
    catch(err){
        console.error(err)
    }
}

export const getAssignments = async () => {
  try {
    const response = await api.get('/assignments/');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch assignments:", error);
    return [];
  }
};
export const submitAssignment = async (assignmentId, answers) => {
  try {
    const response = await api.post(`/assignments/${assignmentId}/submit/`, answers);
    return response.data;
  } catch (error) {
    console.error("Failed to submit assignment:", error);
    throw error; 
  }
};
