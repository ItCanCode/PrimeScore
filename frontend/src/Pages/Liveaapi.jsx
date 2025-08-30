import React, { useEffect, useState } from "react";

const API_KEY = "4399a3821d4ce5eb1a989436dc4e5303cf5e7176";
// const sec_API="9705bc4a7c3976dd88ceb3410db328363e8abd87"
let selected_date="2025-08-30";
let Psl_id="296";
const LiveApi = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const response = await fetch(
          `https://api.soccerdataapi.com/matches/?league_id=${Psl_id}&season=2025-2026&auth_token=${API_KEY}`,
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

        const filtered = allMatches.filter((match) => {
          const [day, month, year] = match.date.split("/");
          const isoDate = `${year}-${month}-${day}T${match.time}:00`;
          const matchDate = new Date(isoDate).toISOString().split("T")[0];
          return matchDate === selected_date;
        });

        setMatches(filtered);

        await fetch("http://localhost:3000/api/storeMatch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            matches: filtered.map((m) => ({

              id: m.id,
              home: m.teams.home?.name,
              away: m.teams.away?.name,
              time: m.time,
              date: m.date,
            })),
          }),
        });
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLive();
  }, []);

  if (loading) {
    return <p>Loading matches...</p>;
  }

  return (
    <div>
      <h2>Matches on {selected_date}</h2>
      {matches.length > 0 ? (
        matches.map((m) => (
          <div key={m.id}>
            <p>
              {m.teams.home?.name || "Unknown"} vs {m.teams.away?.name || "Unknown"}
            </p>
            <p>
              Kickoff:{" "}
              {m.date && m.time
                ? new Date(
                    `${m.date.split("/")[2]}-${m.date.split("/")[1]}-${m.date.split("/")[0]}T${m.time}:00`
                  ).toLocaleString()
                : "Invalid Date"}
            </p>
          </div>
        ))
      ) : (
        <p>No matches found.</p>
      )}
    </div>
  );
};

export default LiveApi;
