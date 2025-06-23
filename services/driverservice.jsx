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
  if (error.response) {
    console.error('Erreur API:', error.response.data);
    throw error.response.data;
  } else {
    console.error('Erreur réseau:', error.message);
    throw { message: 'Erreur de connexion au serveur' };
  }
};

export const driverService = {
    async getDailyTrips() {
        try {
          const response = await axiosInstance.get('/dailyTrip/today');
          return response.data.data;  
        } catch (error) {
          console.error('Error fetching daily trips:', error);
          throw error;
        }
      },
    
      async getTripDetails(tripId) {
        try {
          const response = await axiosInstance.get(`/dailyTrip/${tripId}`);
          return response.data;  
        } catch (error) {
            console.error('Error fetching daily trips:', error);
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
      }
    };
      
 

export default driverService;