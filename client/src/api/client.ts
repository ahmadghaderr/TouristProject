import axios from "axios";
import { getToken } from "../utils/auth";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
