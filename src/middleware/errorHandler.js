export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let statusCode = 500;
  let message = "Internal Server Error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error: " + err.message;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (err.code === "ENOENT") {
    statusCode = 404;
    message = "Resource not found";
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    }
  });
};
