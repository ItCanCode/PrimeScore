import { useState } from "react";

function MatchEvents({ matchId }) {
  const [eventType, setEventType] = useState("goal");
  const [team, setTeam] = useState("home");
  const [player, setPlayer] = useState("");       // goal/foul
  const [playerIn, setPlayerIn] = useState("");   // substitution
  const [playerOut, setPlayerOut] = useState(""); // substitution
  const [time, setTime] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = { team, time: Number(time) };
    if (eventType === "goal" || eventType === "foul") payload.player = player;
    if (eventType === "substitution") {
      payload.playerIn = playerIn;
      payload.playerOut = playerOut;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/feed/${matchId}/${eventType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");
      setStatusMsg(`${eventType} recorded successfully.`);
      // reset fields
      setPlayer(""); setPlayerIn(""); setPlayerOut(""); setTime("");
    } catch {
      setStatusMsg("Failed to record event.");
    }
  }

  return (
    <section aria-labelledby="add-event-heading">
      <header>
        <h2 id="add-event-heading">Add Match Event</h2>
      </header>

      <form onSubmit={handleSubmit}>
        {/* Event details */}
        <fieldset>
          <legend>Event details</legend>

          <div>
            <label htmlFor="event-type">Event type</label>
            <select
              id="event-type"
              name="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              required
            >
              <option value="goal">Goal</option>
              <option value="substitution">Substitution</option>
              <option value="foul">Foul</option>
            </select>
          </div>

          <div>
            <label htmlFor="team">Team</label>
            <select
              id="team"
              name="team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              required
            >
              <option value="home">Home</option>
              <option value="away">Away</option>
            </select>
          </div>

          <div>
            <label htmlFor="minute">Minute</label>
            <input
              id="minute"
              name="minute"
              type="number"
              inputMode="numeric"
              min={1}
              max={90}
              step={1}
              placeholder="e.g., 65"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              aria-describedby="minute-help"
            />
            <p id="minute-help">Enter a minute between 1 and 90.</p>
          </div>
        </fieldset>

        {/* Event-specific fields */}
        {eventType === "goal" && (
          <fieldset>
            <legend>Goal</legend>
            <div>
              <label htmlFor="goal-player">Player name</label>
              <input
                id="goal-player"
                name="goalPlayer"
                type="text"
                placeholder="Goal scorer"
                value={player}
                onChange={(e) => setPlayer(e.target.value)}
                required
              />
            </div>
          </fieldset>
        )}

        {eventType === "foul" && (
          <fieldset>
            <legend>Foul</legend>
            <div>
              <label htmlFor="foul-player">Player name</label>
              <input
                id="foul-player"
                name="foulPlayer"
                type="text"
                placeholder="Player committing foul"
                value={player}
                onChange={(e) => setPlayer(e.target.value)}
                required
              />
            </div>
          </fieldset>
        )}

        {eventType === "substitution" && (
          <fieldset>
            <legend>Substitution</legend>
            <div>
              <label htmlFor="player-in">Player in</label>
              <input
                id="player-in"
                name="playerIn"
                type="text"
                placeholder="Incoming player"
                value={playerIn}
                onChange={(e) => setPlayerIn(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="player-out">Player out</label>
              <input
                id="player-out"
                name="playerOut"
                type="text"
                placeholder="Outgoing player"
                value={playerOut}
                onChange={(e) => setPlayerOut(e.target.value)}
                required
              />
            </div>
          </fieldset>
        )}

        <div>
          <button type="submit">Add event</button>
        </div>

        {/* Live status region for screen readers */}
        <p role="status" aria-live="polite">{statusMsg}</p>
      </form>
    </section>
  );
}

export default MatchEvents;
