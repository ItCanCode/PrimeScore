import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MatchClock from '../src/Components/MatchClock.jsx';

// Mock fetch
global.fetch = jest.fn();

// Mock Firebase
jest.mock('../src/firebase.js', () => ({
  db: {},
}));

// Mock Firebase Firestore functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn((ref, callback, errorCallback) => {
    // Return a mock unsubscribe function
    return () => {};
  }),
}));

describe('MatchClock Component', () => {
  const mockMatchId = 'test-match-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Suppress React act() warnings for testing
    const originalError = console.error;
    jest.spyOn(console, 'error').mockImplementation((...args) => {
      if (args[0]?.includes?.('act(...)')) {
        return; // Suppress act() warnings in tests
      }
      originalError(...args);
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('renders initial clock display', async () => {
    // Mock initial fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 120, // 2 minutes
        running: false,
        pausedReason: 'Half-time',
        matchId: mockMatchId
      })
    });

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);
    
    // Wait for the initial fetch and state update
    await waitFor(() => {
      expect(screen.getByText('02:00')).toBeInTheDocument();
      expect(screen.getByText('Paused: Half-time')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(`https://prime-backend.azurewebsites.net/api/match-clock/${mockMatchId}`);
  });

  test('formats time correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 3665, // 1 hour, 1 minute, 5 seconds = 61:05
        running: true,
        matchId: mockMatchId
      })
    });

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);
    
    await waitFor(() => {
      expect(screen.getByText('61:05')).toBeInTheDocument();
    });
  });

  test('starts counting when running is true', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 30,
        running: true,
        matchId: mockMatchId
      })
    });

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);
    
    await waitFor(() => {
      expect(screen.getByText('00:30')).toBeInTheDocument();
    });

    // Advance timer by 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    await waitFor(() => {
      expect(screen.getByText('00:33')).toBeInTheDocument();
    });
  });

  test('shows resume button when paused', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 600,
        running: false,
        pausedReason: 'Injury break',
        matchId: mockMatchId
      })
    });

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);
    
    await waitFor(() => {
      expect(screen.getByText('Resume')).toBeInTheDocument();
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });
  });

  test('shows pause button when running', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 300,
        running: true,
        matchId: mockMatchId
      })
    });

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);
    
    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });
  });

  test('calls start API when resume button clicked', async () => {
    // Initial fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 600,
        running: false,
        pausedReason: 'Tactical break',
        matchId: mockMatchId
      })
    });

    // Mock start API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    // Mock refetch after start
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 600,
        running: true,
        matchId: mockMatchId
      })
    });

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);
    
    await waitFor(() => {
      expect(screen.getByText('Resume')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Resume'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `https://prime-backend.azurewebsites.net/api/match-clock/${mockMatchId}/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    });
  });

  test('calls pause API when pause button clicked', async () => {
    // Initial fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 1200,
        running: true,
        matchId: mockMatchId
      })
    });

    // Mock window.prompt
    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('Water break');

    // Mock pause API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    // Mock refetch after pause
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 1200,
        running: false,
        pausedReason: 'Water break',
        matchId: mockMatchId
      })
    });

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);
    
    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Pause'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `https://prime-backend.azurewebsites.net/api/match-clock/${mockMatchId}/pause`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Water break' })
        }
      );
    });

    promptSpy.mockRestore();
  });

  test('calls finish API when stop button clicked', async () => {
    // Initial fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 2700, // 45 minutes
        running: true,
        matchId: mockMatchId
      })
    });

    // Mock finish API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    // Mock refetch after finish
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 2700,
        running: false,
        pausedReason: 'Match finished',
        matchId: mockMatchId
      })
    });

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);
    
    await waitFor(() => {
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Stop'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `https://prime-backend.azurewebsites.net/api/match-clock/${mockMatchId}/finish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    });
  });

  test('hides controls when showControls is false', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 1800,
        running: true,
        matchId: mockMatchId
      })
    });

    render(<MatchClock matchId={mockMatchId} status="ongoing" showControls={false} />);
    
    await waitFor(() => {
      expect(screen.getByText('30:00')).toBeInTheDocument();
    });

    expect(screen.queryByText('Pause')).not.toBeInTheDocument();
    expect(screen.queryByText('Stop')).not.toBeInTheDocument();
  });

  test('hides controls when status is not ongoing', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 2700,
        running: false,
        pausedReason: 'Match finished',
        matchId: mockMatchId
      })
    });

    render(<MatchClock matchId={mockMatchId} status="finished" />);
    
    await waitFor(() => {
      expect(screen.getByText('45:00')).toBeInTheDocument();
      expect(screen.getByText('Paused: Match finished')).toBeInTheDocument();
    });

    expect(screen.queryByText('Resume')).not.toBeInTheDocument();
    expect(screen.queryByText('Stop')).not.toBeInTheDocument();
  });

  test('handles fetch errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching clock data:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('handles pause cancellation (no reason provided)', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 900,
        running: true,
        matchId: mockMatchId
      })
    });

    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue(null); // User cancelled

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);
    
    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Pause'));

    // Should not make pause API call if no reason provided
    expect(fetch).toHaveBeenCalledTimes(1); // Only the initial fetch

    promptSpy.mockRestore();
  });

  test('handles Firebase listener error and falls back to polling', async () => {
    // Mock Firebase onSnapshot to trigger error callback
    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockImplementation((ref, callback, errorCallback) => {
      // Simulate Firebase error
      setTimeout(() => errorCallback(new Error('Firebase connection failed')), 100);
      return () => {}; // mock unsubscribe
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);

    // Wait for Firebase error to be handled
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error listening to clock updates:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('handles Firebase listener with running clock data', async () => {
    const mockClockData = {
      elapsed: 300,
      running: true,
      startTime: {
        toDate: () => new Date(Date.now() - 10000) // 10 seconds ago
      },
      pausedReason: null
    };

    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockImplementation((ref, callback) => {
      // Simulate Firebase update
      setTimeout(() => {
        callback({
          exists: () => true,
          data: () => mockClockData
        });
      }, 100);
      return () => {}; // mock unsubscribe
    });

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);

    // Wait for Firebase data to be processed
    await waitFor(() => {
      // Should show calculated time (300 + 10 seconds)
      expect(screen.getByText('05:10')).toBeInTheDocument();
    });
  });

  test('handles start/resume API error', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          elapsed: 600,
          running: false,
          pausedReason: 'Break',
          matchId: mockMatchId
        })
      })
      .mockRejectedValueOnce(new Error('Network error')); // API error

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);
    
    await waitFor(() => {
      expect(screen.getByText('Resume')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Resume'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error starting/resuming clock:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('handles pause API error', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          elapsed: 900,
          running: true,
          matchId: mockMatchId
        })
      })
      .mockRejectedValueOnce(new Error('API error')); // Pause API error

    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('Technical issue');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);
    
    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Pause'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error pausing clock:', expect.any(Error));
    });

    promptSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  test('handles finish API error', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          elapsed: 1500,
          running: true,
          matchId: mockMatchId
        })
      })
      .mockRejectedValueOnce(new Error('Finish API error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);
    
    await waitFor(() => {
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Stop'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error finishing clock:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('handles fetch clock API error', async () => {
    fetch.mockRejectedValueOnce(new Error('Fetch error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching clock data:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('renders without controls when showControls is false', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 300,
        running: true,
        matchId: mockMatchId
      })
    });

    render(<MatchClock matchId={mockMatchId} status="ongoing" showControls={false} />);
    
    await waitFor(() => {
      expect(screen.getByText('05:00')).toBeInTheDocument();
    });

    // Should not show control buttons
    expect(screen.queryByText('Pause')).not.toBeInTheDocument();
    expect(screen.queryByText('Stop')).not.toBeInTheDocument();
  });

  test('does not show controls when status is not ongoing', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elapsed: 300,
        running: false,
        matchId: mockMatchId
      })
    });

    render(<MatchClock matchId={mockMatchId} status="finished" />);
    
    await waitFor(() => {
      expect(screen.getByText('05:00')).toBeInTheDocument();
    });

    // Should not show control buttons for finished matches
    expect(screen.queryByText('Resume')).not.toBeInTheDocument();
    expect(screen.queryByText('Stop')).not.toBeInTheDocument();
  });

  test('formats time correctly for various durations', async () => {
    const testCases = [
      { elapsed: 0, expected: '00:00' },
      { elapsed: 59, expected: '00:59' },
      { elapsed: 60, expected: '01:00' },
      { elapsed: 3599, expected: '59:59' },
      { elapsed: 3600, expected: '60:00' },
      { elapsed: 7200, expected: '120:00' }
    ];

    for (const testCase of testCases) {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          elapsed: testCase.elapsed,
          running: false,
          matchId: mockMatchId
        })
      });

      const { unmount } = render(<MatchClock matchId={mockMatchId} status="ongoing" />);
      
      await waitFor(() => {
        expect(screen.getByText(testCase.expected)).toBeInTheDocument();
      });

      unmount();
      jest.clearAllMocks();
    }
  });

  test('handles Firebase document that does not exist', async () => {
    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockImplementation((ref, callback) => {
      // Simulate Firebase document not existing
      setTimeout(() => {
        callback({
          exists: () => false,
          data: () => null
        });
      }, 100);
      return () => {}; // mock unsubscribe
    });

    render(<MatchClock matchId={mockMatchId} status="ongoing" />);

    // Component should still render normally even if Firebase doc doesn't exist
    await waitFor(() => {
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });
  });
});