import { useState, useEffect, createContext, useContext } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const savedToken = localStorage.getItem('auth_token');
        
        if (!savedToken) {
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        // Skip verification if we already have a user
        if (user && token === savedToken) {
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        // Verify token with backend
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Token invalide');
        }

        const data = await response.json();
        
        if (isMounted) {
          setUser(data.user);
          setToken(savedToken);
          setError(null);
        }

      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('auth_token');
        if (isMounted) {
          setUser(null);
          setToken(null);
          setError(null); // Don't show error for initial check
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []); // Remove user and token dependencies to prevent infinite loops

  // Login function
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setError(null);
    localStorage.setItem('auth_token', userToken);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('auth_token');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// HOC for protected routes
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return null; // This will be handled by the main App component
    }
    
    return <Component {...props} />;
  };
}

// Hook for API calls with auth
export function useAuthenticatedFetch() {
  const { token, logout } = useAuth();
  
  const authenticatedFetch = async (url, options = {}) => {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      },
      credentials: 'include'
    };
    
    try {
      const response = await fetch(url, config);
      
      // If unauthorized, logout user
      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
      
      return response;
    } catch (error) {
      console.error('Authenticated fetch error:', error);
      throw error;
    }
  };
  
  return authenticatedFetch;
}