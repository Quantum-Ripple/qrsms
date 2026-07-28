import api from './axios'


export const fetchClassLevels = () => {
  return api.get('/class-levels/')
}


export const createClassLevel = (data) => {
  return api.post('/class-levels/', data)
}

export const updateClassLevel = (id, data) => {
  return api.put(`/class-levels/${id}/`, data)
}


export const deleteClassLevel = (id) => {
  return api.delete(`/class-levels/${id}/`)
}



export const createStream = (data) => {
  return api.post('/streams/', data)
}


export const updateStream = (id, data) => {
  return api.put(`/streams/${id}/`, data)
}


export const deleteStream = (id) => {
  return api.delete(`/streams/${id}/`)
}
export const fetchConfigurations = () => {
  return api.get('/configurations/')
}