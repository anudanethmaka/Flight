import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Decode a JWT without a library and check if it's expired
function isTokenValid(token) {
  try {
    const base64 = token
      .split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    // exp is in seconds; Date.now() is in milliseconds
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function normalizeUser(userData) {
  if (!userData) return null;
  return {
    id: userData.id || userData._id,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    role: userData.role,
    isActive: userData.isActive,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('token');

    if (!token || !isTokenValid(token)) {
      clearStoredAuth();
      setAuthLoading(false);
      return undefined;
    }

    api.get('/auth/me', { skipAuthRedirect: true })
      .then(({ data }) => {
        if (cancelled) return;
        const currentUser = normalizeUser(data);
        localStorage.setItem('user', JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch(() => {
        if (cancelled) return;
        clearStoredAuth();
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = (token, userData) => {
    const currentUser = normalizeUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(currentUser));
    setUser(currentUser);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
