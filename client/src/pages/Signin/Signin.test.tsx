import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import Signin from '.';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { httpClient } from '@/lib/httpClient';

// utility to render component
function renderComponent() {
  return render(
    <BrowserRouter>
      <Signin />
    </BrowserRouter>,
  );
}

describe('<Signin />', () => {
  const dispatchMock = jest.fn();
  beforeAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // default implementation for useAuth to be used throughout the app
    (useAuth as jest.Mock).mockImplementation(() => ({
      dispatch: dispatchMock,
      isAuthenticated: false,
    }));
  });

  it('should render', () => {
    renderComponent();
    // check if sign in page is rendered in JSDOM
    expect(screen.getByTestId('signin-page')).toBeInTheDocument();
  });

  it('should redirect to home if user is authenticated', () => {
    // change useAuth implementation to test redirect
    (useAuth as jest.Mock).mockImplementationOnce(() => ({
      dispatch: jest.fn(),
      isAuthenticated: true,
    }));

    // mock Navigate component
    (Navigate as jest.Mock).mockImplementationOnce(() => <div>navigate</div>);
    renderComponent();

    expect(screen.getByText('navigate')).toBeInTheDocument();
  });

  it('should disable button if any of the field is empty', () => {
    renderComponent();

    // get constructs from page.
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const submitBtn = screen.getByText('Sign in');

    // simulate email input
    fireEvent.change(emailInput, {
      target: {
        value: 'abc@abc.com',
      },
    });

    // if any of the field is empty, button will be disabled
    expect(submitBtn).toBeDisabled();
  });

  it('should show error if email is invalid', () => {
    renderComponent();

    // get all the constructs
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('password');
    const submitBtn = screen.getByText('Sign in');

    // simulate email change
    fireEvent.change(emailInput, {
      target: {
        value: 'abc',
      },
    });

    // simulate password change
    fireEvent.change(passwordInput, {
      target: {
        value: 'abcdef123!',
      },
    });

    fireEvent.click(submitBtn);

    // it will show error since email is invalid
    expect(toast.error).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Email Address', {
      description: 'Please enter a valid email address',
    });
  });

  it('should store user and navigate to home on successful sign in', async () => {
    const navigateMock = jest.fn();
    // change api call implementation and mock to see later if it is called
    (httpClient.post as jest.Mock).mockImplementation(() => ({
      id: '123',
      name: 'somename',
      email: 'test@test.com',
    }));
    (useNavigate as jest.Mock).mockImplementation(() => navigateMock);
    renderComponent();

    // get all the constructs from the page
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('password');
    const submitBtn = screen.getByText('Sign in');

    // simulate email change
    fireEvent.change(emailInput, {
      target: {
        value: 'abc@abc.com',
      },
    });

    // simulate password change
    fireEvent.change(passwordInput, {
      target: {
        value: 'abcdef123!',
      },
    });

    // simulate button click
    fireEvent.click(submitBtn);

    // the api call should be made
    expect(httpClient.post).toHaveBeenCalled();
    expect(httpClient.post).toHaveBeenCalledWith('/auth/signin', {
      data: {
        email: 'abc@abc.com',
        password: 'abcdef123!',
      },
    });

    // wait for API call to return, and then check if user is navigated.
    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });
  });
});
