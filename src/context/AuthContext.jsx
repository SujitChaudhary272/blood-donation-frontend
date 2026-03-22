import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { authAPI, extractAuthPayload } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const isInitialized = useRef(false);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const response = await authAPI.getMe();
      const { user: currentUser } = extractAuthPayload(response);
      setUser(currentUser);
    } catch (error) {
      console.error('Load user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      if (token) {
        loadUser();
      } else {
        setLoading(false);
      }
    }
  }, [loadUser, token]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token: newToken, user: userData } = extractAuthPayload(response);

      if (!newToken || !userData) {
        throw new Error('Invalid login response from server');
      }
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      const { token: newToken, user: newUser } = extractAuthPayload(response);

      if (!newToken || !newUser) {
        throw new Error('Invalid signup response from server');
      }
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(newToken);
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed'
      };
    }
  };

  const googleAuth = async (payload) => {
    try {
      const response = await authAPI.googleAuth(payload);
      const { token: newToken, user: authUser } = extractAuthPayload(response);

      if (!newToken || !authUser) {
        throw new Error('Invalid Google auth response from server');
      }

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(authUser));

      setToken(newToken);
      setUser(authUser);

      return { success: true, user: authUser };
    } catch (error) {
      return {
        success: false,
        code: error.response?.data?.code || null,
        message: error.response?.data?.message || 'Google authentication failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    googleAuth,
    logout,
    refreshUser: loadUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
