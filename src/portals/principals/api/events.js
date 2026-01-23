import api from './axios';


export const fetchEvents = async () => {
  try {
    const response = await api.get("/announcements");
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }};

export const createEvent = async (eventData) => {
  try {
    const response = await api.post("/announcements/", eventData); 
    return response.data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }};


export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/announcements/${eventId}/`);   
    return response.data;
    } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
    }};

export const viewEvent = async (eventId) => {
  try {
    const response = await api.get(`/announcements/${eventId}`);  
    return response.data;
    } catch (error) {
    console.error("Error viewing event:", error);
    throw error;
    }};
export const updateEvent = async (eventId, updatedData) => {
  try {
    const response = await api.put(`/announcements/${eventId}`, updatedData);
    return response.data;
    } catch (error) {
    console.error("Error updating event:", error);
    throw error;
    }};




    