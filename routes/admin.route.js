// routes/admin.routes.js
import express from "express";
import { isAuthenticated, requireRole } from "../middleware/auth.js";
import { getAllUsers } from "../controllers/admin/getAllUsers.controller.js";
import { deleteUser } from "../controllers/admin/deleteUser.controller.js";
import { promoteUser } from "../controllers/admin/promoteUser.controller.js";
import { suspendUser } from "../controllers/admin/suspendUser.controller.js";
import { unsuspendUser } from "../controllers/admin/unsuspendUser.controller.js";
import { getAllPosts } from "../controllers/admin/getAllPosts.controller.js";
import { deletePost } from "../controllers/admin/deletePost.controller.js";
import { getReportedPosts } from "../controllers/admin/getReportedPosts.controller.js";

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
); // new

export default router;
