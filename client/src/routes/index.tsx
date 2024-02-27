import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes as RoutesGroup } from 'react-router-dom';
import { RootLayout } from '@/components/layouts/RootLayout';
import { PageLayout } from '@/components/layouts/PageLayout';
import { Loader } from '@/components/Loader';
import { PrivateRoute } from './privateRoute';
import { NotFound } from '@/pages/NotFound';

const Signin = React.lazy(() => import('../pages/Signin'));
const Signup = React.lazy(() => import('../pages/Signup'));
const Home = React.lazy(() => import('../pages/Home'));

export const Routes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <RoutesGroup>
          <Route element={<RootLayout />}>
            <Route element={<PageLayout />}>
              <Route index path='/signin' element={<Signin />} />
              <Route path='/signup' element={<Signup />} />
              <Route
                path='/'
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route path='*' element={<NotFound />} />
            </Route>
          </Route>
        </RoutesGroup>
      </Suspense>
    </BrowserRouter>
  );
};
