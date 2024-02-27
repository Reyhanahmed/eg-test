import { Component1Icon } from '@radix-ui/react-icons';
import { ThemeToggle } from '../ThemeToggle';
import { useAuth } from '@/contexts/auth';
import { AvatarDropdown } from '../AvatarDropdown';

export const Header = () => {
  const { isAuthenticated, user, dispatch } = useAuth();

  return (
    <header className='container absolute left-0 top-0  w-full border-b border-border/40 bg-background/95'>
      <div className='flex h-14 max-w-screen-xl flex-1 items-center justify-between'>
        <div className='flex items-center justify-center gap-2'>
          <Component1Icon />
          <span className='font-bold'>eg-client</span>
        </div>

        <div className='flex items-center gap-2'>
          {isAuthenticated && (
            <AvatarDropdown dispatch={dispatch} user={user} />
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

Header.displayName = 'Header';
