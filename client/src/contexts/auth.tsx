import { httpClient } from '@/lib/httpClient';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

// the different statuses of api request
type ApiStatus = 'idle' | 'resolved' | 'rejected' | 'pending';

export interface User {
  email: string;
  name: string;
  id: string;
}

interface AuthState {
  status: ApiStatus;
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
}

interface AuthProviderValue extends AuthState {
  isLoading: boolean;
  isError: boolean;
  isIdle: boolean;
  isSuccess: boolean;
  dispatch: React.Dispatch<AuthAction>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// actions that the auth reducer accepts
export type AuthAction =
  | { type: 'STARTED' }
  | { type: 'RESOLVED'; payload: User }
  | { type: 'REJECTED'; payload: string }
  | { type: 'LOG_OUT' };

const initialState: AuthState = {
  status: 'idle',
  isAuthenticated: false,
  user: null,
  error: null,
};

const AuthContext = createContext<AuthProviderValue | undefined>(undefined);

const reducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'STARTED':
      return { ...state, status: 'pending' };
    // if request successful, add user
    case 'RESOLVED':
      return {
        ...state,
        status: 'resolved',
        user: action.payload,
        isAuthenticated: true,
      };
    // if request failed, then add error
    case 'REJECTED':
      return {
        ...state,
        status: 'rejected',
        error: action.payload,
        isAuthenticated: false,
      };
    // clean everything on log out
    case 'LOG_OUT':
      return {
        ...state,
        status: 'idle',
        isAuthenticated: false,
        error: null,
        user: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function fetchUser() {
      try {
        // request started
        dispatch({ type: 'STARTED' });

        // fetch the current logged in user
        const user = await httpClient.get<User>('/auth/me');

        // successful, add user to context
        dispatch({ type: 'RESOLVED', payload: user });
      } catch (error) {
        // failed, add error to context
        dispatch({
          type: 'REJECTED',
          payload: 'Please log in to access the app',
        });
      }
    }

    fetchUser();
  }, [dispatch]);

  const value = useMemo(
    () => ({
      ...state,
      isLoading: state.status === 'pending',
      isError: state.status === 'rejected',
      isIdle: state.status === 'idle',
      isSuccess: state.status === 'resolved',
      dispatch: dispatch,
    }),
    [state, dispatch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined)
    throw new Error('useAuth must be used within a AuthProvider');

  return context;
}
