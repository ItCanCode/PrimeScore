import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { getSportsNews } from "../src/controllers/newsController.js";

describe("getSportsNews", () => {
  let req, res, mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    req = { query: { q: "football", country: "us" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.NEWSDATA_API_KEY = "newsapi123";
  });

  afterEach(() => {
    mock.restore();
  });

  it("should return news data", async () => {
    const fakeData = { results: [{ title: "Test News" }] };
    mock.onGet("https://newsdata.io/api/1/latest").reply(200, fakeData);

    await getSportsNews(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeData);
  });

  it("should handle missing API key", async () => {
    delete process.env.NEWSDATA_API_KEY;

    await getSportsNews(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "NewsData API key not configured",
    });
  });

  it("should handle API errors", async () => {
    process.env.NEWSDATA_API_KEY = "fake_api_key";
    mock.onGet("https://newsdata.io/api/1/latest").reply(500);

    await getSportsNews(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Failed to fetch sports news",
    });
  });
});
