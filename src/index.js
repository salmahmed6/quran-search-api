import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import searchRoutes from "./routes/search.js";

const app = express();

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan("dev"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes - Only search route
app.use("/api", searchRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(config.PORT, () => {
  console.log(` Quran Search API listening on http://localhost:${config.PORT}`);   
  console.log(`Search endpoint: http://localhost:${config.PORT}/api/search?word=<arabic_word>`);
});

export default app;
