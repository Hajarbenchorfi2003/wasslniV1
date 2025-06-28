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

export async function fetchdailytrip(filters = {}) {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await axiosInstance.get('/dailyTrip', { params: filters });
    console.log('Données des bus reçues:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des bus:', error);
    throw error;
  }
}
export async function createDailyTrip(tripData) {
  const response = await axiosInstance.post('/dailyTrip/', tripData);
  return response.data;
}
export async function updateDailyTrip(id,tripData) {
  const response = await axiosInstance.put(`/dailyTrip/${id}/`,tripData);
  return response.data;
}
export async function deleteDailyTrip(id) {
  const response = await axiosInstance.delete(`/dailyTrip/${id}/`);
  return response.data;
}