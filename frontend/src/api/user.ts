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
    const response = await axiosInstance.get<User>('/api/user/me');
    return response.data;
  },

};
