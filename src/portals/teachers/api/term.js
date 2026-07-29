
import api from "./axios";

export async function listTerms() {
  const res = await api.get("/terms/");
  return res.data;
}