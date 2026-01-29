import axiosInstance from '../lib/axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

// Auth API endpoints
export const authApi = {
  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  // Refresh access token
  refresh: async (data: RefreshRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/refresh', data);
    return response.data;
  },

  // Logout user, backend will invalidate the refresh token
  logout: async (): Promise<void> => {
    await axiosInstance.post('/api/auth/logout');
  },

  ping: async (): Promise<void> => {
    await axiosInstance.post('/api/auth/ping');
  },
};
