import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setClientToken } from '../services/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string, fullName: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  updateProfile: (fullName: string, email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync token with client requests
  useEffect(() => {
    setClientToken(token);
  }, [token]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ username, password });
      const { token: jwtToken, ...profile } = response.data;
      setToken(jwtToken);
      setUser(profile);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string, fullName: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authApi.register({ username, email, password, fullName });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setClientToken(null);
    // Clear client-side cache and trigger reload for security
    window.location.href = '/login';
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const response = await authApi.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh profile', error);
      logout();
    }
  };

  const updateProfile = async (fullName: string, email: string): Promise<boolean> => {
    try {
      const response = await authApi.updateProfile({ fullName, email });
      setUser(response.data);
      return true;
    } catch (error) {
      console.error('Profile update failed', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        register,
        refreshProfile,
        updateProfile,
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
