import { type ReactNode } from 'react';

export const Container = ({ children }: { children: ReactNode }) => {
  return (
    <div className='container relative mx-auto h-full w-full max-w-screen-xl bg-background'>
      {children}
    </div>
  );
};

Container.displayName = 'Container';
