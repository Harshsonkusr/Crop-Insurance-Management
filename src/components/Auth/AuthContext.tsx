import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../../lib/api';

interface AuthContextType {
  user: { 
    _id?: string;
    role: string; 
    name: string; 
    email?: string;
    mobileNumber?: string;
    profilePhoto?: string;
    status?: string;
    isApproved?: boolean;
  } | null;
  token: string | null;
  login: (token: string, user?: { role: string; name: string; profilePhoto?: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [token, setToken] = useState<string | null>(() => {
    // Only store token in localStorage (standard practice for JWT)
    return localStorage.getItem('token');
  });
  const [loading, setLoading] = useState(true);

  // Fetch user data from backend when token exists
  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      // If token is invalid, clear it
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setToken(null);
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch user on mount and when token changes
  useEffect(() => {
    fetchUser();
  }, [token]);

  // Store token in localStorage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (newToken: string, initialUser?: { role: string; name: string; profilePhoto?: string }): Promise<void> => {
    if (!newToken) {
      throw new Error('Token is required');
    }
    
    // Store token in localStorage first (so API interceptor can use it)
    localStorage.setItem('token', newToken);
    
    // Fetch full user data from backend
    try {
      const response = await api.get('/auth/me');
      
      // Set both token and user atomically after successful fetch
      setToken(newToken);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user after login:', error);
      // Clear token if fetch fails
      localStorage.removeItem('token');
      
      // Fallback to initial user data if provided
      if (initialUser) {
        setToken(newToken);
        setUser(initialUser);
      } else {
        throw error; // Re-throw if no fallback user provided
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUser();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, refreshUser }}>
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
