import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeArabic } from "../src/utils/normalize.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const quranPath = path.join(__dirname, "quran.json");
const indexPath = path.join(__dirname, "index.json");

function buildIndex(quranData) {
  const index = Object.create(null);

  // Convert the structured data to a flat array (same as searchService)
  const quran = [];
  for (const chapterNum in quranData) {
    const verses = quranData[chapterNum];
    for (const verse of verses) {
      quran.push({
        surah_number: verse.chapter,
        ayah: verse.verse,
        text: verse.text,
        surah_name: `سورة ${chapterNum}`
      });
    }
  }

  for (const ayahObj of quran) {
    const normText = normalizeArabic(ayahObj.text || "");
    if (!normText) continue;

    // تقسيم بسيط على المسافة — يمكن استبداله بتوكنيزر عربي أفضل
    const tokens = normText.split(" ").filter(Boolean);
    const wordCountsInAyah = Object.create(null);

    for (const tok of tokens) {
      wordCountsInAyah[tok] = (wordCountsInAyah[tok] || 0) + 1;
    }

    for (const [word, cnt] of Object.entries(wordCountsInAyah)) {
      if (!index[word]) index[word] = [];
      index[word].push({
        surah_number: ayahObj.surah_number,
        surah_name: ayahObj.surah_name,
        ayah: ayahObj.ayah,
        text: ayahObj.text,
        count_in_ayah: cnt
      });
    }
  }

  return index;
}

async function main() {
  try {
    console.log("Reading quran.json...");
    const raw = await readFile(quranPath, "utf8");
    const quran = JSON.parse(raw);

    console.log("Building index (this may take some time)...");
    const index = buildIndex(quran);

    console.log("Writing index.json...");
    await writeFile(indexPath, JSON.stringify(index), "utf8");

    console.log("Index built and saved to:", indexPath);
  } catch (err) {
    console.error("Failed to build index:", err);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
