import { AuthAction, User } from '@/contexts/auth';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { httpClient } from '@/lib/httpClient';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AvatarDropdownProps {
  user: User | null;
  dispatch: React.Dispatch<AuthAction>;
}

export const AvatarDropdown = ({ user, dispatch }: AvatarDropdownProps) => {
  const navigate = useNavigate();

  // logout click handler
  const handleLogoutClick = async () => {
    try {
      // make api call to clear cookies
      await httpClient.get('/auth/logout');
      // clear data from auth context
      dispatch({ type: 'LOG_OUT' });
      // navigate to auth page
      navigate('/signin', {
        replace: true,
      });
    } catch (error) {
      console.log({ error });
      toast.error(
        'There was some issue logging you out. Please try again later.',
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className='h-8 w-8 cursor-pointer'>
          <AvatarFallback>{user?.name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={handleLogoutClick}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
