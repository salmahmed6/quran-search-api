# Quran Search API

A simple and fast API to search Arabic words in the Quran JSON and return occurrences ordered by surah.

## Features

- 🔍 Fast Arabic word search in Quran
- 📊 Results ordered by surah and ayah number
- 🔄 Batch search for multiple words
- 📈 Health monitoring endpoint
- 🚀 Pre-built index for faster searches
- 🛡️ Input validation and error handling
- 📚 Comprehensive API documentation

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

### Search Single Word
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
    "total_count": 2699,
    "occurrences_count": 2699,
    "occurrences": [
      {
        "surah_number": 1,
        "surah_name": "سورة 1",
        "ayah": 1,
        "text": "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
        "count_in_ayah": 1
      }
    ]
  }
}
```

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
│   ├── index.json           # Pre-built search index (generated)
│   └── index.js             # Index builder script
├── package.json
└── README.md
```

## Configuration

Environment variables can be set in a `.env` file:

```env
PORT=3000
NODE_ENV=development
QURAN_DATA_PATH=./data/quran.json
INDEX_DATA_PATH=./data/index.json
MAX_SEARCH_RESULTS=1000
CACHE_TTL=3600
```

## Performance

- **With Index**: Searches are extremely fast (milliseconds)
- **Without Index**: Searches scan the entire Quran (slower but still functional)
- **Batch Search**: Processes multiple words in parallel

## Arabic Text Normalization

The API automatically normalizes Arabic text by:
- Removing diacritics (تشكيل)
- Standardizing character variations (أ, إ, آ → ا)
- Converting تاء مربوطة to هاء
- Removing extra spaces

## Error Handling

The API provides comprehensive error handling:
- Input validation errors (400)
- Resource not found (404)
- Server errors (500)
- Detailed error messages with timestamps

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
