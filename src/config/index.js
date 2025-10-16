import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  QURAN_DATA_PATH: process.env.QURAN_DATA_PATH || "./data/quran.json",
  INDEX_DATA_PATH: process.env.INDEX_DATA_PATH || "./data/index.json",
  API_VERSION: "v1",
  MAX_SEARCH_RESULTS: parseInt(process.env.MAX_SEARCH_RESULTS) || 1000,
  CACHE_TTL: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour in seconds
};
