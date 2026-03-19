import axios from 'axios';

/**
 * AXIOS INSTANCE CONFIGURATION
 * Now dynamically targets the Render Backend in production.
 */
const API = axios.create({
  // ✅ FIX: Fallback to localhost only if the environment variable isn't set
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` 
    : 'http://localhost:5000/api', 
});

/**
 * REQUEST INTERCEPTOR
 * Injects the JWT into every outgoing request.
 */
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers['Authorization'] = `Bearer ${token}`;
    req.headers['x-auth-token'] = token; 
  }
  return req;
}, (error) => {
  return Promise.reject(error);
});

/**
 * RESPONSE INTERCEPTOR
 * Handles token sync issues and unauthorized redirects.
 */
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        // Wait for the storage write to finalize (500ms safety buffer)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const freshToken = localStorage.getItem('token');
        
        if (freshToken) {
          originalRequest.headers['Authorization'] = `Bearer ${freshToken}`;
          originalRequest.headers['x-auth-token'] = freshToken;
          return API(originalRequest);
        }
      }

      console.error("SECURE ACCESS DENIED: Redirecting to Login.");
      
      localStorage.removeItem('token');
      
      if (window.location.pathname !== '/login' && window.location.pathname !== '/verifyOTP') {
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

/**
 * AUTHENTICATION ENDPOINTS
 */
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const sendOTP = (data) => API.post('/auth/send-otp', data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data);

/**
 * SECURE DATA MANAGEMENT (NOTES)
 */
export const getNotes = () => API.get('/data/notes');
export const addNote = (note) => API.post('/data/notes', note);
export const deleteNote = (id) => API.delete(`/data/notes/${id}`);

/**
 * SECURE FILE VAULT
 */
export const getFiles = () => API.get('/data/files'); 
export const uploadFile = (formData) => API.post('/data/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteFile = (id) => API.delete(`/data/files/${id}`);

export default API;