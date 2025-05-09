// src/api/authApi.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const loginUser = async (credentials) => {
  try {
    console.log('Attempting to login with:', credentials.email);
    const response = await axios.post(`${API_URL}/login`, credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Login successful:', response.data);
    return response;
  } catch (error) {
    console.error('Login error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
};

export const changePassword = async (data) => {
    const token = localStorage.getItem('token');
    try {
      // Log the request data and headers for debugging
      console.log('Change password request:', data);
      console.log('Using token:', token);
      
      const response = await axios.post(`${API_URL}/change-password`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      console.log('Change password response:', response.data);
      return response;
    } catch (error) {
      console.error('Change password error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        fullError: error
      });
      throw error;
    }
  };