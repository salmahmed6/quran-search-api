export const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
export const TATWEEL = /\u0640/g;

/**
 * Basic normalization for Arabic text - removes diacritics and standardizes characters
 * Does NOT remove prefixes or suffixes - keeps the word intact
 * @param {string} text - The Arabic text to normalize
 * @returns {string} Normalized Arabic text
 */
export function normalizeArabicBasic(text = "") {
  if (typeof text !== "string") {
    return "";
  }

  return text
    .replace(DIACRITICS, "") // Remove diacritics (تشكيل)
    .replace(TATWEEL, "") // Remove tatweel (تطويل)
    // Unify Alef variations including special Unicode characters
    .replace(/[إأآاٱ]/g, "ا")
    // Convert Yeh to Yaa
    .replace(/ى/g, "ي")
    // Convert Taa Marbuta to Haa
    .replace(/ة/g, "ه")
    // Convert Hamza variations
    .replace(/[ؤئ]/g, "و")
    // Remove extra spaces
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Legacy function - kept for backward compatibility
 * Now just calls normalizeArabicBasic
 */
export function normalizeArabic(text = "") {
  return normalizeArabicBasic(text);
}

/**
 * Checks if a word contains the target root word as a substring
 * @param {string} word - The word to check
 * @param {string} rootWord - The root word to search for
 * @returns {boolean} True if the word contains the root word
 */
export function containsRootWord(word, rootWord) {
  const normalizedWord = normalizeArabicBasic(word);
  const normalizedRoot = normalizeArabicBasic(rootWord);
  return normalizedWord.includes(normalizedRoot);
}

/**
 * Finds all words in text that contain the root word
 * @param {string} text - The text to search in
 * @param {string} rootWord - The root word to find
 * @returns {Array} Array of objects with {word, startIndex, endIndex}
 */
export function findRootWordMatches(text, rootWord) {
  const matches = [];
  const normalizedRoot = normalizeArabicBasic(rootWord);
  
  if (!normalizedRoot) {
    return matches;
  }
  
  const words = text.split(/(\s+)/); // Keep separators for accurate indexing
  let currentIndex = 0;
  
  for (let i = 0; i < words.length; i += 2) { // Skip separators (odd indices)
    const word = words[i];
    if (word && containsRootWord(word, rootWord)) {
      const startIndex = currentIndex;
      const endIndex = currentIndex + word.length;
      matches.push({
        word: word,
        startIndex: startIndex,
        endIndex: endIndex
      });
    }
    currentIndex += word.length + (words[i + 1] ? words[i + 1].length : 0);
  }
  
  return matches;
}

// Legacy exports - kept for backward compatibility but now use basic normalization
export const normalizeArabicWord = normalizeArabicBasic;
export const normalizeArabicForSearch = normalizeArabicBasic;
export const areArabicWordsEquivalent = (word1, word2) => {
  return normalizeArabicBasic(word1) === normalizeArabicBasic(word2);
};
export const findMorphologicalMatches = findRootWordMatches;