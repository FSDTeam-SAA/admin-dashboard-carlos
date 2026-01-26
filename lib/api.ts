import axiosInstance from './axios-instance';

// Types
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    role: string;
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
      avatar: { public_id: string; url: string };
      role: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface DashboardOverview {
  totalRevenue: number;
  totalUsers: number;
  totalFieldOwners: number;
  joiningOverview: Array<{ date: string; count: number }>;
}

export interface Field {
  _id: string;
  fieldName: string;
  description: string;
  fieldType: string;
  location: {
    coordinates: { latitude: number; longitude: number };
    address: string;
    mapUrl: string | null;
  };
  servicesAmenities: {
    showers: boolean;
    lights: boolean;
    parking: boolean;
    changingRooms: boolean;
    cafe: boolean;
    equipmentRental: boolean;
  };
  rating: { average: number; count: number };
  basePricePerHour: number;
  pricePerHour: Array<{
    date: string;
    startTime: string;
    endTime: string;
    pricePerHour: number;
    _id: string;
  }>;
  images: Array<{ url: string; originalName: string; uploadDate: string; _id: string }>;
  owner: { _id: string; name: string; email: string };
  isActive: boolean;
  promotion: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FieldOwner {
  _id: string;
  name: string;
  email: string;
  joinedDate: string;
  spentOnSubscription: number;
  planName: string;
  status: 'Free' | 'Paid';
  avatar: string;
}

export interface Subscription {
  _id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  isActive: boolean;
}

export interface Plan {
  _id: string;
  name: string;
  price: number;
  description: string;
  billingCycle: 'monthly' | 'yearly';
  benefits: string[];
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar: { url: string; public_id?: string };
  role: string;
  status?: string;
  phone?: string;
  position?: string;
  age?: number;
  FavoriteClub?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  _id: string;
  title?: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

// Authentication APIs
export const authApi = {
  login: (payload: LoginPayload) =>
    axiosInstance.post<LoginResponse>('/auth/login', payload),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    axiosInstance.post('/auth/forget', payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    axiosInstance.post('/auth/verify-otp', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    axiosInstance.post('/auth/reset-password', payload),

  changePassword: (payload: ChangePasswordPayload) =>
    axiosInstance.post('/auth/change-password', payload),

  refreshToken: () => axiosInstance.post('/auth/reset-refresh-token', {}),
};

// Dashboard APIs
export const dashboardApi = {
  getOverview: () =>
    axiosInstance.get<{ success: boolean; message: string; data: DashboardOverview }>(
      '/admin/dashboard/overview'
    ),
};

// Field APIs
export const fieldApi = {
  getAllFields: (page = 1, limit = 10) =>
    axiosInstance.get<{
      success: boolean;
      message: string;
      data: { fields: Field[]; total: number; pages: number };
    }>('/field', { params: { page, limit } }),

  getFieldById: (id: string) =>
    axiosInstance.get<{ success: boolean; message: string; data: Field }>(`/field/${id}`),

  createField: (payload: Partial<Field>) =>
    axiosInstance.post<{ success: boolean; message: string; data: Field }>('/field', payload),

  updateField: (id: string, payload: Partial<Field>) =>
    axiosInstance.put<{ success: boolean; message: string; data: Field }>(
      `/field/${id}`,
      payload
    ),

  deleteField: (id: string) => axiosInstance.delete(`/field/${id}`),
};

// Field Owner APIs
export const fieldOwnerApi = {
  getAll: (page = 1, limit = 10) =>
    axiosInstance.get<{
      success: boolean;
      message: string;
      data: { fieldOwners: FieldOwner[]; total: number; pages: number };
    }>('/admin/field-owners', { params: { page, limit } }),

  getById: (id: string) =>
    axiosInstance.get<{ success: boolean; message: string; data: FieldOwner }>(
      `/admin/field-owners/${id}`
    ),
};

// Subscription APIs
export const subscriptionApi = {
  getPlans: () =>
    axiosInstance.get<{
      success: boolean;
      message: string;
      data: Subscription[];
    }>('/plans'),

  updateSubscription: (planId: string) =>
    axiosInstance.put('/subscription/update', { planId }),
};

// Plan Management APIs
export const planApi = {
  getAllPlans: () =>
    axiosInstance.get<{
      success: boolean;
      message: string;
      data: Plan[];
    }>('/plan'),

  createPlan: (payload: Omit<Plan, '_id'>) =>
    axiosInstance.post<{
      success: boolean;
      message: string;
      data: Plan;
    }>('/plan', payload),

  updatePlan: (id: string, payload: Partial<Plan>) =>
    axiosInstance.patch<{
      success: boolean;
      message: string;
      data: Plan;
    }>(`/plan/${id}`, payload),

  deletePlan: (id: string) =>
    axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/plan/${id}`),
};

// User APIs
export const userApi = {
  getProfile: () =>
    axiosInstance.get<{ success: boolean; message: string; data: UserProfile }>(
      '/user/profile'
    ),

  updateProfile: (payload: Partial<UserProfile> | FormData) =>
    axiosInstance.put<{ success: boolean; message: string; data: UserProfile }>(
      '/user/profile',
      payload,
      {
        headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      }
    ),
};

// Notification APIs
export const notificationApi = {
  getAll: () =>
    axiosInstance.get<{
      success: boolean;
      message: string;
      data: { notifications: NotificationItem[] } | NotificationItem[];
    }>('/notification'),

  markAsRead: (notificationId: string) =>
    axiosInstance.patch<{ success: boolean; message: string }>(
      `/notification/mark-as-read/${notificationId}`
    ),

  markAllAsRead: () =>
    axiosInstance.patch<{ success: boolean; message: string }>(
      '/notification/mark-all-as-read'
    ),
};
