import axios from "axios";
import { config } from "../config/apiConfig.js";

export const getSportsShorts = async (req, res) => {
  try {
    const { sport = "football" } = req.query;
    const apiKey = config.youtube.apiKey;

    if (!apiKey) {
      return res.status(500).json({ 
        status: "error", 
        message: "YouTube API key not configured" 
      });
    }

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: apiKey,
          part: "snippet",
          q: `${sport} highlights`,
          type: "video",
          videoDuration: "short",
          maxResults: 10,
          order: "relevance"
        }
      }
    );

    const videos = response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channel: item.snippet.channelTitle
    }));

    res.json({ videos });
  } catch (error) {
    console.error("YouTube API Error:", error.response?.data || error.message);
    res.status(500).json({ 
      status: "error", 
      message: "Failed to fetch YouTube videos" 
    });
  }
};
