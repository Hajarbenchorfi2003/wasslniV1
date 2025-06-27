// services/attendanceService.js
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

const attendanceService = {
 
  async createAttendance(data) {
    try {
      const response = await axiosInstance.post('/attendances', data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  
  async getAttendanceHistory(params = {}) {
    try {
      const response = await axiosInstance.get('/attendances', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
 

  
  async getAttendanceStats(params = {}) {
    try {
      const response = await axiosInstance.get('/attendances/statistique', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

   
  async getDailyTripAttendances(dailyTripId) {
    try {
      const response = await axiosInstance.get(`/api/attendances/${dailyTripId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

   
  async getStudentAttendances(studentId, params = {}) {
    try {
      const response = await axiosInstance.get('/attendances', {
        params: { studentId, ...params }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default attendanceService;