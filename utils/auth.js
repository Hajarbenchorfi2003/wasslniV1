import axios from 'axios';

// Récupérer l'utilisateur depuis le localStorage
export const getUser = () => {
  if (typeof window !== 'undefined') {
    try {
      const user = localStorage.getItem('user');
      if (!user || user === 'undefined' || user === 'null') return null;
      return JSON.parse(user);
    } catch (err) {
      console.error('❌ Failed to parse user from localStorage:', err);
      return null;
    }
  }
  return null;
};

// Sauvegarder l'utilisateur et le token dans le localStorage
export const saveUser = (data) => {
  try {
    if (data?.token) {
      localStorage.setItem('token', data.token);
    }
    if (data?.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  } catch (err) {
    console.error('❌ Failed to save user to localStorage:', err);
  }
};

// Supprimer les infos utilisateur du localStorage
export const logout = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (err) {
    console.error('❌ Failed to logout user:', err);
  }
};

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Obtenir le token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Service d'authentification avec API backend
export const authAPI = {
  // ✅ Connexion à l'API : http://localhost:5000/api/user/login
  async login(email, password) {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SITE_URL}/user/login`, {
        email,
        password,
      });

      if (response.data.token) {
        saveUser(response.data);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error.response?.data || { message: 'Erreur de connexion' };
    }
  },

  logoutUser() {
    logout();
  },

  isAuthenticated() {
    return isAuthenticated();
  },

  getCurrentUser() {
    return getUser();
  },

  getToken() {
    return getToken();
  },

  async refreshUser() {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('❌ Failed to refresh user:', error);
      throw error.response?.data || { message: 'Erreur lors du rafraîchissement' };
    }
  },
};

// Service utilisateur
export const userAPI = {
  async getProfile() {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/user/voirmonprofil`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get profile:', error);
      throw error.response?.data || { message: 'Erreur lors de la récupération du profil' };
    }
  },

  async updateProfile(userData) {
    try {
      const token = getToken();
      const response = await axios.put(`${process.env.NEXT_PUBLIC_SITE_URL}/api/user/voirmonprofil`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du profil' };
    }
  },

  async changePassword(passwordData) {
    try {
      const token = getToken();
      const response = await axios.put(`${process.env.NEXT_PUBLIC_SITE_URL}/user/modifier-mot-de-passe`, passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to change password:', error);
      throw error.response?.data || { message: 'Erreur lors du changement de mot de passe' };
    }
  }
};
