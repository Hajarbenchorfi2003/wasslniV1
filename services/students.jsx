 
import axios from 'axios';
import { getToken, isAuthenticated } from '@/utils/auth'; // Assurez-vous que ces utilitaires existent

const API_URL = process.env.NEXT_PUBLIC_SITE_URL; // Doit pointer vers votre backend

// Création d'une instance Axios configurée
const studentApi = axios.create({
  baseURL: `${API_URL}/students`, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter automatiquement le token JWT aux requêtes
studentApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================
// Fonctions CRUD pour les étudiants
// ==============================

export async function fetchAllStudents(filters = {}) {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await axiosInstance.get('/students', { params: filters });
    console.log('Données des students reçues:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des students:', error);
    throw error;
  }
}

export async function createStudent(StudentData) {
  const response = await axiosInstance.post('/students/', StudentData);
  return response.data;
}
export async function createAssignation(StudentData) {
  const response = await axiosInstance.post('/parentstudent/', StudentData);
  return response.data;
}
export async function removeAssignation(studentId, parentId) {
  const response = await axiosInstance.delete(`/parentstudent/${studentId}/${parentId}`);
  return response.data;
}
export async function updateStudent(id,StudentData) {
  const response = await axiosInstance.put(`/students/${id}`, StudentData);
  return response.data;
}
export async function deleteStudent(id) {
  const response = await axiosInstance.delete(`/students/${id}/delete-permanently/`);
  return response.data;
}

export async function studentbyetablishment(establishmentId ) {
  const response = await axiosInstance.get(`/students/${establishmentId}/students`);
  return response.data;
}



/**
 * 🔐 Obtenir les étudiants accessibles à l'utilisateur connecté
 */
export const getStudentsByUser = async (filters = {}) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await studentApi.get('/', { params: filters });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des étudiants de l'utilisateur:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 📄 Obtenir un étudiant par ID
 */
export const getStudentById = async (studentId) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await studentApi.get(`/${studentId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l’étudiant ${studentId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 🧾 Obtenir les détails d’un étudiant avec vérification d’accès (pour utilisateur connecté)
 */
export const getStudentDetailsById = async (studentId) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await studentApi.get(`/${studentId}/details`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails de l’étudiant ${studentId}:`, error.response?.data || error.message);
    throw error;
  }
};



/**
 * 🗑️ Supprimer doucement un étudiant (soft delete)
 */
export const softDeleteStudent = async (studentId) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await studentApi.patch(`/${studentId}/delete`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression douce de l’étudiant ${studentId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 🔁 Restaurer un étudiant supprimé
 */
export const restoreStudent = async (studentId) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await studentApi.patch(`/${studentId}/restore`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la restauration de l’étudiant ${studentId}:`, error.response?.data || error.message);
    throw error;
  }
};



/**
 * 🚨 Envoyer une demande de suppression d'un étudiant à un administrateur
 */
export const requestStudentDeletion = async (studentId, reason) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await studentApi.post(`/${studentId}/request-delete`, { reason });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l’envoi de la demande de suppression de l’étudiant ${studentId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * 🔍 Rechercher des étudiants (par nom, quartier, classe, etc.)
 */
export const searchStudents = async (query, filters = {}) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const params = { query, ...filters };
    const response = await studentApi.get('/search', { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche des étudiants:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 📊 Récupérer les statistiques des étudiants
 */
export const getStudentStatistics = async (filters = {}) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await studentApi.get('/statistics', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * 📈 Récupérer les statistiques détaillées d’un étudiant (présences/absences)
 */
export const getStudentStats = async (studentId, tripId) => {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const params = tripId ? { tripId } : {};
    const response = await studentApi.get(`/${studentId}/statistic`, { params });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des stats de l’étudiant ${studentId}:`, error.response?.data || error.message);
    throw error;
  }
};

