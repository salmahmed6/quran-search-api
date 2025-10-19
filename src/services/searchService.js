import { readFileSync } from "fs";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeArabicBasic } from "../utils/normalize.js";
import { config } from "../config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SearchService {
  constructor() {
    this.quran = [];
    this.index = Object.create(null);
    this.loadData();
  }

  loadData() {
    try {
      const quranPath = path.join(__dirname, "../../data/quran.json");
      const quranData = JSON.parse(readFileSync(quranPath, "utf8"));
      
      this.quran = [];
      for (const chapterNum in quranData) {
        const verses = quranData[chapterNum];
        for (const verse of verses) {
          this.quran.push({
            surah_number: verse.chapter,
            ayah: verse.verse,
            text: verse.text,
            surah_name: `سورة ${chapterNum}` // Simple surah name for now
          });
        }
      }
      
      console.log(`Loaded ${this.quran.length} Quran verses`);
    } catch (err) {
      console.warn("⚠ Warning: failed to load quran.json:", err.message);
      this.quran = [];
    }

    // Note: Index-based search is disabled for root word matching
    // Root word search requires substring matching which can't be pre-indexed effectively
    console.log("Using live root word search (substring matching)");
  }

  async searchWord(rawWord) {
    if (!rawWord || typeof rawWord !== "string") {
      throw new Error("Word parameter is required and must be a string");
    }

    const trimmedWord = rawWord.trim();
    if (!trimmedWord) {
      throw new Error("Word cannot be empty");
    }

    // Normalize the search term (remove diacritics, standardize characters)
    const normalizedSearchTerm = normalizeArabicBasic(trimmedWord);
    if (!normalizedSearchTerm) {
      throw new Error("Word is empty after normalization");
    }

    return this.performRootWordSearch(trimmedWord, normalizedSearchTerm);
  }

  /**
   * Performs root word search by checking if the normalized search term
   * is contained within any word in the verse (substring matching)
   */
  performRootWordSearch(originalWord, normalizedSearchTerm) {
    const results = [];
    let totalCount = 0;
    const seenVerses = new Set();

    for (const ayahObj of this.quran) {
      const normText = normalizeArabicBasic(ayahObj.text || "");
      if (!normText) continue;

      // Split by whitespace to get individual words
      const tokens = normText.split(/\s+/).filter(Boolean);
      let wordCountInAyah = 0;

      // Check each word to see if it contains the search term as a substring
      for (const token of tokens) {
        if (token.includes(normalizedSearchTerm)) {
          wordCountInAyah++;
        }
      }

      if (wordCountInAyah > 0) {
        const verseKey = `${ayahObj.surah_number}-${ayahObj.ayah}`;
        if (!seenVerses.has(verseKey)) {
          seenVerses.add(verseKey);
          results.push({
            surah_number: ayahObj.surah_number,
            surah_name: ayahObj.surah_name,
            ayah: ayahObj.ayah,
            text: ayahObj.text,
            count_in_ayah: wordCountInAyah
          });
          totalCount += wordCountInAyah;
        }
      }
    }

    // Sort by surah number, then by ayah number
    results.sort((a, b) => {
      if (a.surah_number !== b.surah_number) {
        return a.surah_number - b.surah_number;
      }
      return a.ayah - b.ayah;
    });

    return {
      word: originalWord,
      normalized_word: normalizedSearchTerm,
      total_count: totalCount,
      occurrences_count: results.length,
      occurrences: results.slice(0, config.MAX_SEARCH_RESULTS)
    };
  }

  getStats() {
    return {
      quran_verses_loaded: this.quran.length,
      search_mode: "root_word_substring_matching",
      has_index: false
    };
  }
}

export const searchService = new SearchService();