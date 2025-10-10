/**
 * MatchClock Component - Real-time match timing system
 * 
 * This component provides live match clock functionality with:
 * - Real-time synchronization across all users via Firebase
 * - Local time counting for smooth UI updates
 * - Admin controls for start/pause/stop operations
 * - Sport-specific time limits and validation
 * 
 * Architecture:
 * - Firebase listeners for instant updates when admins change clock state
 * - Local intervals for smooth second-by-second counting
 * - Hybrid approach: real-time sync + local calculation for performance
 */
import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase.js";
import { doc, onSnapshot } from "firebase/firestore";

/**
 * MatchClock Component
 * @param {string} matchId - Unique identifier for the match
 * @param {string} status - Current match status (ongoing, finished, etc.)
 * @param {boolean} showControls - Whether to display admin control buttons
 * @param {string} sportType - Type of sport for time limit validation
 */
export default function MatchClock({ matchId, status, showControls = true, sportType = null }) {
  // State for local clock display and control
  const [seconds, setSeconds] = useState(0);        // Current elapsed time in seconds
  const [running, setRunning] = useState(false);    // Whether clock is currently running
  const [pausedReason, setPausedReason] = useState(""); // Reason for pause (injury, etc.)
  
  // Refs for cleanup and preventing memory leaks
  const intervalRef = useRef();     // Local timer for UI updates
  const pollIntervalRef = useRef(); // Backup polling (if needed)

  /**
   * Get sport-specific maximum duration in seconds
   * Prevents matches from running indefinitely
   * @param {string} sport - Sport type
   * @returns {number|null} Maximum duration in seconds, or null for no limit
   */
  const getMaxDuration = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'football': return 120 * 60; // 120 minutes (including extra time)
      case 'netball': return 60 * 60;   // 60 minutes (4 quarters × 15 min)
      case 'rugby': return 90 * 60;     // 90 minutes (including extra time)
      default: return null;             // No limit for other sports
    }
  };

  /**
   * Fetch current server state (initial load only)
   * Gets the current clock state from backend API
   * Used once when component mounts, then Firebase listeners take over
   */
  const fetchClock = async () => {
    try {
      const response = await fetch(`https://prime-backend.azurewebsites.net/api/match-clock/${matchId}`);
      const data = await response.json();
      
      // Update local state with server data
      setSeconds(Math.floor(data.elapsed));
      setRunning(data.running);
      setPausedReason(data.pausedReason || "");
    } catch (error) {
      console.error('Error fetching clock data:', error);
    }
  };

  /**
   * Main effect: Sets up real-time synchronization and cleanup
   * 
   * This effect handles:
   * 1. Initial data fetch from API
   * 2. Firebase real-time listener setup
   * 3. Cleanup when component unmounts
   */
  useEffect(() => {
    // Step 1: Get initial clock state from server
    fetchClock();
    
    // Step 2: Set up Firebase real-time listener for instant updates
    // This ensures all users see changes immediately when admins control the clock
    const clockDocRef = doc(db, 'matchClocks', matchId);
    const unsubscribe = onSnapshot(clockDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const clockData = docSnapshot.data();
        
        // Calculate current elapsed time from server data
        // Calculate live elapsed time if clock is running
        let currentElapsed = clockData.elapsed || 0;
        if (clockData.running && clockData.startTime) {
          // Add time since last start to accumulated elapsed time
          const startTimeMs = clockData.startTime.toDate().getTime();
          currentElapsed += (Date.now() - startTimeMs) / 1000;
        }
        
        // Sport-specific time limit validation
        const maxDuration = getMaxDuration(sportType);
        if (maxDuration && currentElapsed >= maxDuration && clockData.running) {
          // Auto-stop the clock when sport-specific time limit is reached
          finishClockWithReason(`Auto-stopped: ${sportType} match completed (${maxDuration / 60} minutes)`);
          return;
        }
        
        // Update local state with calculated values
        setSeconds(Math.floor(currentElapsed));
        setRunning(clockData.running || false);
        setPausedReason(clockData.pausedReason || "");
      }
    }, (error) => {
      console.error('Error listening to clock updates:', error);
      // Fallback to periodic polling if real-time listener fails
      // This ensures clock continues working even with poor internet
      pollIntervalRef.current = setInterval(fetchClock, 5000);
    });
    
    // Cleanup function: unsubscribe from Firebase and clear intervals
    return () => {
      unsubscribe();
      clearInterval(pollIntervalRef.current);
    };
  }, [matchId, sportType]); // Re-run when matchId or sportType changes

  /**
   * Local timer effect: Handles smooth UI updates
   * 
   * This creates the smooth second-by-second counting that users see
   * Only runs when clock is supposed to be running
   * Provides immediate visual feedback without waiting for server updates
   */
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          const newSeconds = s + 1;
          
          // Check if max duration is reached for this sport
          const maxDuration = getMaxDuration(sportType);
          if (maxDuration && newSeconds >= maxDuration) {
            // Auto-stop the clock
            finishClockWithReason(`Auto-stopped: ${sportType} match completed (${maxDuration / 60} minutes)`);
            return maxDuration; // Cap at max duration
          }
          
          return newSeconds;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(pollIntervalRef.current);
    };
  }, [running, sportType]);

  /**
   * Admin function: Start or resume match clock
   * Sends POST request to backend to update match state
   * Refreshes local state after successful server update
   */
  const startOrResume = async () => {
    try {
      await fetch(`https://prime-backend.azurewebsites.net/api/match-clock/${matchId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchClock(); // Refresh local state from server
    } catch (error) {
      console.error('Error starting/resuming clock:', error);
    }
  };

  /**
   * Admin function: Pause match clock with reason
   * Prompts admin for pause reason (required for audit trail)
   * Updates server state and refreshes local display
   */
  const pauseClock = async () => {
    const reason = prompt("Pause reason?");
    if (!reason) return; // Cancel if no reason provided
    
    try {
      await fetch(`https://prime-backend.azurewebsites.net/api/match-clock/${matchId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      fetchClock(); // Refresh local state from server
    } catch (error) {
      console.error('Error pausing clock:', error);
    }
  };

  /**
   * Admin function: Finish match clock with completion reason
   * Can be called manually by admin or automatically by timer
   * Records final time and reason in database for match history
   */
  const finishClockWithReason = async (reason = 'Match finished') => {
    try {
      await fetch(`https://prime-backend.azurewebsites.net/api/match-clock/${matchId}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      fetchClock(); // Refresh local state from server
    } catch (error) {
      console.error('Error finishing clock:', error);
    }
  };

  /**
   * Convenience wrapper for finishing clock with default reason
   * Used by manual finish button clicks
   */
  const finishClock = async () => {
    await finishClockWithReason('Match finished');
  };

  /**
   * Utility function: Format seconds into MM:SS display format
   * Pads single digits with leading zeros for consistent display
   */
  const format = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="match-clock-widget">
      <p className="time">{format(seconds)}</p>
      {pausedReason && !running && <p className="reason">Paused: {pausedReason}</p>}
      {status === "ongoing" && showControls && (
        <div className="controls">
          {running ? (
            <button onClick={pauseClock}>Pause</button>
          ) : (
            <button onClick={startOrResume}>Resume</button>
          )}
          <button onClick={finishClock}>Stop</button>
        </div>
      )}
    </div>
  );
}