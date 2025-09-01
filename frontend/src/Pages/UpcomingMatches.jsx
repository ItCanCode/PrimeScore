import React, { useEffect, useState } from "react";

const API_KEY = "4399a3821d4ce5eb1a989436dc4e5303cf5e7176";
// const sec_API="9705bc4a7c3976dd88ceb3410db328363e8abd87"
let selected_date="";
// const today = new Date().toISOString().split("T")[0];
const serie_a="253";
const Epl_id="228";
const La_liga="297";
let selected_league="La_liga";
let league_id="";
const Psl_id="296";
const Upcoming = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
}

const day2 = addDays(new Date(), 1);
const day3 = addDays(new Date(), 2)
const day4 = addDays(new Date(), 3)
const day5 = addDays(new Date(), 4)
const day6= addDays(new Date(), 5)
const day7 = addDays(new Date(), 6)
const day8 = addDays(new Date(), 7)
  useEffect(() => {
    const fetchLive = async () => {
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
        
        const filtered = allMatches.filter((match) => {
          const [day, month, year] = match.date.split("/");
          const isoDate = `${year}-${month}-${day}T${match.time}:00`;
          const matchDate = new Date(isoDate).toISOString().split("T")[0];
          return  matchDate ===day2 ||matchDate === day3 ||matchDate === day4 ||matchDate === day5 ||matchDate ===day6 ||matchDate === day7  ||matchDate === day8;
        });

        setMatches(filtered);
        
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
        //     })),
        //   }),
        // });

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
        <p>No matches found from {selected_league}.</p>
      )}
    </div>
  );
};

export default Upcoming;
