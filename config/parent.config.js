import { api } from "@/config/axios.config";

export const getParentProfile = async (parentId) => {
  try {
    const response = await api.get(`/parents/${parentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur est survenue" };
  }
};

export const getParentChildren = async (parentId) => {
  try {
    const response = await api.get(`/parents/${parentId}/children`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur est survenue" };
  }
};

export const getChildDailyTrip = async (childId) => {
  try {
    const response = await api.get(`/children/${childId}/daily-trip`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur est survenue" };
  }
};

export const getChildAttendanceHistory = async (childId) => {
  try {
    const response = await api.get(`/children/${childId}/attendance-history`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur est survenue" };
  }
};

export const getParentNotifications = async (parentId) => {
  try {
    const response = await api.get(`/parents/${parentId}/notifications`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur est survenue" };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur est survenue" };
  }
};

export const reportConcern = async (parentId, data) => {
  try {
    const response = await api.post(`/parents/${parentId}/concerns`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur est survenue" };
  }
};

export const reportAttendance = async (data) => {
  try {
    const response = await api.post('/attendance/reports', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Une erreur est survenue" };
  }
}; 

/* /parents/:id - Get parent profile
/parents/:id/children - Get parent's children
/children/:id/daily-trip - Get child's daily trip
/children/:id/attendance-history - Get child's attendance history
/parents/:id/notifications - Get parent's notifications
/notifications/:id/read - Mark notification as read
/parents/:id/concerns - Report a concern
/attendance/reports - Report attendance issues */