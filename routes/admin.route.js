// routes/admin.routes.js
import express from "express";
import { isAuthenticated, requireRole } from "../middleware/auth.js";
import {
  getAllUsers,
  deleteUser,
  promoteUser,
  getAllPosts,
  deletePost,
  getReportedPosts, // ✅ new
} from "../controllers/admin.controllers.js";

const router = express.Router();

// Users
router.get("/users", isAuthenticated, requireRole("admin"), getAllUsers);
router.delete("/users/:id", isAuthenticated, requireRole("admin"), deleteUser);
router.put(
  "/users/:id/promote",
  isAuthenticated,
  requireRole("admin"),
  promoteUser
);

// Posts
router.get("/posts", isAuthenticated, requireRole("admin"), getAllPosts);
router.delete("/posts/:id", isAuthenticated, requireRole("admin"), deletePost);
router.get(
  "/posts/reported",
  isAuthenticated,
  requireRole("admin"),
  getReportedPosts
); // ✅ new

export default router;
