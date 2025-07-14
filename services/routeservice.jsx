import axios from 'axios';
import { getToken } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_SITE_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export async function fetchallroute() {
  try {
    const response = await axiosInstance.get('/route/allrouters');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la récupération des routes');
  }
}

export async function getUserRoutes() {
  try {
    const response = await axiosInstance.get('/route');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la récupération des routes utilisateur');
  }
}

export async function createroute(dataRoute) {
  try {
    const response = await axiosInstance.post('/route/', dataRoute);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la création de la route');
  }
}

export async function deleteroute(id) {
  try {
    const response = await axiosInstance.delete(`/route/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la suppression de la route');
  }
}

export async function updateroute(id, dataRoute) {
  try {
    const response = await axiosInstance.put(`/route/${id}`, dataRoute);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la mise à jour de la route');
  }
}

export default {
  getUserRoutes,
  createRoute: createroute,
  deleteRoute: deleteroute,
  updateRoute: updateroute
};