// src/services/stopService.js
import axios from 'axios';
import { getToken } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_SITE_URL;

// Configure Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
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

// Gestion centralisée des erreurs
const handleApiError = (error) => {
  let errorMessage = 'Erreur de connexion au serveur';

  if (error.response) {
    console.error('API Error:', error.response.data);
    errorMessage = error.response.data.error || error.response.data.message || 'Erreur serveur';
  } else if (error.request) {
    console.error('No response from server');
    errorMessage = 'Le serveur ne répond pas';
  } else {
    console.error('Request error:', error.message);
  }

  throw new Error(errorMessage);
};

const stopService = {
   
  async createStop(stopData) {
    try {
      const response = await axiosInstance.post('/stop', stopData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  
  async getAllStops() {
    try {
      const response = await axiosInstance.get('/stop');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Récupère les arrêts accessibles à l'utilisateur courant
   * @returns {Promise<Array>} Liste des arrêts de l'utilisateur
   */
  async getUserStops() {
    try {
      const response = await axiosInstance.get('/stop/nosStops');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Récupère un arrêt par son ID (admin)
   * @param {number} id - ID de l'arrêt
   * @returns {Promise<Object>} Détails de l'arrêt
   */
  async getStopById(id) {
    try {
      const response = await axiosInstance.get(`/stop/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Récupère un arrêt avec vérification des permissions
   * @param {number} id - ID de l'arrêt
   * @returns {Promise<Object>} Détails de l'arrêt
   */
  async getUserStopById(id) {
    try {
      const response = await axiosInstance.get(`/stop/${id}/details`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Met à jour un arrêt
   * @param {number} id - ID de l'arrêt
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Object>} Arrêt mis à jour
   */
  async updateStop(id, updateData) {
    try {
      const response = await axiosInstance.put(`/stop/${id}`, updateData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Supprime un arrêt (soft delete)
   * @param {number} id - ID de l'arrêt
   * @returns {Promise<Object>} Confirmation de suppression
   */
  async deleteStop(id) {
    try {
      const response = await axiosInstance.patch(`/stop/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Récupère les arrêts supprimés (accessibles à l'utilisateur)
   * @returns {Promise<Array>} Liste des arrêts supprimés
   */
  async getDeletedStops() {
    try {
      const response = await axiosInstance.get('/stop/deleted');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Récupère les arrêts d'une route spécifique
   * @param {number} routeId - ID de la route
   * @returns {Promise<Array>} Liste des arrêts de la route
   */
  async getStopsByRoute(routeId) {
    try {
      const response = await axiosInstance.get(`/stop?routeId=${routeId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default stopService;