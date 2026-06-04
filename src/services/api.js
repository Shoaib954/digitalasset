/* ============================================
   DigiAsset — API Service Layer
   Axios instance + all API endpoint functions
   ============================================ */
import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// --- Request Interceptor: attach JWT token ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('digiasset_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response Interceptor: handle errors globally ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    // If 401 (unauthorized), clear token and redirect
    if (error.response?.status === 401) {
      localStorage.removeItem('digiasset_token');
      // Only redirect if not already on login/register/landing
      const path = window.location.pathname;
      if (!['/login', '/register', '/'].includes(path)) {
        window.location.href = '/login';
      }
    }
    // Don't toast for auth-check calls
    if (!error.config?.skipToast) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

// ==========================================
//  AUTH
// ==========================================
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getProfile = () => api.get('/auth/profile', { skipToast: true });
export const updateProfile = (data) => api.put('/auth/profile', data);
export const checkInUser = () => api.post('/auth/check-in');

// ==========================================
//  ASSETS
// ==========================================
export const getAssets = () => api.get('/assets');
export const getAsset = (id) => api.get(`/assets/${id}`);
export const createAsset = (data) => api.post('/assets', data);
export const updateAsset = (id, data) => api.put(`/assets/${id}`, data);
export const deleteAsset = (id) => api.delete(`/assets/${id}`);
export const getAssetStats = () => api.get('/assets/stats/summary');
export const assignBeneficiaries = (id, data) => api.put(`/assets/${id}/beneficiaries`, data);

// ==========================================
//  BENEFICIARIES
// ==========================================
export const getBeneficiaries = () => api.get('/beneficiaries');
export const getBeneficiary = (id) => api.get(`/beneficiaries/${id}`);
export const createBeneficiary = (data) => api.post('/beneficiaries', data);
export const updateBeneficiary = (id, data) => api.put(`/beneficiaries/${id}`, data);
export const deleteBeneficiary = (id) => api.delete(`/beneficiaries/${id}`);

// ==========================================
//  DOCUMENTS
// ==========================================
export const getDocuments = () => api.get('/documents');
export const uploadDocument = (formData) =>
  api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getDocument = (id) => api.get(`/documents/${id}`);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const downloadDocument = (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' });

// ==========================================
//  DIGITAL WILL
// ==========================================
export const getWill = () => api.get('/will');
export const createWill = (data) => api.post('/will', data);
export const updateWill = (id, data) => api.put(`/will/${id}`, data);
export const finalizeWill = (id) => api.put(`/will/${id}/finalize`);
export const getWillPdf = (id) => api.get(`/will/${id}/pdf`, { responseType: 'blob' });

// ==========================================
//  INHERITANCE PLANS
// ==========================================
export const getPlans = () => api.get('/inheritance');
export const getPlan = (id) => api.get(`/inheritance/${id}`);
export const createPlan = (data) => api.post('/inheritance', data);
export const updatePlan = (id, data) => api.put(`/inheritance/${id}`, data);
export const triggerPlan = (id) => api.put(`/inheritance/${id}/trigger`);
export const getTimeline = () => api.get('/inheritance/timeline');

// ==========================================
//  DEAD MAN'S SWITCH
// ==========================================
export const getSwitch = () => api.get('/deadswitch');
export const updateSwitch = (data) => api.post('/deadswitch', data);
export const checkIn = () => api.post('/deadswitch/checkin');
export const toggleSwitch = (data) => api.put('/deadswitch/toggle', data);

// ==========================================
//  AI SERVICES
// ==========================================
export const getAdvisorAnalysis = () => api.post('/ai/advisor', {});
export const chat = (data) => api.post('/ai/chat', data);
export const getReadinessScore = () => api.get('/ai/readiness-score');

// ==========================================
//  NOTIFICATIONS
// ==========================================
export const getNotifications = () => api.get('/notifications');
export const markRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllRead = () => api.put('/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

// ==========================================
//  ADMIN
// ==========================================
export const getUsers = () => api.get('/admin/users');
export const getAdminStats = () => api.get('/admin/stats');
export const getAuditLog = () => api.get('/admin/audit-log');

export default api;
