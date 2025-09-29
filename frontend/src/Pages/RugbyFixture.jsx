import React, { useState } from 'react';

const FixturesByDate = () => {
  const [fixtures, setFixtures] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [available,setAvail]=useState()








  const fetchFixtures = async (year, month, day, leagueId) => {
    setLoading(true);
    setError(null);

    try {
         const dateStr = `${year}-${month}-${day}`;
        // const [year, month, day] = date.split('-');
        console.log(dateStr);
        
        const response= await fetch(`https://prime-backend.azurewebsites.net/api/rugby/live/${dateStr}`);
        if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      let data = await response.json();
      setFixtures(data);
      
       if(data.message === "None" || data.length === 0){
              const rapidResponse  = await fetch(
        `https://rugby-live-data-complete.p.rapidapi.com/fixture-by-league?year=${year}&month=${month}&day=${day}&leagueId=${leagueId}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': 'd41bf33af4msh32343f954c0ba0cp1d2aa0jsn03c0975718bd',
            'x-rapidapi-host': 'rugby-live-data-complete.p.rapidapi.com',
          },
        }
      );

      if (!rapidResponse.ok) {
        throw new Error('Network response was not ok');
      }
       const rapidData = await rapidResponse.json();


       const storeFixtures = rapidData.fixture
  ? Object.values(data.fixture).flatMap(l =>
      l.games.map(g => ({
        leagueName: l.leagueName,
        name: g.name,
        date: g.date,
        status: g.status?.type?.description || "Unknown",
        score: g.competitions?.[0]?.competitors?.map(c => ({
          team: c.team.displayName,
          score: c.score
        })) || []
      }))
    )
  : [];

  setFixtures(storeFixtures);

  const sendIt=await fetch(`https://prime-backend.azurewebsites.net/api/rugby/`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify(fixtures),
});

    if(!sendIt.ok){
      throw new Error('Network for sending fixtures  was not ok');
    }


    // const sendItdata = await sendIt.json();
    if (!sendIt.ok) throw new Error('Failed to save fixtures to backend');
      }


      setFixtures(data);
      


     



 
    // console.log("Response:", sendItdata);
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
    const leagueId = '270555'; 

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
  {Object.entries(
    fixtures.reduce((acc, game) => {
      if (!acc[game.leagueName]) acc[game.leagueName] = [];
      acc[game.leagueName].push(game);
      return acc;
    }, {})
  ).map(([leagueName, games]) => (
    <div key={leagueName}>
      <h2 style={{ color: "yellow" }}>{leagueName}</h2>

      {games.map((game, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            margin: "1rem 0",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: "#1e1e1e",
            color: "white",
          }}
        >
          <h3>{game.name}</h3>
          <p>Date: {new Date(game.date).toLocaleString()}</p>
          <p>Status: {game.status}</p>

          <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "400px" }}>
            {game.score.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p>{s.team}</p>
                <p>Score: {s.score}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ))}
</div>



    </div>
  );
};

export default FixturesByDate;
