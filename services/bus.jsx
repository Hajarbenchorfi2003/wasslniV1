// services/buses.jsx

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
console.log("i am in buses")
// Récupérer tous les bus (avec permission view:Allbus)
export async function fetchAllBuses(filters = {}) {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await axiosInstance.get('/buses', { params: filters });
    console.log('Données des bus reçues:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des bus:', error);
    throw error;
  }
}

// Récupérer tous les bus disponibles (pas besoin d'autorisation explicite)
export async function fetchAvailableBuses() {
  const response = await axiosInstance.post('/buses/available');
  return response.data;
}

// Récupérer les bus de l'utilisateur (mybus)
export async function fetchMyBuses() {
  const response = await axiosInstance.get('/buses/nosBus');
  return response.data;
}

// Récupérer un bus par son ID
export async function fetchBusById(id) {
  const response = await axiosInstance.get(`/buses/${id}`);
  return response.data;
}

// Créer un nouveau bus
export async function createBus(busData) {
  const response = await axiosInstance.post('/buses', busData);
  return response.data;
}

// Mettre à jour un bus
export async function updateBus(id, updatedData) {
  const response = await axiosInstance.put(`/buses/${id}`, updatedData);
  return response.data;
}

// Supprimer un bus
export async function deleteBus(id) {
  const response = await axiosInstance.delete(`/buses/${id}`);
  return response.data;
}

// Désaffecter un bus d'un établissement (PATCH)
export async function detachBusFromEstablishment(id) {
  const response = await axiosInstance.patch(`/buses/${id}/detach-establishment`);
  return response.data;
}

// Récupérer les conducteurs disponibles (permission view:driver)
export async function fetchAvailableDrivers() {
  const response = await axiosInstance.get('/buses/available-drivers');
  return response.data;
}