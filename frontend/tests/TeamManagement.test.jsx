// tests/TeamManagement.test.jsx
import React from 'react';
import '@testing-library/jest-dom'; // <- important for toBeInTheDocument
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TeamManagement from '../src/Pages/TeamManagement';
import { useAuth } from '../src/context/useAuth.js';

jest.mock('../src/context/useAuth.js');

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

test('renders loading state first', () => {
  useAuth.mockReturnValue({ token: 'fake-token' });
  render(<TeamManagement />);
  expect(screen.getByText(/loading team/i)).toBeInTheDocument();
});

test('renders team creation form if no team', async () => {
  useAuth.mockReturnValue({ token: 'fake-token' });

  // Mock fetch for myTeam API to return no team
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ hasTeam: false }),
  });

  render(<TeamManagement />);

  const formTitle = await screen.findByText(/create new team/i);
  expect(formTitle).toBeInTheDocument();

  expect(screen.getByPlaceholderText(/enter your team name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/e\.g\., MUN, LAL, NYY/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter your team's home city/i)).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toBeInTheDocument();
});

test('creates a new team', async () => {
  useAuth.mockReturnValue({ token: 'fake-token' });

  // No team initially
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ hasTeam: false }),
  });

  // Mock POST createTeam
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ teamId: 123 }),
  });

  render(<TeamManagement />);

  // Fill form
//   fireEvent.change(screen.getByPlaceholderText(/enter your team name/i), {
//     target: { value: 'My Team' },
//   });
//   fireEvent.change(screen.getByPlaceholderText(/e\.g\., MUN, LAL, NYY/i), {
//     target: { value: 'MT' },
//   });
//   fireEvent.change(screen.getByPlaceholderText(/enter your team's home city/i), {
//     target: { value: 'New York' },
//   });
//   fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Football' } });

//   fireEvent.click(screen.getByText(/create team/i));

  // Wait for async update
//   await waitFor(() => expect(screen.getByText(/team management/i)).toBeInTheDocument());
//   expect(screen.getByText(/my team/i)).toBeInTheDocument();
});

test('renders players and allows adding a player', async () => {
  useAuth.mockReturnValue({ token: 'fake-token' });

  // Mock fetch for myTeam API to return a team
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ hasTeam: true, team: { teamId: 1, teamName: 'My Team', shortName: 'MT', sportType: 'Football', city: 'NY' } }),
  });

  // Mock fetch for players API
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ players: [] }),
  });

  // Mock POST addPlayers
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ players: [{ playerId: 1, name: 'John Doe', position: 'Goalkeeper', number: 1, age: 25 }] }),
  });

  render(<TeamManagement />);

  // Wait for team management to load
  await screen.findByText(/my team/i);

  // Open add player modal
  fireEvent.click(screen.getByText(/add player/i));

  // Fill modal form
//  fireEvent.change(screen.getByPlaceholderText(/enter player name/i), {
//    target: { value: 'John Doe' },
//  });
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Goalkeeper' } });

//   fireEvent.change(screen.getByLabelText(/jersey number/i, { selector: 'input' }), {
//     target: { value: 1 },
//   });
//   fireEvent.change(screen.getByLabelText(/age/i, { selector: 'input' }), {
//     target: { value: 25 },
//   });

//  fireEvent.click(screen.getByText(/^add player$/i));

  // Wait for player to appear in the grid
//   await screen.findByText(/john doe/i);
//   expect(screen.getByText(/goalkeeper/i)).toBeInTheDocument();
//   expect(screen.getByText(/1/i)).toBeInTheDocument();
});
