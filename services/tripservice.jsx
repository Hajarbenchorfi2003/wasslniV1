// src/services/tripService.js
import axios from 'axios';
import { getToken } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_SITE_URL;

// Configuration de l'instance Axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
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
    console.error('Erreur API:', error.response.data);
    errorMessage = error.response.data.message || error.response.data.error || 'Erreur serveur';
  } else if (error.request) {
    console.error('Aucune réponse du serveur');
    errorMessage = 'Le serveur ne répond pas';
  } else {
    console.error('Erreur lors de la requête:', error.message);
  }

  throw new Error(errorMessage);
};

const tripService = {
  
  async createTrip(tripData) {
    try {
      const response = await axiosInstance.post('/trip', tripData);
      return response.data;
    } catch (error) {
        return handleApiError(error);
    }
  },

  
  async getAllTrips({ page = 1, limit = 20, ...filters } = {}) {
    try {
      const params = { page, limit, ...filters };
      const response = await axiosInstance.get('/trip', { params });
      return response.data;
    } catch (error) {
        return handleApiError(error);
    }
  },

  
  async getTripById(id) {
    try {
      const response = await axiosInstance.get(`/trip/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
 
  async updateTrip(id, updateData) {
    try {
      const response = await axiosInstance.put(`/trip/${id}`, updateData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

   
  async deleteTrip(id) {
    try {
      await axiosInstance.delete(`/trip/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  
  async requestTripDeletion(tripId, reason) {
    try {
      const response = await axiosInstance.post(`/trip/${tripId}/request-delete`, { reason });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  
  async assignStudents(tripId, studentIds) {
    try {
      const response = await axiosInstance.post(`/trip/${tripId}/assign-students`, { studentIds });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  
  async removeStudentFromTrip(tripId, studentId) {
    try {
      const response = await axiosInstance.delete(`/trip/${tripId}/students/${studentId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
 
  async generateDailyTrips(tripId, { startDate, endDate, skipWeekends = true, timeSlot }) {
    try {
      const response = await axiosInstance.post('/trip/generate-daily-trips', {
        tripId,
        startDate,
        endDate,
        skipWeekends,
        timeSlot,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  
  async getDailyTripsByTrip(tripId) {
    try {
      const response = await axiosInstance.get(`/trip/daily-trips/list/${tripId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  
  async getTripStatistics({ establishmentId, period } = {}) {
    try {
      const params = {};
      if (establishmentId) params.establishmentId = establishmentId;
      if (period) params.period = period;
      
      const response = await axiosInstance.get('/trip/statistics', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

   
  async recordPosition(dailyTripId, { lat, lng }) {
    try {
      const response = await axiosInstance.post(`/trip/record-position/${dailyTripId}`, { lat, lng });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default tripService;