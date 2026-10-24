import React, { createContext, useContext, useState } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/authService';

// 1. Create the Authentication Context
export const AuthContext = createContext(null);

/**
 * AuthProvider component that wraps the application.
 * It manages global user state and provides authentication actions (login, register, logout).
 */
export const AuthProvider = ({ children }) => {
  // State 1: Current authenticated user (initialized from localStorage if previously logged in)
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      return null;
    }
  });

  // State 2: Loading state for authentication processes
  const [loading, setLoading] = useState(false);

  // State 3: Derived authentication status
  const isAuthenticated = Boolean(user);

  /**
   * Log in user
   * @param {Object} userData - { email, password }
   */
  const login = async (userData) => {
    setLoading(true);
    try {
      const data = await loginUser(userData);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   */
  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await registerUser(userData);
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out current user and clear local session state
   */
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error on backend:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      setLoading(false);
    }
  };

  // Values exposed to any component consuming this context
  const contextValue = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to allow easy access to auth context values and functions.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
