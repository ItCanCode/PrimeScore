import axios from "axios";

export const getSportsShorts = async (req, res) => {
  try {
    const { sport = "football" } = req.query; // default sport
    const apiKey = process.env.YOUTUBE_API_KEY;

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: apiKey,
          part: "snippet",
          q: `${sport} highlights`, // fetch sports-related shorts
          type: "video",
          videoDuration: "short",     // only shorts < 60 sec
          maxResults: 10
        }
      }
    );

    const videos = response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channel: item.snippet.channelTitle
    }));

    res.json({ status: "success", videos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Failed to fetch YouTube shorts" });
  }
};
