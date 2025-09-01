import React, { useEffect, useState } from "react";

const API_KEY = "4399a3821d4ce5eb1a989436dc4e5303cf5e7176";
const SERIE_A = "253";
const EPL = "228";
const LA_LIGA = "297";
const PSL = "296";

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
}

const Upcoming = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, _setSelectedLeague] = useState("La_liga");

  // create array of upcoming days
  const allowedDays = Array.from({ length: 7 }, (_, i) =>
    addDays(new Date(), i + 1)
  );

  // map selectedLeague to league_id
  const getLeagueId = (league) => {
    switch (league) {
      case "PSL":
        return PSL;
      case "Epl":
        return EPL;
      case "La_liga":
        return LA_LIGA;
      case "serie_a":
        return SERIE_A;
      default:
        return EPL;
    }
  };

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const league_id = getLeagueId(selectedLeague);

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
        const allMatches =
          data[0]?.stage?.flatMap((stage) => stage.matches) || [];

        const filtered = allMatches.filter((match) => {
          const [day, month, year] = match.date.split("/");
          const isoDate = `${year}-${month}-${day}T${match.time}:00`;
          const matchDate = new Date(isoDate).toISOString().split("T")[0];
          return allowedDays.includes(matchDate);
        });

        setMatches(filtered);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLive();
  }, [selectedLeague, allowedDays]); // ✅ correct dependencies

  if (loading) {
    return <p>Loading matches...</p>;
  }

  return (
    <div>
      <h2>Upcoming Matches</h2>
      {matches.length > 0 ? (
        matches.map((m) => (
          <div key={m.id}>
            <p>
              {m.teams.home?.name || "Unknown"} vs{" "}
              {m.teams.away?.name || "Unknown"}
            </p>
            <p>
              Kickoff:{" "}
              {m.date && m.time
                ? new Date(
                    `${m.date.split("/")[2]}-${m.date.split("/")[1]}-${
                      m.date.split("/")[0]
                    }T${m.time}:00`
                  ).toLocaleString()
                : "Invalid Date"}
            </p>
          </div>
        ))
      ) : (
        <p>No matches found from {selectedLeague}.</p>
      )}
    </div>
  );
};

export default Upcoming;
