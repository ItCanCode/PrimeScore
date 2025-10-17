// API Configuration
// This file contains API keys and configuration settings

export const config = {
  // YouTube API Configuration
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || "AIzaSyAMouA_RqNeWRiGqzf4Cclwq57l98j6WRc",
    baseUrl: "https://www.googleapis.com/youtube/v3"
  },

  // NewsData API Configuration
  newsdata: {
    apiKey: process.env.NEWSDATA_API_KEY || "pub_2df7c07badaa43d6a8b31739076c0731",
    baseUrl: "https://newsdata.io/api/1"
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173"
  },

  // Firebase Configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "sportlivefeeds",
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@sportlivefeeds.iam.gserviceaccount.com"
  }
};

export default config;