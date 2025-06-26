
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


export async function fetchAlltrip(filters = {}) {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await axiosInstance.get('/trips', { params: filters });
    console.log('Données des trajets reçues:', response.data);
    return response.data;
  } catch (error) {
    // Extrait proprement le message d'erreur
    let errorMessage = 'Erreur lors de la récupération des trajets';

    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Erreur récupérée dans fetchAlltrip:', errorMessage);
    throw new Error(errorMessage); // on relance une erreur propre
  }
}
