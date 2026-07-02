import axios from 'axios';

/*this file is the interceptor ,
it will take in requests with json load, attach it with the access token if it exists in localStorage or sessionStorage, 
and send it to the backend.
If the backend responds with 401 Unauthorized, 
it will attempt to refresh the access token using the refresh token stored in the same storage 
(localStorage or sessionStorage) as the access token. 
If successful, it will retry the original request with the new access token. 
If not, it will clear both storages and redirect to login.

This is the middleman to handle communication between the frontend and backend,
*/

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// 1. The Public Client (For Login, Registration, Password Reset)
// No interceptor attached. Completely raw.
export const publicApi = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
});
// 2. The Private Client (For Dashboard, Profile, Settings)
// This one has the interceptor security guard attached.
export const privateApi = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
});

publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server didn't respond at all (Network/Server down)
    if (!error.response) {
      return Promise.reject(new Error('Network error. Is the server running?'));
    }
    
    // For ALL server responses (400, 401, 422, etc.), pass the raw error along 
    // so the individual component can inspect it!
    return Promise.reject(error);
  }
);

privateApi.interceptors.request.use((config) => {
  // Check both storages to find the active token , if it exists, attach it to the Authorization header, otherwise, the request will go through without a token and the server will respond with 401 Unauthorized.
  const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Response Interceptor: if the server responds with 401 Unauthorized, attempt to refresh the token using the refresh token stored in the same storage (localStorage or sessionStorage) as the access token. If successful, retry the original request with the new access token. If not, clear both storages and redirect to login.
privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 1. Explicitly determine which storage holds our session
        const hasLocal = localStorage.getItem('refreshToken') !== null;
        const activeStorage = hasLocal ? localStorage : sessionStorage;
        
        const refreshToken = activeStorage.getItem('refreshToken');
        
        if (!refreshToken) throw new Error("No refresh token available");

        const res = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken
        });

        if (res.status === 200) {
          // 2. Save tokens back to the exact same storage container we found them in
          activeStorage.setItem('userToken', res.data.access);
          
          if (res.data.refresh) {
            activeStorage.setItem('refreshToken', res.data.refresh);
          }

          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return privateApi(originalRequest);
        }
      } catch (refreshError) { // if no refresh token or refresh fails, log them out
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);