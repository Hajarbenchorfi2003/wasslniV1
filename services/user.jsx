//services/user
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
export async function fetchAdmins() {
  const response = await axiosInstance.get('/users/admins');
  return response.data;
}
export async function fetchResponsibles() {
  const response = await axiosInstance.get('/users/responsibles');
  return response.data;
}

export async function fetchDrivers() {
  const response = await axiosInstance.get('/users/drivers');
  return response.data;
}

export async function fetchParents() {
  const response = await axiosInstance.get('/users/parents');
  return response.data;
}