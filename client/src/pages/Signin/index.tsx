import { ChangeEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Component1Icon } from '@radix-ui/react-icons';
import { emailRegex } from '@/utils/constants/validationTokens';
import { toast } from 'sonner';
import { User, useAuth } from '@/contexts/auth';
import { httpClient } from '@/lib/httpClient';
import { normalizeError } from '@/utils/normalizeError';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isBtnDisabled = !email || !password;

  // email input change handler
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // password input change handler
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSignin = async () => {
    try {
      // let the user know, an http request is ongoing
      setIsLoading(true);

      // check if email satisfies the regex constraint
      const isValidEmail = emailRegex.test(email);

      if (!isValidEmail) {
        // if email not valid, show error and don't proceed
        toast.error('Email Address', {
          description: 'Please enter a valid email address',
        });
        return;
      }

      // no need to check for password requirements here. because password has already been set during sign up
      // and it can reveal information to users

      // if email valid, make api call to sign in
      const user = await httpClient.post<User>('/auth/signin', {
        data: {
          email,
          password,
        },
      });

      // after api call is successful, dispatch action to auth context with user as payload
      dispatch({ type: 'RESOLVED', payload: user });

      // if user is redirected from some page, redirect to that page after login
      const from = location.state?.from;
      navigate(from || '/', {
        replace: true,
      });
    } catch (error) {
      normalizeError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // if user is authenticated already, no need to be here
  if (isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  return (
    <>
      <div className='space-y-2' data-testid='signin-page'>
        <Component1Icon className='mx-auto h-6 w-6' />
        <h1 className='text-2xl font-semibold tracking-tight'>Welcome back</h1>
        <p className='text-sm text-muted-foreground'>
          Enter your credentials to sign in to your account
        </p>
      </div>

      <div className='grid gap-2'>
        <Input
          value={email}
          onChange={handleEmailChange}
          type='email'
          placeholder='name@example.com'
        />
        <Input
          value={password}
          onChange={handlePasswordChange}
          type='password'
          placeholder='password'
        />
        <Button
          onClick={handleSignin}
          disabled={isBtnDisabled}
          className='w-full'
        >
          {isLoading && <Component1Icon className='mr-2 animate-spin' />}
          Sign in
        </Button>
      </div>

      <Link to='/signup'>
        <Button
          variant='link'
          className='py-0 text-sm font-normal text-muted-foreground underline'
        >
          {"Don't have an account? Sign Up"}
        </Button>
      </Link>
    </>
  );
};

Signin.displayName = 'Signin';

export default Signin;
