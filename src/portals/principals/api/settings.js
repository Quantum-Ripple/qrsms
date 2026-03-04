import api from '../../../api/axios'

export const updatePrincipalSettings = () => {
  return api.get("/settings");
};