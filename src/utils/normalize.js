export const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
export const TATWEEL = /\u0640/g;

/**
 * Normalizes Arabic text by removing diacritics and standardizing characters
 * @param {string} text - The Arabic text to normalize
 * @returns {string} Normalized Arabic text
 */
export function normalizeArabic(text = "") {
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