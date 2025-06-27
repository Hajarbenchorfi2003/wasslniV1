
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
//   /establishments
//    /Allestablishment
export async function fetchAllEstablishments() {
  const response = await axiosInstance.get('/establishments/Allestablishment');
  return response.data;
}
export async function fetchUserEstablishments() {
  const response = await axiosInstance.get('/establishments');
  return response.data;
}

export async function createEstablishments(establishment) {
  const response = await axiosInstance.get('/establishments',establishment);
  return response.data;
}
export async function updateEstablishments(id,establishment) {
  const response = await axiosInstance.put(`/establishments/${id}`,establishment);
  return response.data;
}
//router.delete('/:id', verifyToken,authorize("delete:establishment"),establishmentController.deleteEstablishmentPermanently);


 export async function deletePremently(id) {
  const response = await axiosInstance.delete(`/establishments/${id}`);
  return response.data;
}
export async function detailsEstablishments(id) {
  const response = await axiosInstance.get(`/establishments/${id}`);
  return response.data;
}
