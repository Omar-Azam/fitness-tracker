import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

// Helper to render Login with necessary providers
const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Login />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  it('renders login form elements correctly', () => {
    renderLogin();

    // Check title and labels
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByText(/email or username/i)).toBeInTheDocument();
    expect(screen.getByText(/^password$/i)).toBeInTheDocument();

    // Check inputs
    expect(screen.getByPlaceholderText(/e\.g\. alex or alex@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();

    // Check sign in button
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows a validation error when submitted with empty fields', async () => {
    renderLogin();

    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
    fireEvent.submit(form);

    // Form should display validation error
    expect(await screen.findByText(/please fill in all fields/i)).toBeInTheDocument();
  });

  it('updates form inputs when user types', () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/e\.g\. alex or alex@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);

    fireEvent.change(emailInput, { target: { value: 'testuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'SecretPassword123' } });

    expect(emailInput.value).toBe('testuser@example.com');
    expect(passwordInput.value).toBe('SecretPassword123');
  });
});
