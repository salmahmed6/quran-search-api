import express from "express";
import { searchService } from "../services/searchService.js";
import { validateSearchQuery } from "../middleware/validation.js";

const router = express.Router();

router.get("/search", validateSearchQuery, async (req, res, next) => {
  try {
    const { word } = req.query;
    const results = await searchService.searchWord(word);
    
    res.json({
      success: true,
      data: results,
      meta: {
        timestamp: new Date().toISOString(),
        query: word,
        resultsCount: results.occurrences_count,
        totalOccurrences: results.total_count
      }
    });
  } catch (error) {
    next(error);
  }
});


router.post("/search/batch", async (req, res, next) => {
  try {
    const { words } = req.body;
    
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Words array is required and must not be empty",
          status: 400
        }
      });
    }

    const results = await Promise.all(
      words.map(async (word) => {
        try {
          const result = await searchService.searchWord(word);
          return {
            word,
            success: true,
            data: result
          };
        } catch (error) {
          return {
            word,
            success: false,
            error: error.message
          };
        }
      })
    );

    res.json({
      success: true,
      data: results,
      meta: {
        timestamp: new Date().toISOString(),
        totalQueries: words.length,
        successfulQueries: results.filter(r => r.success).length,
        failedQueries: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
