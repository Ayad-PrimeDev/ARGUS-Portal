import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/authService';
import { getUserProfile } from '../services/userService';

export const AuthContext = createContext(null);

/**
 * AuthProvider component that wraps the application.
 * Manages global user state, role synchronization with backend, and authentication actions.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // Synchronize authenticated user role and status directly from backend database on mount
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const profileData = await getUserProfile();
        if (isMounted && profileData?.user) {
          const verifiedUser = {
            _id: profileData.user._id,
            name: profileData.user.name,
            email: profileData.user.email,
            role: profileData.user.role || 'USER',
            isSuspended: !!profileData.user.isSuspended,
            profileImage: profileData.user.profileImage || '',
            phoneNumber: profileData.user.phoneNumber || '',
            createdAt: profileData.user.createdAt
          };

          if (verifiedUser.isSuspended) {
            setUser(null);
            localStorage.removeItem('user');
          } else {
            setUser(verifiedUser);
            localStorage.setItem('user', JSON.stringify(verifiedUser));
          }
        }
      } catch (err) {
        // If cookie expired or unauthorized, clear stale local session
        if (isMounted) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            setUser(null);
            localStorage.removeItem('user');
          }
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const isAuthenticated = Boolean(user && !user.isSuspended);

  /**
   * Log in user
   * @param {Object} userData - { email, password }
   */
  const login = async (userData) => {
    setLoading(true);
    try {
      const data = await loginUser(userData);
      const verifiedUser = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role || 'USER',
        isSuspended: !!data.isSuspended,
        createdAt: data.createdAt,
      };
      setUser(verifiedUser);
      localStorage.setItem('user', JSON.stringify(verifiedUser));
      return { success: true, data: verifiedUser };
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

  /**
   * Update locally stored user data (e.g. after profile edit)
   * @param {Object} updatedFields
   */
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const contextValue = {
    user,
    isAuthenticated,
    loading,
    isVerifying,
    login,
    register,
    logout,
    updateUser,
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
