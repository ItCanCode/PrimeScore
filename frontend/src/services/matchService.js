// services/matchService.js

export const addMatchEventService = async (selectedMatch, eventData) => {
  let endpoint = "";
  let payload = { 
    team: eventData.team, 
    time: eventData.time, 
    eventType: eventData.eventType 
  };

  if (eventData.eventType === "Goal" || eventData.eventType === "Foul") {
    payload.player = eventData.player;
    endpoint = `/api/feed/${selectedMatch.id}/${eventData.eventType.toLowerCase()}`;
  } 
  else if (eventData.eventType === "Substitution") {
    payload.playerIn = eventData.playerIn;
    payload.playerOut = eventData.playerOut;
    endpoint = `/api/feed/${selectedMatch.id}/substitution`;
  }
  else if (eventData.eventType === "Yellow Card") {
    payload.player = eventData.player;
    payload.card = "yellow";
    endpoint = `/api/feed/${selectedMatch.id}/foul`;
  } 
  else if (eventData.eventType === "Red Card") {
    payload.player = eventData.player;
    payload.card = "red";
    endpoint = `/api/feed/${selectedMatch.id}/foul`;
  }

  const res = await fetch(`https://prime-backend.azurewebsites.net${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-role": "admin" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to add event");

  // return new event data for the component
  return { 
    ...payload, 
    id: Date.now(), 
    timestamp: new Date().toISOString() 
  };
};

const validateMatchForm = (formData) => {
  if (!formData.sportType || !formData.matchName || !formData.homeTeam || !formData.awayTeam || !formData.startTime || !formData.venue) {
    throw new Error("Please fill in all fields");
  }

  if (formData.homeTeam === formData.awayTeam) {
    throw new Error("Home and Away team must be different!");
  }
};
// Create or update a match
export const saveMatchService = async (formData, editingMatch) => {
    validateMatchForm(formData);
  const endpoint = editingMatch 
    ? `https://prime-backend.azurewebsites.net/api/admin/updateMatch/${editingMatch.id}`
    : `https://prime-backend.azurewebsites.net/api/admin/createMatch`;

  const method = editingMatch ? "PUT" : "POST";

  const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Failed to save match");
  }

  return data; // return saved match data
};
export const startMatchService = async (match, updateMatchStatus, setMessage) => {
  const matchId = match.id;
  const initialDoc = {
    home_score: match.homeScore || 0,
    away_score: match.awayScore || 0,
    isRunning: true,
    period: 1,
    fouls: [],
    substitutions: [],
    goals: [],
  };

  try {
    const res = await fetch(`https://prime-backend.azurewebsites.net/api/feed/${matchId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-role": "admin" },
      body: JSON.stringify(initialDoc),
    });

    if (!res.ok) throw new Error("Failed to start match");

    updateMatchStatus(matchId, 'ongoing');

  } catch (err) {
    console.error("Failed to start match", err);
    setMessage({ type: "error", text: "Failed to start match" });
  }
};
// Fetch all matches
export const fetchMatchesService = async () => {
  const response = await fetch("https://prime-backend.azurewebsites.net/api/users/viewMatches");
  if (!response.ok) throw new Error("Failed to fetch matches");

  const matchesData = await response.json();

  // Normalize matches with default values
  return matchesData.map(match => ({
    ...match,
    status: match.status || "scheduled",
    homeScore: match.homeScore || 0,
    awayScore: match.awayScore || 0,
  }));
};

export const updateMatchStatusService = async (matchId, newStatus) => {
  const res = await fetch(`https://prime-backend.azurewebsites.net/api/admin/updateMatchStatus/${matchId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!res.ok) {
    throw new Error("Failed to update match status");
  }

  return { matchId, newStatus };
};

export const updateScoreService = async (matchId, homeScore, awayScore) => {
  const res = await fetch(`https://prime-backend.azurewebsites.net/api/admin/updateScore/${matchId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ homeScore, awayScore }),
  });

  if (!res.ok) {
    throw new Error("Failed to update score");
  }

  return { matchId, homeScore, awayScore };
};

export const deleteMatchService = async (matchId) => {
  const res = await fetch(`https://prime-backend.azurewebsites.net/api/admin/deleteMatch/${matchId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete match");
  }

  return { matchId };
};

export const fetchTeams = async () => {
  const res = await fetch("https://prime-backend.azurewebsites.net/api/admin/allTeams");
  if (!res.ok) throw new Error("Failed to fetch teams");
  const data = await res.json();
  return data.teams.map(team => ({ id: team.id, name: team.teamName }));
};

export const fetchMatches = async () => {
  const res = await fetch('https://prime-backend.azurewebsites.net/api/users/viewMatches');
  if (!res.ok) throw new Error("Failed to fetch matches");
  const data = await res.json();
  return data.map(match => ({
    ...match,
    status: match.status || 'scheduled',
    homeScore: match.homeScore || 0,
    awayScore: match.awayScore || 0
  }));
};

export const fetchLiveStats = async () => {
  const res = await fetch('https://prime-backend.azurewebsites.net/api/display/display-matches');
  if (!res.ok) throw new Error("Failed to fetch live stats");
  return res.json();
};

