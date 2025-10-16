import express from "express";
import { readFileSync } from "fs";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import helmet from "helmet";
import { normalizeArabic } from "./src/utils/normalize.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

const quranPath = path.join(__dirname, "data", "quran.json");
const indexPath = path.join(__dirname, "data", "index.json");

let quran = [];
let index = Object.create(null);

try {
  quran = JSON.parse(readFileSync(quranPath, "utf8"));
} catch (err) {
  console.warn("Warning: failed to load quran.json (it may be missing).", err.message);
}

// Load index if exists
if (existsSync(indexPath)) {
  try {
    index = JSON.parse(readFileSync(indexPath, "utf8"));
    console.log("Loaded index.json - fast startup");
  } catch (err) {
    console.warn("Failed to parse index.json:", err.message);
  }
} else {
  console.log("index.json not found. Run `npm run build-index` to create it for faster searches.");
}

// GET /search?word=<word>
app.get("/search", (req, res) => {
  const rawWord = (req.query.word || "").trim();
  if (!rawWord) return res.status(400).json({ message: "query parameter 'word' is required" });

  const normalized = normalizeArabic(rawWord);
  if (!normalized) return res.status(400).json({ message: "word is empty after normalization" });

  const postings = (index[normalized] || []).slice(); // copy to avoid mutating original

  let totalCount = 0;
  for (const p of postings) totalCount += p.count_in_ayah || 0;

  postings.sort((a, b) => {
    if (a.surah_number !== b.surah_number) return a.surah_number - b.surah_number;
    return a.ayah - b.ayah;
  });

  return res.json({
    word: rawWord,
    normalized_word: normalized,
    total_count: totalCount,
    occurrences_count: postings.length,
    occurrences: postings
  });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`Quran Search API listening on http://localhost:${PORT}`));
