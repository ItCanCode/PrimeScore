import axios from "axios";

export const getSportsNews = async (req, res) => {
  try {
    const { q = "sports", country = "us" } = req.query;
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        status: "error", 
        message: "NewsData API key not configured" 
      });
    }

    const response = await axios.get("https://newsdata.io/api/1/latest", {
      params: {
        apikey: apiKey,
        q,
        category: "sports",
        country,
        language: "en"
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error("NewsData API Error:", error.response?.data || error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch sports news"
    });
  }
};