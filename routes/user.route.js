import express from "express";
import multer from "multer";
import { isAuthenticated } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  uploadAuth,
  uploadFile,
  getUserPosts,
  getPublicProfile,
} from "../controllers/user.controllers.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require login now
router.get("/posts", isAuthenticated, getUserPosts);
router.get("/profile", isAuthenticated, getProfile);
router.put("/profile", isAuthenticated, upload.single("image"), updateProfile);

router.get("/upload/auth", isAuthenticated, uploadAuth);
router.post("/upload", isAuthenticated, upload.single("file"), uploadFile);

// Even public profiles now require login
router.get("/:slug", isAuthenticated, getPublicProfile);

export default router;
