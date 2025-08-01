import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Middleware to verify JWT token
export function authenticateToken(req, res, next) {
  // Skip token verification for the login route
  if (req.path === "/api/auth/login") {
    return next();
  }

  // Get token from Authorization header
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .send({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.secretkey, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token.",
        error: err.message
      });
    }
    req.user = decoded; // Attach decoded payload to request object
    next(); // Proceed to the next middleware or route handler
  });
}

// Middleware to check if user is admin
export function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided."
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required."
    });
  }

  next();
}
