import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <>
      <h1>Sorry! This route does not exist</h1>
      <Link replace to='/'>
        <Button>Back to home</Button>
      </Link>
    </>
  );
};
