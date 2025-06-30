import express from "express";
import bodyParser from "body-parser";
import { db } from "./database/index.js"; // Ensure this function connects to your database
import { userRouter, authRouter } from "./route/index.js"; // Combined import for clarity
import dotenv from "dotenv";
import { authenticateToken } from "./middleware/token-middleware.js";
import router from "./route/uploadRoutes.js";
import { createUploadsFolder } from "./security/helper.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Use the port from environment variables or default to 4000
const port = process.env.PORT || 4000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Apply authentication middleware to specific routes
app.use("/api/users", userRouter); // Public route
app.use("/api/auth", authRouter); // Public route
app.use(authenticateToken); // Apply to routes that need authentication
app.use("/api/file", router);

// Create uploads folder if it doesn't exist
createUploadsFolder();

// Start the server and connect to the database
app.listen(3000, function () {
  console.log(`Project running on port 3000`);
  db();
});
