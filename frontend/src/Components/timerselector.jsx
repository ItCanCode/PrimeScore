import { useState, useEffect } from "react";

function TimerSelector({ eventData, setEventData }) {
  const [now, setNow] = useState(0);

  // Simulate "current time in minutes"
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(prev => prev + 1); // increase every minute
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setEventData({ ...eventData, time: e.target.value });
  };

  // Example: allow selection from 0 → 120 mins
  const options = [];
  for (let i = 0; i <= 120; i++) {
    const disabled = i < now - 10; // past by more than 10 mins
    options.push(
      <option key={i} value={i} disabled={disabled}>
        {i} min
      </option>
    );
  }

  return (
    <div className="mai-form-group">
      <label>Time (Minutes)</label>
      <select name="time" value={eventData.time} onChange={handleChange}>
        <option value="">Select time</option>
        {options}
      </select>
      <p style={{ fontSize: "12px", color: "gray" }}>
        Current time: {now} min
      </p>
    </div>
  );
}

export default TimerSelector;
