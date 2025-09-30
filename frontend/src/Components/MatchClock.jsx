// src/components/MatchClock.js
import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase.js";
import { doc, onSnapshot } from "firebase/firestore";

export default function MatchClock({ matchId, status, showControls = true, sportType = null }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [pausedReason, setPausedReason] = useState("");
  const intervalRef = useRef();
  const pollIntervalRef = useRef();

  // Get sport-specific maximum duration in seconds
  const getMaxDuration = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'football': return 120 * 60; // 120 minutes
      case 'netball': return 60 * 60;   // 60 minutes  
      case 'rugby': return 90 * 60;     // 90 minutes
      default: return null; // No limit for other sports
    }
  };

  // fetch current server state
  const fetchClock = async () => {
    try {
      const response = await fetch(`https://prime-backend.azurewebsites.net/api/match-clock/${matchId}`);
      const data = await response.json();
      setSeconds(Math.floor(data.elapsed));
      setRunning(data.running);
      setPausedReason(data.pausedReason || "");
    } catch (error) {
      console.error('Error fetching clock data:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchClock();
    
    // Set up Firebase real-time listener for instant updates
    const clockDocRef = doc(db, 'match_clocks', matchId);
    const unsubscribe = onSnapshot(clockDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const clockData = docSnapshot.data();
        
        // Calculate current elapsed time
        let currentElapsed = clockData.elapsed || 0;
        if (clockData.running && clockData.startTime) {
          const startTimeMs = clockData.startTime.toDate().getTime();
          currentElapsed += (Date.now() - startTimeMs) / 1000;
        }
        
        // Check if max duration is reached for this sport
        const maxDuration = getMaxDuration(sportType);
        if (maxDuration && currentElapsed >= maxDuration && clockData.running) {
          // Auto-stop the clock
          finishClockWithReason(`Auto-stopped: ${sportType} match completed (${maxDuration / 60} minutes)`);
          return;
        }
        
        setSeconds(Math.floor(currentElapsed));
        setRunning(clockData.running || false);
        setPausedReason(clockData.pausedReason || "");
      }
    }, (error) => {
      console.error('Error listening to clock updates:', error);
      // Fallback to periodic polling if real-time listener fails
      pollIntervalRef.current = setInterval(fetchClock, 5000);
    });
    
    return () => {
      unsubscribe();
      clearInterval(pollIntervalRef.current);
    };
  }, [matchId]);

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

  const startOrResume = async () => {
    try {
      await fetch(`https://prime-backend.azurewebsites.net/api/match-clock/${matchId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchClock();
    } catch (error) {
      console.error('Error starting/resuming clock:', error);
    }
  };

  const pauseClock = async () => {
    const reason = prompt("Pause reason?");
    if (!reason) return;
    try {
      await fetch(`https://prime-backend.azurewebsites.net/api/match-clock/${matchId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      fetchClock();
    } catch (error) {
      console.error('Error pausing clock:', error);
    }
  };

  const finishClockWithReason = async (reason = 'Match finished') => {
    try {
      await fetch(`https://prime-backend.azurewebsites.net/api/match-clock/${matchId}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      fetchClock();
    } catch (error) {
      console.error('Error finishing clock:', error);
    }
  };

  const finishClock = async () => {
    await finishClockWithReason('Match finished');
  };

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