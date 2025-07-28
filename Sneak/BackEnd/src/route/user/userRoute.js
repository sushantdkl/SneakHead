import express from "express";
import { userController } from "../../controller/user/userController.js";
import { authenticateToken } from "../../middleware/token-middleware.js";

const router = express.Router();

// Public routes
router.post("/", userController.create);

// Protected routes (admin only)
router.get("/", authenticateToken, userController.getAll);
router.get("/:id", authenticateToken, userController.getById);
router.put("/:id", authenticateToken, userController.update);
router.delete("/:id", authenticateToken, userController.deleteById);

export { router as userRouter };
