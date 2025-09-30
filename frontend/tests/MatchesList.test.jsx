// tests/MatchesList.test.jsx
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import MatchesList from '../src/Components/MatchesList.jsx';

describe('MatchesList Component', () => {
  const mockMatches = [
    {
      id: '1',
      matchName: 'Match 1',
      sportType: 'Football',
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      startTime: '2025-10-01T15:00',
      venue: 'Stadium 1',
      status: 'scheduled'
    },
    {
      id: '2',
      matchName: 'Match 2',
      sportType: 'Basketball',
      homeTeam: 'Team C',
      awayTeam: 'Team D',
      startTime: '2025-10-02T18:00',
      venue: 'Stadium 2',
      status: 'ongoing'
    }
  ];

  const matchStats = {
    '2': { homeScore: 10, awayScore: 8 }
  };

  const matchEvents = {
    '2': [
      { id: 'e1', eventType: 'Goal', time: 5, player: 'Player 1', team: 'Team C' },
      { id: 'e2', card: 'yellow', time: 10, player: 'Player 2', team: 'Team D' }
    ]
  };

  const defaultProps = {
    filteredMatches: [],
    activeTab: 'upcoming',
    matchStats: {},
    matchEvents: {},
    formatDateTime: (dt) => dt,
    getStatusColor: () => 'blue',
    getStatusIcon: () => '✓',
    editMatch: jest.fn(),
    deleteMatch: jest.fn(),
    startMatch: jest.fn(),
    openEventForm: jest.fn(),
    updateMatchStatus: jest.fn()
  };

  test('renders no matches message', () => {
    render(<MatchesList {...defaultProps} />);
    expect(screen.getByText(/No upcoming matches found/i)).toBeInTheDocument();
  });

  test('renders match cards', () => {
    render(
      <MatchesList
        {...defaultProps}
        filteredMatches={mockMatches}
        matchStats={matchStats}
        matchEvents={matchEvents}
      />
    );

    // Match names
    expect(screen.getByText(/Match 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Match 2/i)).toBeInTheDocument();

    // Score shown for ongoing match
    expect(screen.getByText(/10 - 8/i)).toBeInTheDocument();

    // Event labels
    expect(screen.getByText(/Goal/i)).toBeInTheDocument();
    expect(screen.getByText(/Foul \(Yellow Card\)/i)).toBeInTheDocument();
  });

  test('calls callbacks on button clicks', () => {
    render(
      <MatchesList
        {...defaultProps}
        filteredMatches={[mockMatches[0]]}
      />
    );

    // Start Match button
    const startBtn = screen.getByText(/Start Match/i).closest('button');
    fireEvent.click(startBtn);
    expect(defaultProps.startMatch).toHaveBeenCalledWith(mockMatches[0]);
  });
});
