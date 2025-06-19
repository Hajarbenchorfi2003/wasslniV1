//file:services/school.jsx

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

// ✅ Récupérer toutes les écoles
export async function fetchSchools() {
  const response = await axiosInstance.get('/schools');
  return response.data;
}

// ✅ Récupérer une école par ID
export async function getSchool(id) {
  const response = await axiosInstance.get(`/schools/${id}`);
  return response.data;
}

// ✅ Créer une école
export async function createSchool(schoolData) {
  const response = await axiosInstance.post('/schools', schoolData);
  return response.data;
}

// ✅ Mettre à jour une école
export async function updateSchool(id, schoolData) {
  const response = await axiosInstance.put(`/schools/${id}`, schoolData);
  return response.data;
}

// ✅ Supprimer une école
export async function deleteSchool(id) {
  const response = await axiosInstance.delete(`/schools/${id}`);
  return response.status === 204 || response.status === 200;
}