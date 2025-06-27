// src/services/routeService.js
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

// Centralized error handling
const handleApiError = (error) => {
  let errorMessage = 'Erreur de connexion au serveur';

  if (error.response) {
    console.error('API Error:', error.response.data);
    errorMessage = error.response.data.message || error.response.data.error || 'Erreur serveur';
  } else if (error.request) {
    console.error('No response from server');
    errorMessage = 'Le serveur ne répond pas';
  } else {
    console.error('Request error:', error.message);
  }

  throw new Error(errorMessage);
};

const routeService = {
  /**
   * Create a new route
   * @param {Object} routeData - Route data to create
   * @returns {Promise<Object>} Created route
   */
  async createRoute(routeData) {
    try {
      const response = await axiosInstance.post('/route', routeData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all routes (admin only)
   * @returns {Promise<Array>} List of all routes
   */
  async getAllRoutes() {
    try {
      const response = await axiosInstance.get('/route/allrouters');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get routes accessible to current user
   * @returns {Promise<Array>} List of user's routes
   */
  async getUserRoutes() {
    try {
      const response = await axiosInstance.get('/route');
      return response.data;
    } catch (error) {
      console.error('Error fetching routes:', error);
      // Nous allons maintenant lancer l'erreur pour qu'elle soit gérée dans le composant
      throw error;
    }
  },

  async getRouteById(id) {
    try {
      const response = await axiosInstance.get(`/route/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getUserRouteById(id) {
    try {
      const response = await axiosInstance.get(`/route/${id}/details`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },


  async updateRoute(id, updateData) {
    try {
      const response = await axiosInstance.put(`/route/${id}`, updateData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteRoute(id) {
    try {
      const response = await axiosInstance.delete(`/route/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getRouteStops(routeId) {
    try {
      const response = await axiosInstance.get(`/stops?routeId=${routeId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },


  async getDeletedRoutes() {
    try {
      const response = await axiosInstance.get('/route/deleted');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default routeService;