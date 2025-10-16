export const validateSearchQuery = (req, res, next) => {
  const { word } = req.query;
  
  if (!word) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Query parameter 'word' is required",
        status: 400,
        example: "GET /api/search?word=الله"
      }
    });
  }

  if (typeof word !== "string") {
    return res.status(400).json({
      success: false,
      error: {
        message: "Query parameter 'word' must be a string",
        status: 400
      }
    });
  }

  if (word.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Query parameter 'word' cannot be empty",
        status: 400
      }
    });
  }

  next();
};
