// src/api/userApi.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

// Create an axios instance with default config
const userApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
userApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export const updateProfile = async (profileData) => {
  try {
    console.log('Sending profile update request:', profileData);
    
    const response = await userApi.post('/complete-profile', profileData);
    
    console.log('Profile update response:', response.data);
    return response;
  } catch (error) {
    console.error('Profile update error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export default userApi;