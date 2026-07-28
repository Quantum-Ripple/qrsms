import api from '../../../api/axios'



export const getAcademicYears = () => {
  return api.get("/academic-years/");
};

export const createAcademicYear = (data) =>
  api.post("/academic-years/", data);




export const fetchClassInstances = async (params = {}) => {
  // params: { academic_year, page }
  const response = await api.get('/class-instances/', { params })
  return response.data
}


export const fetchEnrollments = async (params = {}) => {
  // params: { class_instance, class_instance_id, active_only=true, status, page }
  const normalizedParams = {
    ...params,
    ...(params.class_instance ? { class_instance_id: params.class_instance } : {}),
  }

  const response = await api.get('/enrollments/', { params: normalizedParams })
  const data = response.data

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.students)) return data.students

  return []
}


export const promoteStudents = async (payload) => {
  /*
    payload:
    {
      source_class_instance: Number,
      target_class_instance?: Number,
      student_ids: Number[],
      action: "PROMOTE" | "REPEAT" | "TRANSFER" | "GRADUATE"
    }
  */
  const response = await api.post('/promote/', payload)
  return response.data
}

export const createClassInstance = async (payload) => {
  /*
    payload:
    {
      academic_year: Number,
      class_level: Number,
      stream: Number
    }
  */
  const res = await api.post('/class-instances/', payload)
  return res.data
}

export const fetchAcademicYears = async () => {
  const res = await api.get('/academic-years/')
  return res.data
}
export const fetchClassLevels = async () => {
  const res = await api.get('/class-levels/')
  return res.data
}


export const generateNextYearStructure = async (payload) => {
  /*
    payload:
    {
      source_academic_year: Number,
      target_academic_year: Number
    }
  */
  const res = await api.post(
    '/class-instances/generate-next-year/',
    payload
  )
  return res.data
}