import React, { useEffect, useState } from "react";


const OnGoing = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
const API_KEY = "4399a3821d4ce5eb1a989436dc4e5303cf5e7176";

  const serie_a="253";
  const Epl_id="228";
  const La_liga="297";
  let selected_league="";
  let League_id="";
  const Psl_id="296";
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const response = await fetch(
          `https://api.soccerdataapi.com/livescores/?auth_token=${API_KEY}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Accept-Encoding": "gzip",
            },
          }
        );



        if (selected_league=="PSL"){
            League_id=Psl_id;
          }
          else if (selected_league=="Epl") {
            League_id=Epl_id;
          }
          else if (selected_league=="La_liga") {
            League_id=La_liga;
          }
          else if (selected_league=="serie_a") {
            League_id=serie_a;
          }   
          else{
            League_id=Epl_id;//just in case
          }     
        if (!response.ok) {
          console.error("Failed to fetch");
          setLoading(false);
          return;
        }

        const data = await response.json();

        // Corrected: access data.results
        const leagueMatches =
          data.results
            .find((league) => league.league_id === League_id)
            ?.stage.flatMap((stage) => stage.matches) || [];

        setMatches(leagueMatches);
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
      <h2>League {League_id} Matches</h2>
      {matches.length > 0 ? (
        matches.map((m) => (
          <div key={m.id} style={{ marginBottom: "25px" }}>
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

            {m.events && m.events.length > 0 ? (
              <div>
                <h4>Events:</h4>
                <ul>
                  {m.events.map((event, idx) => {
                    if (event.event_type === "substitution") {
                      return (
                        <li key={idx}>
                          {event.event_minute}' substitution –{" "}
                          {event.player_in?.name || "Unknown In"} for{" "}
                          {event.player_out?.name || "Unknown Out"}
                        </li>
                      );
                    }

                    if (event.event_type === "goal" || event.event_type === "penalty_goal") {
                      return (
                        <li key={idx}>
                          {event.event_minute}' {event.event_type.replace("_", " ")} –{" "}
                          {event.player?.name || "Unknown"}{" "}
                          {event.assist_player ? `(assist: ${event.assist_player.name})` : ""}
                        </li>
                      );
                    }

                    if (event.event_type === "yellow_card" || event.event_type === "red_card") {
                      return (
                        <li key={idx}>
                          {event.event_minute}' {event.event_type.replace("_", " ")} –{" "}
                          {event.player?.name || "Unknown"}
                        </li>
                      );
                    }

                    return (
                      <li key={idx}>
                        {event.event_minute}' {event.event_type} –{" "}
                        {event.player?.name || "Unknown"}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p>No events recorded.</p>
            )}
          </div>
        ))
      ) : (
        <p>No matches found for this league.</p>
      )}
    </div>
  );
};

export default OnGoing;
