import React, { useState } from 'react';

const FixturesByDate = () => {
  const [fixtures, setFixtures] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFixtures = async (year, month, day, leagueId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://rugby-live-data-complete.p.rapidapi.com/fixture-by-league?year=${year}&month=${month}&day=${day}&leagueId=${leagueId}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': 'd41bf33af4msh32343f954c0ba0cp1d2aa0jsn03c0975718bd',
            'x-rapidapi-host': 'rugby-live-data-complete.p.rapidapi.com',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setFixtures(data.fixture ? Object.values(data.fixture).flatMap(l => l.games) : []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching fixtures:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);

    const [year, month, day] = date.split('-');
    const leagueId = '270555'; // Replace with the desired league ID

    fetchFixtures(year, month, day, leagueId);
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: '#121212', minHeight: '100vh' }}>
      <h2 style={{ color: 'white' }}>Rugby Fixtures</h2>
      <input type="date" value={selectedDate} onChange={handleDateChange} style={{ marginBottom: '1rem' }} />

      {loading && <p style={{ color: 'white' }}>Loading fixtures...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && fixtures.length === 0 && <p style={{ color: 'white' }}>No fixtures found for this date.</p>}

      <div>
        {fixtures.map((fixture) => (
          <div
            key={fixture.id}
            style={{
              border: '1px solid #ccc',
              margin: '1rem 0',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: '#1e1e1e',
              color: 'white',
            }}
          >
            <h3>{fixture.name}</h3>
            <p>Date: {new Date(fixture.date).toLocaleString()}</p>
            <p>Status: {fixture.status?.type?.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '400px' }}>
              {fixture.competitions[0].competitors.map((c) => (
                <div key={c.id} style={{ textAlign: 'center', color: 'white' }}>
                  <img src={c.team.logo} alt={c.team.name} width="50" />
                  <p>{c.team.displayName}</p>
                  <p>Score: {c.score}</p>
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
