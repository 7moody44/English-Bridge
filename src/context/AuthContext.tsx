import React, { createContext, useReducer, useCallback, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  register: (token: string, user: AuthUser) => void;
  clearError: () => void;
  setError: (error: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: AuthUser } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_SUCCESS'; payload: { token: string; user: AuthUser } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'RESTORE_TOKEN'; payload: { token: string; user: AuthUser } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_ERROR'; payload: string };

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'RESTORE_TOKEN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from LocalStorage on mount
  React.useEffect(() => {
    const restoreSession = () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          dispatch({
            type: 'RESTORE_TOKEN',
            payload: { token: storedToken, user },
          });
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // No session found, stop loading
        dispatch({
          type: 'LOGOUT',
        });
      }
    };

    restoreSession();
  }, []);

  const login = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { token, user },
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const register = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
    dispatch({
      type: 'REGISTER_SUCCESS',
      payload: { token, user },
    });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    register,
    clearError,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthContextProvider');
  }
  return context;
};
