import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, clearTokens, setTokens } from '@/services/api';
import { logout } from '@/services/authService';

export const DEMO_USER = {
  id: 'usr-demo-alex',
  email: 'alex.johnson@example.edu',
  full_name: 'Alex Johnson',
  role: 'student',
  profile_completed: true,
  preferred_domain: 'AI / ML',
  target_career: 'AI & Machine Learning Engineering',
  education_level: 'Undergraduate',
  graduation_year: 2026,
  projects_completed: 4,
  certifications_count: 2,
  skills: [
    {
      category: 'Programming',
      skills: [
        { name: 'Python', level: 82 },
        { name: 'SQL', level: 61 },
        { name: 'Git', level: 75 },
      ]
    },
    {
      category: 'AI / ML',
      skills: [
        { name: 'Machine Learning', level: 42 },
        { name: 'Statistics', level: 48 },
        { name: 'Power BI', level: 68 },
      ]
    }
  ],
};

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any | null;
  backendError: string | null;
  checkAuth: () => Promise<void>;
  loginUser: (accessToken: string, refreshToken: string, userDetails?: any) => void;
  logoutUser: () => Promise<void>;
  startDemoSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  const checkAuth = async () => {
    // Check if demo session is active
    if (localStorage.getItem('cc_demo_session') === 'true') {
      setUser(DEMO_USER);
      setIsAuthenticated(true);
      setBackendError(null);
      setLoading(false);
      return;
    }

    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setBackendError(null);
      setLoading(false);
      return;
    }

    try {
      // Validate token against backend /api/profile route WITHOUT fallback
      const profile = await api('/api/profile', { auth: true });
      setUser(profile);
      setIsAuthenticated(true);
      setBackendError(null);
    } catch (err: any) {
      console.error('Session validation failed:', err);
      if (err.status === 401) {
        // 401 response = invalid/expired session -> clear tokens -> redirect to /login
        clearTokens();
        setIsAuthenticated(false);
        setUser(null);
        setBackendError(null);
      } else {
        // Backend/network is unavailable
        setIsAuthenticated(false);
        setUser(null);
        setBackendError('Backend server is unreachable. Please ensure your backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const startDemoSession = () => {
    localStorage.setItem('cc_demo_session', 'true');
    setUser(DEMO_USER);
    setIsAuthenticated(true);
    setBackendError(null);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loginUser = (accessToken: string, refreshToken: string, userDetails?: any) => {
    setTokens(accessToken, refreshToken);
    setIsAuthenticated(true);
    setBackendError(null);
    if (userDetails) {
      setUser(userDetails);
    } else {
      checkAuth();
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      localStorage.removeItem('cc_demo_session');
      clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      setBackendError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        backendError,
        checkAuth,
        loginUser,
        logoutUser,
        startDemoSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
