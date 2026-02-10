import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

type AuthenticatedRequestConfig = InternalAxiosRequestConfig & {
  _authHandled?: boolean;
  _skipAuth?: boolean;
};

const AUTH_BYPASS_PATHS = [
  '/auth/login',
  '/auth/forget',
  '/auth/verify-otp',
  '/auth/reset-password',
  '/auth/change-password',
  '/auth/reset-refresh-token',
];

const LOGIN_PATH = '/login';

let isSigningOut = false;

const shouldSkipAuthHandling = (config?: AuthenticatedRequestConfig) => {
  if (!config?.url) return false;
  if (config._skipAuth) return true;
  return AUTH_BYPASS_PATHS.some((path) => config.url?.includes(path));
};

const clearClientAuthStorage = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('[auth] Error clearing client auth storage:', error);
  }
};

// Request Interceptor - Add token to headers
axiosInstance.interceptors.request.use(
  async (config: AuthenticatedRequestConfig) => {
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
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as AuthenticatedRequestConfig | undefined;

    if (status !== 401 || shouldSkipAuthHandling(config)) {
      return Promise.reject(error);
    }

    if (!config || config._authHandled || isSigningOut) {
      return Promise.reject(error);
    }

    config._authHandled = true;

    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    isSigningOut = true;
    clearClientAuthStorage();

    try {
      await signOut({ redirect: false });
    } catch (signOutError) {
      console.error('[auth] Error during sign out:', signOutError);
    } finally {
      if (window.location.pathname !== LOGIN_PATH) {
        window.location.assign(LOGIN_PATH);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
