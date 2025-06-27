import axios from 'axios';
import { getUser, getToken, isAuthenticated } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_SITE_URL;

// Instance Axios avec configuration de base
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour inclure le token automatiquement
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log("Token envoyé dans la requête :", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export async function fetchallroute() {
  const response = await axiosInstance.get('/route/allrouters');
  return response.data;
}
export async function fetchroute() {
  const response = await axiosInstance.get('/route/');
  return response.data;
}
export async function createroute(dataRoute) {
  const response = await axiosInstance.post('/route/',dataRoute);
  return response.data;
}
export async function deleteroute(id) {
  const response = await axiosInstance.delete(`/route/${id}`);
  return response.data;
}
export async function updateroute(id, dataRoute) {
  const response = await axiosInstance.put(`/route/${id}`, dataRoute);
  return response.data;
}