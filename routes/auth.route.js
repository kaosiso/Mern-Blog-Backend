// server/routes/auth.route.js
import express from "express";
import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controllers.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);

// Password reset routes
router.post("/forgot-password", requestPasswordReset); // request a password reset email
router.post("/reset-password/:token", resetPassword); // reset password with token

// Get current user
router.get("/me", isAuthenticated, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
