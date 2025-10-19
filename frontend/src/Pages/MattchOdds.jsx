import React, { useEffect, useState } from "react";
import '../Styles/RugbyFixtures.css';
const MatchOdds = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(
          "https://theinvinciblesprojects-3tv1.onrender.com/exposed/api/predictions"
        );
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error("Error fetching match odds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading match odds...</p>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Match Odds</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match, index) => (
          <div
            key={`${match.matchId}-${index}`}
            className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition duration-300"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <img
                  src={match.homeLogo}
                  alt={match.homeTeam}
                  className="w-10 h-10"
                />
                <span className="font-semibold">{match.homeTeam}</span>
              </div>
              <span className="text-gray-500 font-medium">vs</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{match.awayTeam}</span>
                <img
                  src={match.awayLogo}
                  alt={match.awayTeam}
                  className="w-10 h-10"
                />
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg mb-2">
              <div>
                <p className="text-sm text-gray-600">Predicted Score</p>
                <p className="font-semibold">
                  {match.predHomeScore} - {match.predAwayScore}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Actual Score</p>
                <p className="font-semibold">
                  {match.homeScore ?? "-"} - {match.awayScore ?? "-"}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                <strong>Status:</strong> {match.matchStatus}
              </p>
              <p>
                <strong>League Round:</strong> {match.leagueRound}
              </p>
              <p>
                <strong>Venue:</strong> {match.venue}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(match.datetime).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchOdds;
