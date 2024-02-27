import { Outlet } from 'react-router-dom';

export const PageLayout = () => {
  return (
    <div className='grid h-full w-full place-items-center'>
      <div className='mx-auto flex w-full flex-col space-y-6 text-center sm:max-w-[350px]'>
        <Outlet />
      </div>
    </div>
  );
};
