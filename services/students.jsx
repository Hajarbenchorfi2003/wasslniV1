//file:services/school.jsx

import axios from 'axios';
import { getUser, getToken, isAuthenticated } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_SITE_URL;

// Instance Axios avec configuration de base
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour inclure le token automatiquement
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
     console.log("Token envoyé dans la requête :", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

    }
    return config;
  },
  (error) => Promise.reject(error)
);
export async function fetchAllStudents(filters = {}) {
  if (!isAuthenticated()) throw new Error('Non authentifié');

  try {
    const response = await axiosInstance.get('/students/students', { params: filters });
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