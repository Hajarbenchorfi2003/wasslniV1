//services/notficationicidient
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
    console.error('Erreur API:', error.response.data);
    errorMessage = error.response.data.message || 'Erreur serveur';
  } else if (error.request) {
    // Aucune réponse reçue
    console.error('Aucune réponse du serveur');
  } else {
    // Erreur avant l'envoi
    console.error('Erreur lors de la requête:', error.message);
  }

  return new Error(errorMessage);
};

export async function getNotfication() {
    try {
      const response = await axiosInstance.get('/notifications');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  };
  export async function markNotificationAsRead(notificationId) {
    try {
      const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  };
  // --- Incidents ---

  export async function reportIncident(dailyTripId, description) {
    try {
       const response = await axiosInstance.post('/incidents', {
       dailyTripId,
       description,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  };
  export async function getAllIncidents() {
try {
  const response = await axiosInstance.get('/incidents');
  return response.data;
} catch (error) {
  handleApiError(error);
}
};