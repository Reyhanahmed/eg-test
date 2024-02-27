import { screen, render, fireEvent } from '@testing-library/react';
import { BrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import Signup from '.';

function renderComponent() {
  return render(
    <BrowserRouter>
      <Signup />
    </BrowserRouter>,
  );
}

describe('<Signup />', () => {
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
    expect(screen.getByTestId('signup-page')).toBeInTheDocument();
  });

  it('should redirect to home if user is authenticated', () => {
    // change useAuth implementation to test redirect
    (useAuth as jest.Mock).mockImplementationOnce(() => ({
      dispatch: jest.fn(),
      isAuthenticated: true,
    }));

    (Navigate as jest.Mock).mockImplementationOnce(() => <div>navigate</div>);
    renderComponent();

    expect(screen.getByText('navigate')).toBeInTheDocument();
  });

  it('should disable button if any of the field is empty', () => {
    renderComponent();

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const submitBtn = screen.getByText('Sign up');

    // simulate email input
    fireEvent.change(emailInput, {
      target: {
        value: 'abc@abc.com',
      },
    });

    // since password field is empty, sign in button should be disabled
    expect(submitBtn).toBeDisabled();
  });

  it('should show error if email is invalid', () => {
    renderComponent();

    // get all the constructs from the page
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const nameInput = screen.getByPlaceholderText('name');
    const confirmPassInput = screen.getByPlaceholderText('confirm password');
    const passwordInput = screen.getByPlaceholderText('password');
    const submitBtn = screen.getByText('Sign up');

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

    // simulate confirm password change
    fireEvent.change(confirmPassInput, {
      target: {
        value: 'abcdef123!',
      },
    });

    // simulate name change
    fireEvent.change(nameInput, {
      target: {
        value: 'somename!',
      },
    });

    // simulate sign up button click
    fireEvent.click(submitBtn);

    // since the email address is not valid it should show error related to email address
    expect(toast.error).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Email Address', {
      description: 'Please enter a valid email address',
    });
  });

  it('should show error if password does not meet requirements', () => {
    renderComponent();

    // get all the constructs from the page
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const nameInput = screen.getByPlaceholderText('name');
    const confirmPassInput = screen.getByPlaceholderText('confirm password');
    const passwordInput = screen.getByPlaceholderText('password');
    const submitBtn = screen.getByText('Sign up');

    // simulate email change
    fireEvent.change(emailInput, {
      target: {
        value: 'test@test.com',
      },
    });

    // simulate password change
    fireEvent.change(passwordInput, {
      target: {
        value: 'abcdef123',
      },
    });

    // simulate confirm password change
    fireEvent.change(confirmPassInput, {
      target: {
        value: 'abcdef123',
      },
    });

    // simuate name change
    fireEvent.change(nameInput, {
      target: {
        value: 'somename!',
      },
    });

    // simulate sign up button click
    fireEvent.click(submitBtn);

    // since password does not match requirements, it should throw error
    expect(toast.error).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Password', {
      description:
        'Password must be 8 characters long with atleast 1 letter, 1 number, and 1 special character',
    });
  });

  it('should show error if password and confirm password does not match', () => {
    renderComponent();

    // get all the constructs from page
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const nameInput = screen.getByPlaceholderText('name');
    const confirmPassInput = screen.getByPlaceholderText('confirm password');
    const passwordInput = screen.getByPlaceholderText('password');
    const submitBtn = screen.getByText('Sign up');

    // simuate email change
    fireEvent.change(emailInput, {
      target: {
        value: 'abc@abc.com',
      },
    });

    // simulate password change
    fireEvent.change(passwordInput, {
      target: {
        value: 'other',
      },
    });

    // simulate confirm password change
    fireEvent.change(confirmPassInput, {
      target: {
        value: 'another',
      },
    });

    // simulate name change
    fireEvent.change(nameInput, {
      target: {
        value: 'somename!',
      },
    });

    // click signup button
    fireEvent.click(submitBtn);

    // since password and confirm password do not match, should throw error
    expect(toast.error).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Password', {
      description: 'Passwords do not match',
    });
  });
});
