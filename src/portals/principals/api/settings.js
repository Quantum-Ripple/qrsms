import api from "./axios";

export const updatePrincipalSettings = () => {
  return api.get("/settings");
};