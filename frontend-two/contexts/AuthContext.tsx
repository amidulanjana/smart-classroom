import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '@/services/api';
import type { User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (check AsyncStorage or secure storage)
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // TODO: Check AsyncStorage for saved token
      // For now, we'll check if there's a stored token in memory
      const token = apiService.getToken();
      
      if (token) {
        // Verify token by fetching profile
        const response = await apiService.getProfile();
        if (response.success && response.data) {
          setUser({
            id: response.data.id,
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone,
            role: response.data.role,
            profilePhoto: response.data.profilePhoto,
          });
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }

      const userData: User = {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone,
        role: response.data.user.role,
        profilePhoto: response.data.user.profilePhoto,
      };

      setUser(userData);
      
      // TODO: Save token to AsyncStorage for persistence
      // await AsyncStorage.setItem('token', response.data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    apiService.logout();
    // TODO: Clear AsyncStorage
    // await AsyncStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
