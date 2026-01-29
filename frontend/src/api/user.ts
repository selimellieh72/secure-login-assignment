import axiosInstance from '../lib/axios';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// User API endpoints
export const userApi = {
  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/api/users/me');
    return response.data;
  },

  // Update current user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put<User>('/api/users/me', data);
    return response.data;
  },
};
