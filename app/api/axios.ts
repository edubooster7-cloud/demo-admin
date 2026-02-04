import axios from "axios";

const api = axios.create({
  baseURL: "https://school.edubooster.org/api",
  // baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

export default api;
