//parentservice
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

export const parentService = {
  /**
   * Assigner un parent à un étudiant
   * @param {Object} data - Données d'assignation
   */
  async assignParent(data) {
    try {
      const response = await axiosInstance.post('/parentstudent/', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Récupérer tous les enfants du parent
   */
  async getChildren() {
    try {
      const response = await axiosInstance.get('/parentstudent/children');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Récupérer les détails d'un enfant spécifique
   * @param {string} childId - ID de l'enfant
   */
  async getChildDetails(childId) {
    try {
      const response = await axiosInstance.get(`/parentstudent/children/${childId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Suivre le trajet en temps réel d'un enfant
   * @param {string} childId - ID de l'enfant
   */
  async trackChildBus(childId) {
    try {
      const response = await axiosInstance.get(`/parentstudent/children/${childId}/track`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Récupérer l'historique des présences d'un enfant
   * @param {string} childId - ID de l'enfant
   */
  async getChildAttendance(childId) {
    try {
      const response = await axiosInstance.get(`/parentstudent/children/${childId}/attendance`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Récupérer les notifications du parent
   */
  async getNotifications() {
    try {
      const response = await axiosInstance.get('/parentstudent/notifications');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Marquer une notification comme lue
   * @param {string} notificationId - ID de la notification
   */
  async markNotificationAsRead(notificationId) {
    try {
      const response = await axiosInstance.patch(`/parentstudent/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Récupérer les incidents concernant un enfant
   * @param {string} childId - ID de l'enfant
   */
  async getChildIncidents(childId) {
    try {
      const response = await axiosInstance.get(`/parentstudent/children/${childId}/incidents`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Déclarer l'absence d'un enfant
   * @param {string} childId - ID de l'enfant
   * @param {Object} absenceData - Données d'absence
   */
  async declareChildAbsence(childId, data = {}) {
    try {
      const response = await axiosInstance.post(
        `/parentstudent/children/${childId}/absence`, 
        data
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
  
};

export default parentService;