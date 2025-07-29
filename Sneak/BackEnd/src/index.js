import express from "express";
import bodyParser from "body-parser";
import { db } from "./database/index.js"; 
import { userRouter, authRouter, productRoutes, orderRoutes, cartRoutes, refundRoutes } from "./route/index.js";
import dotenv from "dotenv";
import { authenticateToken } from "./middleware/token-middleware.js";
import router from "./route/uploadRoutes.js";
import { createUploadsFolder } from "./security/helper.js";
import cors from 'cors';
import { User } from "./models/user/User.js";
import bcrypt from "bcrypt";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Use the port from environment variables or default to 3000
const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Public routes (no authentication required)
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productRoutes); // Public product browsing

// Apply authentication middleware to protected routes
app.use(authenticateToken);
app.use("/api/file", router);
app.use("/api/cart", cartRoutes); // Protected cart routes
app.use("/api/orders", orderRoutes); // Protected order routes
app.use("/api/refunds", refundRoutes); // Protected refund routes


// Create uploads folder if it doesn't exist
createUploadsFolder();

// Start the server and connect to the database
app.listen(port, function () {
  console.log(`Project running on port ${port}`);
  db().then(async () => {
    // Seed default admin user
    const adminEmail = 'sushantdhakal@gmail.com';
    const adminPassword = 'admin123';
    const admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: 'Default Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default admin user created.');
    } else {
      console.log('Default admin user already exists.');
    }
  });
});
