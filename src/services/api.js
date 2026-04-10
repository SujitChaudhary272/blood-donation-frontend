import axios from 'axios';

export const API_URL = process.env.REACT_APP_API_URL || 'https://blood-donation-backend-8hhn.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isAuthRoute = (url = '') => {
  return ['/auth/login', '/auth/signup', '/auth/google'].some((route) => url.includes(route));
};

export const extractAuthPayload = (response) => {
  const payload = response?.data?.data || response?.data || {};
  const user = payload.user || payload;

  return {
    token: payload.token || null,
    user: user && user._id ? user : null
  };
};

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isAuthRoute(error.config?.url)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Token management functions
export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const clearAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Auth APIs
const postWithFallback = async (primaryUrl, fallbackUrl, data) => {
  try {
    return await api.post(primaryUrl, data);
  } catch (error) {
    if (error.response?.status === 404 && fallbackUrl) {
      return api.post(fallbackUrl, data);
    }
    throw error;
  }
};

export const authAPI = {
  signup: (data) => {
    if (data?.role === 'donor') {
      return postWithFallback('/auth/signup/donor', '/auth/signup', data);
    }
    if (data?.role === 'receiver') {
      return postWithFallback('/auth/signup/receiver', '/auth/signup', data);
    }
    return api.post('/auth/signup', data);
  },
  login: (data) => {
    if (data?.role === 'donor') {
      return postWithFallback('/auth/login/donor', '/auth/login', data);
    }
    if (data?.role === 'receiver') {
      return postWithFallback('/auth/login/receiver', '/auth/login', data);
    }
    return api.post('/auth/login', data);
  },
  getGoogleConfig: () => api.get('/auth/google-config'),
  googleAuth: (data) => api.post('/auth/google', data),
  completeGoogleSignup: async (data) => {
    try {
      return await api.put('/auth/google/complete-profile', data);
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          return await api.put('/auth/google/complete-signup', data);
        } catch (secondError) {
          if (secondError.response?.status === 404) {
            try {
              return await api.put('/auth/complete-google-signup', data);
            } catch (thirdError) {
              if (thirdError.response?.status === 404) {
                const { name, phone, password, confirmPassword } = data || {};

                if (!name || !phone || !password || !confirmPassword) {
                  throw thirdError;
                }

                if (password !== confirmPassword) {
                  const mismatchError = new Error('Passwords do not match');
                  mismatchError.response = {
                    data: {
                      message: 'Passwords do not match'
                    }
                  };
                  throw mismatchError;
                }

                await api.put('/auth/update-profile', { name, phone });
                await api.put('/auth/change-password', { newPassword: password });
                const meResponse = await api.get('/auth/me');

                return {
                  data: {
                    success: true,
                    message: 'Profile completed successfully. You can now log in with email/password or Google.',
                    user: meResponse?.data?.user || null
                  }
                };
              }
              throw thirdError;
            }
          }
          throw secondError;
        }
      }
      throw error;
    }
  },
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  deleteAccount: ({ password, confirmName } = {}) =>
    api.delete('/auth/delete-account', {
      data: {
        confirmName,
        ...(password ? { password } : {})
      }
    }),
};

// Legacy auth exports (for backward compatibility)
export const register = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/me');

// Donor APIs
export const donorAPI = {
  getAllDonors: (params) => api.get('/donors', { params }),
  searchDonors: (params) => api.get('/donors/search', { params }),
  getDonor: (id) => api.get(`/donors/${id}`),
  createDonor: (data) => api.post('/donors', data),
  updateDonor: (id, data) => api.put(`/donors/${id}`, data),
  deleteDonor: (id) => api.delete(`/donors/${id}`),
  getMyProfile: () => api.get('/donors/profile'),
};

// Legacy donor exports
export const getDonors = (params) => api.get('/donors', { params });
export const getDonorById = (id) => api.get(`/donors/${id}`);
export const registerDonor = (data) => api.post('/donors', data);
export const updateDonor = (id, data) => api.put(`/donors/${id}`, data);
export const deleteDonor = (id) => api.delete(`/donors/${id}`);
export const searchDonors = (params) => api.get('/donors/search', { params });



// Request APIs
export const requestAPI = {
  getAllRequests: (params) => api.get('/requests', { params }),
  getMyRequests: () => api.get('/requests/my-requests'),
  createDonorRequest: (donorId) => api.post('/requests/create', { donorId }),
  getDonorRequests: () => api.get('/requests/donor'),
  getReceiverRequests: () => api.get('/requests/receiver'),
  getRequest: (id) => api.get(`/requests/${id}`),
  createRequest: (data) => api.post('/requests', data),
  updateRequest: (id, data) => api.put(`/requests/${id}`, data),
  updateRequestStatus: (id, data) => api.put(`/requests/${id}/status`, data),
  cancelRequest: (id) => api.put(`/requests/${id}/cancel`),
  acceptRequest: (id) => api.put(`/requests/${id}/accept`),
  completeRequest: (id) => api.put(`/requests/${id}/complete`),
  downloadCertificate: (id) => api.get(`/certificate/${id}`, { responseType: 'blob' }),
  deleteRequest: (id) => api.delete(`/requests/${id}`),
  deletePendingDonorRequest: (id) => api.delete(`/requests/${id}`),
};

// Legacy request exports
export const getRequests = (params) => api.get('/requests', { params });
export const getRequestById = (id) => api.get(`/requests/${id}`);
export const getMyRequests = (params) => api.get('/requests', { params });
export const createRequest = (data) => api.post('/requests', data);
export const updateRequest = (id, data) => api.put(`/requests/${id}`, data);
export const updateRequestStatus = (id, data) => api.put(`/requests/${id}/status`, data);
export const deleteRequest = (id) => api.delete(`/requests/${id}`);

export default api;
