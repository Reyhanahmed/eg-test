import { Outlet } from 'react-router-dom';

import { Header } from '../../Header';
import { Container } from '../../Container';
import { useAuth } from '@/contexts/auth';
import { Loader } from '@/components/Loader';
import { Toaster } from 'sonner';

export const RootLayout = () => {
  const { isLoading } = useAuth();

  // if the user is still being fetched, show loader
  if (isLoading) {
    return <Loader />;
  }

  return (
    <Container>
      <Toaster closeButton position='bottom-right' />
      <Header />
      <Outlet />
    </Container>
  );
};
