//driverservice
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
    // Erreur côté serveur
    errorMessage = error.response.data.message || 'Erreur serveur';
  } else if (error.request) {
    // Aucune réponse reçue
    errorMessage = 'Aucune réponse du serveur';
  } else {
    // Erreur avant l'envoi
    errorMessage = error.message;
  }

  return new Error(errorMessage);
};
const driverService = {
    async getDailyTrips() {
        try {
          const response = await axiosInstance.get('/dailyTrip/today');
          return response.data.data;  
        } catch (error) {
          throw error;
        }
      },
    
      async getTripDetails(tripId) {
        try {
          const response = await axiosInstance.get(`/dailyTrip/${tripId}`);
          return response.data;  
          } catch (error) {
            throw error;
          }
      },
    
      async updateTripStatus(tripId, status) {
        try {
          const response = await axiosInstance.put(`/dailyTrip/${tripId}`, {
            status
          });
          return response.data;
        } catch (error) {
          handleApiError(error);
        }
      },
    
      async startTrip(tripId) {
        return this.updateTripStatus(tripId, 'ONGOING');
      },
    
      async completeTrip(tripId) {
        return this.updateTripStatus(tripId, 'COMPLETED');
      },
    
      async cancelTrip(tripId) {
        return this.updateTripStatus(tripId, 'CANCELLED');
      },
    
      async requestTripDeletion(tripId) {
        try {
          const response = await axiosInstance.post(`/dailyTrip/${tripId}/request-delete`);
          return response.data;
        } catch (error) {
          handleApiError(error);
        }
      },
    
      async getTripStudents(tripId) {
        try {
          const response = await axiosInstance.get(`/dailyTrip/${tripId}/students`);
          return response.data;
        } catch (error) {
          handleApiError(error);
        }
      },
    
      async getDailyTripsStats() {
        try {
          const response = await axiosInstance.get('/dailyTrip/statistique');
          return response.data;
        } catch (error) {
          handleApiError(error);
        }
      },
       
      async getNotfication() {
        try {
          const response = await axiosInstance.get('/notifications');
          return response.data;
        } catch (error) {
          handleApiError(error);
        }
      },
      async markNotificationAsRead(notificationId) {
        try {
          const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
          return response.data;
        } catch (error) {
          handleApiError(error);
        }
      },
      // --- Incidents ---
  
      async reportIncident(dailyTripId, description) {
        try {
           const response = await axiosInstance.post('/incidents', {
           dailyTripId,
           description,
          });
          return response.data;
        } catch (error) {
          handleApiError(error);
        }
      },

  async getAllIncidents() {
    try {
      const response = await axiosInstance.get('/incidents');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
   // --- presence ---
   async markAttendance(data) {
    try {
      const response = await axiosInstance.post('/attendances', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Récupère les statistiques des trajets
  async getTripStatistics(establishmentId, period) {
    try {
      const params = {};
      if (establishmentId) params.establishmentId = establishmentId;
      if (period) params.period = period;
      
      const response = await axiosInstance.get('/trip/statistics', { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Récupère tous les trajets avec pagination et filtres
  async getAllTrips({ page = 1, limit = 20, name, driverId, routeId, establishmentId, busId }) {
    try {
      const params = { page, limit };
      if (name) params.name = name;
      if (driverId) params.driverId = driverId;
      if (routeId) params.routeId = routeId;
      if (establishmentId) params.establishmentId = establishmentId;
      if (busId) params.busId = busId;

      const response = await axiosInstance.get('/trip', { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};
export default driverService;
 
