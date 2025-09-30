// tests/Dashboard.test.jsx
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Dashboard from '../src/Pages/DashBoard.jsx';

describe('Dashboard Component', () => {
  test('renders the dashboard container', () => {
    render(<Dashboard />);
    // Look for the main container by class name
    const container = document.querySelector('.dashboard-container');
    expect(container).toBeInTheDocument();
  });

  test('renders welcome text', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Ready to catch up on today's action\?/i)
    ).toBeInTheDocument();
  });
});
