import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('adhd_auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
    setLoading(false);
  }, []);

  // Persist user to backend & localStorage
  const persistUser = async (userData) => {
    try {
      const res = await api.post('/auth/login', {
        name: userData.name,
        email: userData.email,
        picture: userData.picture || '',
        auth_method: userData.auth_method || 'manual',
        google_id: userData.google_id || '',
      });
      if (res.data.success) {
        const fullUser = { ...userData, ...res.data.user };
        setUser(fullUser);
        localStorage.setItem('adhd_auth_user', JSON.stringify(fullUser));
        return fullUser;
      }
    } catch (err) {
      console.error('Auth persist error:', err);
      // Still set locally even if backend is down
      setUser(userData);
      localStorage.setItem('adhd_auth_user', JSON.stringify(userData));
    }
    return userData;
  };

  // Manual login (name + email)
  const login = async (name, email) => {
    const userData = { name, email, auth_method: 'manual' };
    return await persistUser(userData);
  };

  // Google login — called with the credential response from GSI
  const loginWithGoogle = useCallback(async (credentialResponse) => {
    try {
      // Decode the JWT token from Google
      const token = credentialResponse.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));

      const userData = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture || '',
        auth_method: 'google',
        google_id: payload.sub,
      };

      return await persistUser(userData);
    } catch (err) {
      console.error('Google login error:', err);
      return null;
    }
  }, []);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts?.id?.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: loginWithGoogle,
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [loginWithGoogle]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adhd_auth_user');
    // Also revoke Google session if available
    window.google?.accounts?.id?.disableAutoSelect();
  };

  const renderGoogleButton = (elementRef) => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id) return;
    window.google.accounts.id.renderButton(elementRef, {
      theme: 'filled_black',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      width: '100%',
    });
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@neurosync.app';

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, loading, renderGoogleButton, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
