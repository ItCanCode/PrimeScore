// src/components/MatchClock.js
import { useEffect, useState, useRef } from "react";

export default function MatchClock({ matchId, status }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [pausedReason, setPausedReason] = useState("");
  const intervalRef = useRef();

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
    fetchClock();
  }, [matchId]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

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

  const finishClock = async () => {
    try {
      await fetch(`https://prime-backend.azurewebsites.net/api/match-clock/${matchId}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchClock();
    } catch (error) {
      console.error('Error finishing clock:', error);
    }
  };

  const format = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="match-clock-widget">
      <p className="time">{format(seconds)}</p>
      {pausedReason && !running && <p className="reason">Paused: {pausedReason}</p>}
      {status === "ongoing" && (
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