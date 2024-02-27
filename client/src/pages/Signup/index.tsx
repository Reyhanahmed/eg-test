import { ChangeEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Component1Icon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import DOMPurify from 'isomorphic-dompurify';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { httpClient } from '@/lib/httpClient';
import { User, useAuth } from '@/contexts/auth';
import { emailRegex, passwordRegex } from '@/utils/constants/validationTokens';
import { normalizeError } from '@/utils/normalizeError';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // disable sign up button if any of the fields are empty
  const isBtnDisabled = !email || !name || !password || !confirmPassword;

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  // submit data for sign up
  const handleSignup = async () => {
    try {
      setIsLoading(true);

      const isValidEmail = emailRegex.test(email);

      const isValidPassword = passwordRegex.test(password);

      const isPasswordMatching = password === confirmPassword;

      if (!isValidEmail) {
        toast.error('Email Address', {
          description: 'Please enter a valid email address',
        });
      }

      if (!isValidPassword) {
        toast.error('Password', {
          description:
            'Password must be 8 characters long with atleast 1 letter, 1 number, and 1 special character',
        });
      }

      if (!isPasswordMatching) {
        toast.error('Password', {
          description: 'Passwords do not match',
        });
      }

      // if either email is invalid, or password is invalid, or passwords do not match, don't proceed
      if (!isValidEmail || !isValidPassword || !isPasswordMatching) {
        return;
      }

      // call the api to submit signup data
      const user = await httpClient.post<User>('/auth/signup', {
        data: {
          name: DOMPurify.sanitize(name),
          email,
          password,
        },
      });

      // if signup successful, dispatch action to auth context to add user
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

  // if user is already authenticated, no need to visit this page
  // redirect to home page
  if (isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  return (
    <>
      <div className='space-y-2' data-testid='signup-page'>
        <Component1Icon className='mx-auto h-6 w-6' />
        <h1 className='text-2xl font-semibold tracking-tight'>
          Create an account
        </h1>
        <p className='text-sm text-muted-foreground'>
          Enter your credentials to create your account
        </p>
      </div>

      <div className='grid gap-2'>
        <Input
          value={email}
          onChange={handleEmailChange}
          type='email'
          placeholder='name@example.com'
        />
        <Input value={name} onChange={handleNameChange} placeholder='name' />
        <Input
          value={password}
          onChange={handlePasswordChange}
          type='password'
          placeholder='password'
        />
        <Input
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          type='password'
          placeholder='confirm password'
        />
        <Button
          disabled={isBtnDisabled || isLoading}
          className='w-full'
          onClick={handleSignup}
        >
          {isLoading && <Component1Icon className='mr-2 animate-spin' />}
          Sign up
        </Button>
      </div>

      <Link to='/signin'>
        <Button
          variant='link'
          className='py-0 text-sm font-normal text-muted-foreground underline'
        >
          {'Already have an account? Sign In'}
        </Button>
      </Link>
    </>
  );
};

Signup.displayName = 'Signup';

export default Signup;
