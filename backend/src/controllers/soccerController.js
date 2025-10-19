import fetch from "node-fetch";

export const getMatches = async (req, res) => {
  try {
    const league_id = req.query.league_id;
    const season = req.query.season || "2025-2026";
    const API_KEY = process.env.SOCCER_API_KEY;

    if (!league_id) {
      return res.status(400).json({ error: "league_id is required" });
    }

    const url = `https://api.soccerdataapi.com/matches/?league_id=${league_id}&season=${season}&auth_token=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching matches:", err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
};