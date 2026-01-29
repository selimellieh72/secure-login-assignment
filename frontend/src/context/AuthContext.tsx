import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type LoginRequest, type RegisterRequest, authApi } from '../api/auth';
import { type User, userApi } from '../api/user';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to clear auth data from state and storage
  const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
  };

  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      
      // Store tokens immediately so subsequent requests can use them
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setAccessToken(response.accessToken);
      
      // Fetch full user profile
      const userProfile = await userApi.getCurrentUser();
      setUser(userProfile);
    } catch (error) {
      clearAuthData();
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setAccessToken(response.accessToken);
      
      const userProfile = await userApi.getCurrentUser();
      setUser(userProfile);
    } catch (error) {
      clearAuthData();
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Attempt to call logout endpoint, but don't block local logout on failure
      await authApi.logout();
    } catch (e) {
      console.error('Logout API call failed:', e);
    } finally {
      clearAuthData();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedToken && storedRefreshToken) {
        setAccessToken(storedToken);
        try {
          // This call might trigger the axios interceptor refresh flow if token is expired
          const userProfile = await userApi.getCurrentUser();
          setUser(userProfile);
          
          // If a refresh happened in the background (via axios interceptor), 
          // localStorage will have the new token. We should sync our state.
          const currentToken = localStorage.getItem('accessToken');
          if (currentToken && currentToken !== storedToken) {
            setAccessToken(currentToken);
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
          clearAuthData();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for token updates from axios interceptor
    const handleTokenUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.accessToken) {
        setAccessToken(customEvent.detail.accessToken);
      }
    };

    window.addEventListener('auth:token-update', handleTokenUpdate);
    return () => window.removeEventListener('auth:token-update', handleTokenUpdate);
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        accessToken, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        register, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
