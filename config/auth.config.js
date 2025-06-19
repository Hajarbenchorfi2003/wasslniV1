import { api } from "@/config/axios.config";

export const loginUser = async (data) => {
  try {
    const response = await api.post("/users/login", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur est survenue" };
  }
};

export const registerUser = async (data) => {
  try {
    const response = await api.post("/users/register", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur est survenue" };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/users/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur est survenue" };
  }
};

export const resetPassword = async (data) => {
  try {
    const response = await api.post("/users/reset-password", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur est survenue" };
  }
}; 