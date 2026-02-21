import axios from 'axios';

/**
 * AXIOS INSTANCE CONFIGURATION
 * Centralized API service for CyberSecure-Hub.
 */
const API = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

/**
 * REQUEST INTERCEPTOR
 * Injects the JWT into every outgoing request.
 * Matches the backend authMiddleware requirement for "Bearer <token>".
 */
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Standard Authorization header with Bearer prefix
    req.headers['Authorization'] = `Bearer ${token}`;
    
    // Legacy support for x-auth-token if your older routes still require it
    req.headers['x-auth-token'] = token; 
  }
  return req;
}, (error) => {
  return Promise.reject(error);
});

/**
 * RESPONSE INTERCEPTOR
 * The "Stability Guard": Prevents instant redirects if a token is still syncing.
 * This is the critical fix for the 3-4 second "kick-out" problem.
 */
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Expired, Tampered, or "Settling" Token)
    if (error.response && error.response.status === 401) {
      
      /**
       * RACE CONDITION RETRY:
       * If the browser is running fast (console closed), localStorage might 
       * take a moment to be readable. We wait 500ms and retry once.
       */
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        // Wait for the storage write to finalize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Re-fetch the fresh token from storage
        const freshToken = localStorage.getItem('token');
        
        if (freshToken) {
          // Update the headers with the verified token and retry
          originalRequest.headers['Authorization'] = `Bearer ${freshToken}`;
          originalRequest.headers['x-auth-token'] = freshToken;
          return API(originalRequest);
        }
      }

      console.error("SECURE ACCESS DENIED: Clearing session and redirecting.");
      
      // Clean up local session evidence
      localStorage.removeItem('token');
      
      // Hard redirect to Login, but only if we aren't already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/verifyOTP') {
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

/**
 * AUTHENTICATION ENDPOINTS
 * Multi-step verification flow.
 */
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const sendOTP = (data) => API.post('/auth/send-otp', data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data);

/**
 * SECURE DATA MANAGEMENT (NOTES)
 * Protected by authMiddleware on the server.
 */
export const getNotes = () => API.get('/data/notes');
export const addNote = (note) => API.post('/data/notes', note);
export const deleteNote = (id) => API.delete(`/data/notes/${id}`);

/**
 * SECURE FILE VAULT
 * Handles encrypted file storage.
 */
export const getFiles = () => API.get('/data/files'); 
export const uploadFile = (formData) => API.post('/data/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteFile = (id) => API.delete(`/data/files/${id}`);

export default API;