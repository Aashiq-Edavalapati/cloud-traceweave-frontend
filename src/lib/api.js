import axios from 'axios';

// Get API URL from env, default to local Core API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
export const WS_URL = API_URL.replace('http', 'ws');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor: Handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend says "Unauthorized" (401), ensure frontend state knows it
    if (error.response?.status === 401) {
      // Optional: Trigger a global logout action here if you want to be aggressive
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);