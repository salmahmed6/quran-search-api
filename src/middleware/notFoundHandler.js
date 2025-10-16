export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      status: 404,
      timestamp: new Date().toISOString(),
      availableRoutes: [
        "GET /api/search?word=<arabic_word>"
      ]
    }
  });
};
