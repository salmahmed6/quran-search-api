# Quran Search API

A simple and fast API to search Arabic words in the Quran JSON and return occurrences ordered by surah.

## Features

- Fast Arabic word search in Quran
- Results ordered by surah and ayah number
- Pre-built index for faster searches
- Input validation and error handling
- Arabic text normalization
- Word variation support (with/without ال prefix)

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the search index for faster searches (optional but recommended):
   ```bash
   npm run build-index
   ```

4. Start the server:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Search Arabic Word
**GET** `/api/search?word=<arabic_word>`

Search for a single Arabic word in the Quran.

**Example:**
```bash
curl "http://localhost:3000/api/search?word=الله"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "word": "الله",
    "normalized_word": "الله",
    "total_count": 2313,
    "occurrences_count": 1716,
    "occurrences": [
      {
        "surah_number": 1,
        "surah_name": "سورة 1",
        "ayah": 1,
        "text": "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
        "count_in_ayah": 1
      }
    ]
  },
  "meta": {
    "timestamp": "2025-10-16T12:31:33.143Z",
    "query": "الله",
    "resultsCount": 1716,
    "totalOccurrences": 2313
  }
}
```

### Response Fields Explanation

- `word`: The original search term
- `normalized_word`: The normalized version after Arabic text processing
- `total_count`: Total number of word occurrences across all verses
- `occurrences_count`: Number of unique verses containing the word
- `occurrences`: Array of verses containing the word, ordered by surah and ayah
- `count_in_ayah`: Number of times the word appears in that specific verse

**Note**: `total_count` and `occurrences_count` may differ when a word appears multiple times in the same verse.

## Testing the API

### Using cURL

```bash
# Search for Allah
curl "http://localhost:3000/api/search?word=الله"

# Search for Muhammad
curl "http://localhost:3000/api/search?word=محمد"

# Search for Islam
curl "http://localhost:3000/api/search?word=الإسلام"

# Search for Rahman
curl "http://localhost:3000/api/search?word=الرحمن"

# Search for Rahim
curl "http://localhost:3000/api/search?word=الرحيم"
```

### Using JavaScript/Fetch

```javascript
// Search for a single word
const searchWord = async (word) => {
  const response = await fetch(`http://localhost:3000/api/search?word=${encodeURIComponent(word)}`);
  const data = await response.json();
  console.log(data);
  return data;
};

// Usage examples
searchWord('الله');      // Search for Allah
searchWord('محمد');      // Search for Muhammad
searchWord('الإسلام');   // Search for Islam
searchWord('الرحمن');    // Search for Rahman
searchWord('الرحيم');    // Search for Rahim
```

## Project Structure

```
quran-search-api/
├── src/
│   ├── config/
│   │   └── index.js          # Configuration settings
│   ├── middleware/
│   │   ├── errorHandler.js   # Error handling middleware
│   │   ├── notFoundHandler.js # 404 handler
│   │   └── validation.js     # Input validation
│   ├── routes/
│   │   └── search.js         # Search endpoint
│   ├── services/
│   │   └── searchService.js  # Search logic
│   ├── utils/
│   │   └── normalize.js      # Arabic text normalization
│   └── index.js              # Main application entry point
├── data/
│   ├── quran.json           # Quran text data
│   └── index.js             # Index builder script
├── package.json
└── README.md
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Data File Paths
QURAN_DATA_PATH=./data/quran.json
INDEX_DATA_PATH=./data/index.json

# API Configuration
MAX_SEARCH_RESULTS=1000
CACHE_TTL=3600

# Performance
REQUEST_TIMEOUT=30000
BODY_LIMIT=10mb

# Development
DEBUG_MODE=false
ENABLE_MORGAN_LOGGING=true
```

## Performance

- **With Index**: Searches are extremely fast (milliseconds)
- **Without Index**: Searches scan the entire Quran (slower but still functional)
- **Word Variations**: Automatically searches for both forms (with/without ال prefix)

## Arabic Text Normalization

The API automatically normalizes Arabic text by:
- Removing diacritics (تشكيل)
- Standardizing character variations (أ, إ, آ, ٱ → ا)
- Converting تاء مربوطة to هاء
- Converting ياء to ي
- Converting hamza variations (ؤ, ئ → و)
- Removing extra spaces and tatweel (ـ)

## Current API Status

The API currently provides **one endpoint**:
- `GET /api/search?word=<arabic_word>` - Search for Arabic words in the Quran

