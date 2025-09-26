import "../Styles/MatchEvents.css";
import { useState } from "react";

function MatchEvents() {

  const [eventType, setEventType] = useState("goal");
  const [team, setTeam] = useState("home");
  const [player, setPlayer] = useState("");
  const [playerIn, setPlayerIn] = useState("");
  const [playerOut, setPlayerOut] = useState("");
  const [time, setTime] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const matchId = "9WiywRUkmwXChq4IGEQo"; 
    let updateData = { team, time: Number(time) };
    let endpoint = "";

    if (eventType === "goal") {
      updateData.player = player;
      endpoint = `/api/feed/${matchId}/goal`;
    } else if (eventType === "foul") {
      updateData.player = player;
      endpoint = `/api/feed/${matchId}/foul`;
    } else if (eventType === "substitution") {
      updateData.playerIn = playerIn;
      updateData.playerOut = playerOut;
      endpoint = `/api/feed/${matchId}/substitution`;
    }

    try {
      const res = await fetch(`https://prime-backend.azurewebsites.net/${endpoint}`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatusMsg("Event recorded successfully!");
      setPlayer("");
      setPlayerIn("");
      setPlayerOut("");
      setTime("");
    } catch (err) {
      console.error("Failed to record event", err);
      setStatusMsg("Failed to record event.");
    }
  }

  return (
    <section className="event-section">
      <h2>Add Match Event</h2>

      <form onSubmit={handleSubmit} className="form">
        
        <label htmlFor="eventType">Event Type</label>
        <select
          id="eventType"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        >
          <option value="goal">Goal</option>
          <option value="substitution">Substitution</option>
          <option value="foul">Foul</option>
        </select>

      
        <label htmlFor="team">Team</label>
        <select
          id="team"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        >
          <option value="home">Home</option>
          <option value="away">Away</option>
        </select>

        
        {(eventType === "goal" || eventType === "foul") && (
          <>
            <label htmlFor="player">Player</label>
            <input
              type="text"
              id="player"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              placeholder="Enter player name"
              required
            />
          </>
        )}
 
        {eventType === "substitution" && (
          <>
            <label htmlFor="playerIn">Player In</label>
            <input
              type="text"
              id="playerIn"
              value={playerIn}
              onChange={(e) => setPlayerIn(e.target.value)}
              placeholder="Enter player coming in"
              required
            />

            <label htmlFor="playerOut">Player Out</label>
            <input
              type="text"
              id="playerOut"
              value={playerOut}
              onChange={(e) => setPlayerOut(e.target.value)}
              placeholder="Enter player going out"
              required
            />
          </>
        )}

      
        <label htmlFor="time">Time (1-90)</label>
        <input
          type="number"
          id="time"
          value={time}
          min="1"
          max="120"
          onChange={(e) => setTime(e.target.value)}
          placeholder="65"
          required
        />

        <button type="submit" className="add-button">
          Add Event
        </button>
      </form>

      {statusMsg && <p>{statusMsg}</p>}
    </section>
  );
}

export default MatchEvents;
