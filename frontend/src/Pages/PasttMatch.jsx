import React, { useEffect, useState } from "react";

const API_KEY = "4399a3821d4ce5eb1a989436dc4e5303cf5e7176";
const Psl_id = "296";
const serie_a="253";
const Epl_id = "228";
const La_liga="297";
let selected_league="";
let league_id="";

const LiveApi = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split("T")[0];
  }

  useEffect(() => {
    const fetchMatches = async () => {
      try {


        if (selected_league=="PSL"){
            league_id=Psl_id;
          }
          else if (selected_league=="Epl") {
            league_id=Epl_id;
          }
          else if (selected_league=="La_liga") {
            league_id=La_liga;
          }
          else if (selected_league=="serie_a") {
            league_id=serie_a;
          }  
          else{
            league_id=Epl_id;//just in case
          }

        
        const response = await fetch(
          `https://api.soccerdataapi.com/matches/?league_id=${league_id}&season=2025-2026&auth_token=${API_KEY}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept-Encoding": "gzip",
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch");
          setLoading(false);
          return;
        }

        const data = await response.json();

        const allMatches = data[0]?.stage?.flatMap((stage) => stage.matches) || [];

        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) =>
          addDays(today, -i)
        );

        // Filter matches in the past 7 days
        const filtered = allMatches.filter((match) => {
          const [day, month, year] = match.date.split("/");
          const isoDate = `${year}-${month}-${day}T${match.time}:00`;
          const matchDate = new Date(isoDate).toISOString().split("T")[0];
          return last7Days.includes(matchDate);
        });

        setMatches(filtered);
        console.log(matches);
        // Optional: store matches in your backend
        // await fetch("https://prime-backend.azurewebsites.net/api/storeMatch", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     matches: filtered.map((m) => ({
        //       id: m.id,
        //       home: m.teams.home?.name,
        //       away: m.teams.away?.name,
        //       time: m.time,
        //       date: m.date,
        //       events: m.events || [],
        //     })),
        //   }),
        // });
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [matches]);

  if (loading) {
    return <p>Loading matches...</p>;
  }

  return (
    <div>
      <h2>Matches in the Last 7 Days</h2>
      {matches.length > 0 ? (
        matches.map((m) => (
          <div key={m.id} style={{ marginBottom: "2rem" }}>
            <p>
              <strong>
                {m.teams.home?.name || "Unknown"} vs {m.teams.away?.name || "Unknown"}
              </strong>
            </p>
            <p>
              Kickoff:{" "}
              {m.date && m.time
                ? new Date(
                    `${m.date.split("/")[2]}-${m.date.split("/")[1]}-${m.date.split("/")[0]}T${m.time}:00`
                  ).toLocaleString()
                : "Invalid Date"}
            </p>
            {m.events?.length > 0 && (
              <ul>
                {m.events.map((e, i) => {
                  let playerName = "Unknown";

                  if (e.event_type === "substitution") {
                    const inName = e.player_in?.name || "Unknown";
                    const outName = e.player_out?.name || "Unknown";
                    playerName = `${outName} → ${inName}`;
                  } else {
                    playerName = e.player?.name || "Unknown";
                  }

                  return (
                    <li key={i}>
                      {e.event_minute}' {e.event_type} – {playerName}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))
      ) : (
        <p>No matches found in the last 7 days.</p>
      )}
    </div>
  );
};

export default LiveApi;
