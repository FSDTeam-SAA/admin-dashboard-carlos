import axios, { AxiosError, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request Interceptor - Add token to headers
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    } catch (error) {
      console.error('[v0] Error getting session:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
