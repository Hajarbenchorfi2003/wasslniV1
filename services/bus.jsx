// services/bus.jsx
import axios from 'axios';

// URL de base de ton API backend (ajuste si besoin)
const API_BASE_URL = 'http://localhost:5000/api/buses';

// Récupère le token JWT depuis le localStorage ou autre stockage sécurisé
function getAuthToken() {
  return localStorage.getItem('token'); // ou selon ta gestion d'auth
}

// Config avec l'en-tête Authorization
function getConfig() {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

// Récupérer tous les bus (avec permission view:Allbus)
export async function fetchAllBuses() {
  const response = await axios.get(API_BASE_URL, getConfig());
  return response.data;
}

// Récupérer tous les bus disponibles (pas besoin d'autorisation explicite)
export async function fetchAvailableBuses() {
  const response = await axios.get(`${API_BASE_URL}/available`, getConfig());
  return response.data;
}

// Récupérer les bus de l'utilisateur (mybus)
export async function fetchMyBuses() {
  const response = await axios.get(`${API_BASE_URL}/nosBus`, getConfig());
  return response.data;
}

// Récupérer un bus par son ID
export async function fetchBusById(id) {
  const response = await axios.get(`${API_BASE_URL}/${id}`, getConfig());
  return response.data;
}

// Créer un nouveau bus
export async function createBus(busData) {
  const response = await axios.post(API_BASE_URL, busData, getConfig());
  return response.data;
}

// Mettre à jour un bus
export async function updateBus(id, updatedData) {
  const response = await axios.put(`${API_BASE_URL}/${id}`, updatedData, getConfig());
  return response.data;
}

// Supprimer un bus
export async function deleteBus(id) {
  const response = await axios.delete(`${API_BASE_URL}/${id}`, getConfig());
  return response.data;
}

// Désaffecter un bus d'un établissement (PATCH)
export async function detachBusFromEstablishment(id) {
  const response = await axios.patch(`${API_BASE_URL}/${id}/detach-establishment`, {}, getConfig());
  return response.data;
}

// Récupérer les conducteurs disponibles (permission view:driver)
export async function fetchAvailableDrivers() {
  const response = await axios.get(`${API_BASE_URL}/available-drivers`, getConfig());
  return response.data;
}
