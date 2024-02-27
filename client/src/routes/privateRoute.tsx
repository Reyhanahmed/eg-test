import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to='/signin' state={{ from: location.pathname }} />;
  }

  return children;
};

PrivateRoute.displayName = 'PrivateRoute';
