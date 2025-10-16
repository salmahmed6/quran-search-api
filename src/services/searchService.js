import { readFileSync } from "fs";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeArabic } from "../utils/normalize.js";
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
      console.warn(" Warning: failed to load quran.json:", err.message);
      this.quran = [];
    }

    // Load index if exists
    const indexPath = path.join(__dirname, "../../data/index.json");
    if (existsSync(indexPath)) {
      try {
        this.index = JSON.parse(readFileSync(indexPath, "utf8"));
        console.log("Loaded search index - fast startup enabled");
      } catch (err) {
        console.warn(" Failed to parse index.json:", err.message);
        this.index = Object.create(null);
      }
    } else {
      console.log("index.json not found. Run `npm run build-index` to create it for faster searches.");
    }
  }

  async searchWord(rawWord) {
    if (!rawWord || typeof rawWord !== "string") {
      throw new Error("Word parameter is required and must be a string");
    }

    const trimmedWord = rawWord.trim();
    if (!trimmedWord) {
      throw new Error("Word cannot be empty");
    }

    const normalized = normalizeArabic(trimmedWord);
    if (!normalized) {
      throw new Error("Word is empty after normalization");
    }

    // If no index available, perform live search
    if (Object.keys(this.index).length === 0) {
      return this.performLiveSearch(trimmedWord, normalized);
    }

    // Search for both the exact word and variations
    const searchVariations = this.getSearchVariations(normalized);
    const allPostings = [];
    const seenVerses = new Set();

    for (const searchTerm of searchVariations) {
      const postings = this.index[searchTerm] || [];
      for (const posting of postings) {
        // Create a unique key for each verse to avoid duplicates
        const verseKey = `${posting.surah_number}-${posting.ayah}`;
        if (!seenVerses.has(verseKey)) {
          seenVerses.add(verseKey);
          allPostings.push(posting);
        }
      }
    }

    let totalCount = 0;
    for (const p of allPostings) {
      totalCount += p.count_in_ayah || 0;
    }

    // Sort by surah number, then by ayah number
    allPostings.sort((a, b) => {
      if (a.surah_number !== b.surah_number) {
        return a.surah_number - b.surah_number;
      }
      return a.ayah - b.ayah;
    });

    return {
      word: trimmedWord,
      normalized_word: normalized,
      total_count: totalCount,
      occurrences_count: allPostings.length,
      occurrences: allPostings.slice(0, config.MAX_SEARCH_RESULTS)
    };
  }

  getSearchVariations(normalizedWord) {
    const variations = [normalizedWord];
    
    // If the word starts with "ال", also search without it
    if (normalizedWord.startsWith('ال')) {
      variations.push(normalizedWord.substring(2));
    }
    
    // If the word doesn't start with "ال", also search with it
    if (!normalizedWord.startsWith('ال')) {
      variations.push('ال' + normalizedWord);
    }
    
    return [...new Set(variations)]; // Remove duplicates
  }

  performLiveSearch(originalWord, normalizedWord) {
    const results = [];
    let totalCount = 0;
    const seenVerses = new Set();

    // Get search variations
    const searchVariations = this.getSearchVariations(normalizedWord);

    for (const ayahObj of this.quran) {
      const normText = normalizeArabic(ayahObj.text || "");
      if (!normText) continue;

      const tokens = normText.split(" ").filter(Boolean);
      let wordCountInAyah = 0;

      // Check for all variations
      for (const searchTerm of searchVariations) {
        for (const token of tokens) {
          if (token === searchTerm) {
            wordCountInAyah++;
          }
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

    return {
      word: originalWord,
      normalized_word: normalizedWord,
      total_count: totalCount,
      occurrences_count: results.length,
      occurrences: results.slice(0, config.MAX_SEARCH_RESULTS)
    };
  }

  getStats() {
    return {
      quran_verses_loaded: this.quran.length,
      index_entries: Object.keys(this.index).length,
      has_index: Object.keys(this.index).length > 0
    };
  }
}

export const searchService = new SearchService();
