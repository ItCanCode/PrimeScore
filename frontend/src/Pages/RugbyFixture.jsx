import React, { useState } from 'react';
import '../Styles/RugbyFixtures.css';

const FixturesByDate = () => {
  const [fixtures, setFixtures] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFixtures = async (year, month, day, leagueId) => {
    setLoading(true);
    setError(null);

    try {
      const dateStr = `${year}-${month}-${day}`;
      console.log("Fetching for date:", dateStr);

      // Fetch from backend first
      const response = await fetch(`https://prime-backend.azurewebsites.net/api/rugby/live/${dateStr}`);
      if (!response.ok) throw new Error('Failed to fetch from backend');

      const data = await response.json();
      let backendFixtures = [];

      if (Array.isArray(data)) {
        backendFixtures = data;
      } else if (Array.isArray(data.fixtures)) {
        backendFixtures = data.fixtures;
      }

      if (backendFixtures.length > 0) {
        console.log("✅ Fetched from backend database");
        setFixtures(backendFixtures);
        return;
      }

      console.log("🌐 Using external API...");
      const rapidResponse = await fetch(
        `https://rugby-live-data-complete.p.rapidapi.com/fixture-by-league?year=${year}&month=${month}&day=${day}&leagueId=${leagueId}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': 'd41bf33af4msh32343f954c0ba0cp1d2aa0jsn03c0975718bd',
            'x-rapidapi-host': 'rugby-live-data-complete.p.rapidapi.com',
          },
        }
      );

      if (!rapidResponse.ok) throw new Error('Failed to fetch from external API');

      const rapidData = await rapidResponse.json();
      console.log("Rapid API response structure:", rapidData);

      // 🛠 Safely handle missing or malformed data
      const externalFixtures = rapidData.fixture
        ? Object.values(rapidData.fixture).flatMap(l =>
            Array.isArray(l.games)
              ? l.games.map(g => ({
                  leagueName: l.leagueName || "Unknown League",
                  name: g.name || "Unknown Match",
                  date: g.date || new Date().toISOString(),
                  status: g.status?.type?.description || "Unknown",
                  score:
                    g.competitions?.[0]?.competitors?.map(c => ({
                      team: c.team?.displayName || "Unknown Team",
                      score: c.score ?? "N/A"
                    })) || []
                }))
              : [] // Skip if l.games is not an array
          )
        : [];

      setFixtures(externalFixtures);

      // Save fetched fixtures to backend if available
      if (externalFixtures.length > 0) {
        console.log("💾 Saving external fixtures to backend...");
        const saveResponse = await fetch(`https://prime-backend.azurewebsites.net/api/rugby/live`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(externalFixtures),
        });

        if (!saveResponse.ok) throw new Error('Failed to save fixtures to backend');
      }

    } catch (err) {
      setError(err.message);
      console.error('❌ Error fetching fixtures:', err);
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);

    const [year, month, day] = date.split('-');
    const leagueId = '270555';
    fetchFixtures(year, month, day, leagueId);
  };

  const getStatusClass = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('live') || statusLower.includes('ongoing')) {
      return 'rugby-status-live';
    } else if (statusLower.includes('complete') || statusLower.includes('finished')) {
      return 'rugby-status-completed';
    } else if (statusLower.includes('scheduled') || statusLower.includes('upcoming')) {
      return 'rugby-status-scheduled';
    }
    return 'rugby-status-default';
  };

  const groupedFixtures = Array.isArray(fixtures)
    ? fixtures.reduce((acc, game) => {
        if (!acc[game.leagueName]) acc[game.leagueName] = [];
        acc[game.leagueName].push(game);
        return acc;
      }, {})
    : {};

  return (
    <div className="rugby-fixtures-container">
      <div className="rugby-header">
        <h2>🏉 Rugby Fixtures</h2>
        <div className="rugby-date-picker">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="rugby-date-input"
          />
        </div>
      </div>

      {loading && (
        <div className="rugby-loading">
          Loading fixtures...
        </div>
      )}

      {error && (
        <div className="rugby-error">
          Error: {error}
        </div>
      )}

      {!loading && !error && fixtures.length === 0 && (
        <div className="rugby-no-fixtures">
          No fixtures found for this date. Please select a different date.
        </div>
      )}

      <div className="rugby-leagues-container">
        {Object.entries(groupedFixtures).map(([leagueName, games]) => (
          <div key={leagueName} className="rugby-league-section">
            <h2 className="rugby-league-title">{leagueName}</h2>
            <div className="rugby-games-grid">
              {games.map((game, index) => (
                <div key={index} className="rugby-game-card">
                  <h3 className="rugby-game-name">{game.name}</h3>
                  
                  <div className="rugby-game-info">
                    <div className="rugby-game-detail">
                      <strong>Date:</strong> {new Date(game.date).toLocaleString()}
                    </div>
                    <div className="rugby-game-detail">
                      <strong>Status:</strong>
                      <span className={`rugby-game-status ${getStatusClass(game.status)}`}>
                        {game.status}
                      </span>
                    </div>
                  </div>

                  {game.score && game.score.length > 0 && (
                    <div className="rugby-scores-container">
                      {game.score.map((s, i) => (
                        <React.Fragment key={i}>
                          <div className="rugby-team-score">
                            <div className="rugby-team-name">{s.team}</div>
                            <div className="rugby-team-score-value">{s.score}</div>
                          </div>
                          {i === 0 && game.score.length > 1 && (
                            <div className="rugby-vs-separator">VS</div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FixturesByDate;
