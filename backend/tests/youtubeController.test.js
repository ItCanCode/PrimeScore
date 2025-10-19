import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { getSportsShorts } from "../src/controllers/youtubeController.js";

describe("getSportsShorts", () => {
  let req, res, mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    req = { query: { sport: "basketball" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.YOUTUBE_API_KEY = "youtube123apikey";
  });

  afterEach(() => {
    mock.restore();
    jest.clearAllMocks();
  });

  it("should return formatted video data", async () => {
    const fakeApiResponse = {
      items: [
        {
          id: { videoId: "abc123" },
          snippet: {
            title: "Basketball Highlights",
            channelTitle: "Sports Channel",
            thumbnails: {
              high: { url: "http://example.com/high.jpg" },
              default: { url: "http://example.com/default.jpg" },
            },
          },
        },
      ],
    };

    mock
      .onGet("https://www.googleapis.com/youtube/v3/search")
      .reply(200, fakeApiResponse);

    await getSportsShorts(req, res);

    expect(res.json).toHaveBeenCalledWith({
      videos: [
        {
          videoId: "abc123",
          title: "Basketball Highlights",
          thumbnail: "http://example.com/high.jpg",
          channel: "Sports Channel",
        },
      ],
    });
  });

  it("should handle missing API key", async () => {
    delete process.env.YOUTUBE_API_KEY;

    await getSportsShorts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "YouTube API key not configured",
    });
  });

  it("should handle API errors gracefully", async () => {
    process.env.YOUTUBE_API_KEY = "youtube123apikey";

    mock
      .onGet("https://www.googleapis.com/youtube/v3/search")
      .reply(500);

    await getSportsShorts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Failed to fetch YouTube videos",
    });
  });
});
