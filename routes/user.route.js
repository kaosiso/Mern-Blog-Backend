import express from "express";
import multer from "multer";
import { isAuthenticated } from "../middleware/auth.js";
import { getProfile } from "../controllers/users/getProfile.controller.js";
import { updateProfile } from "../controllers/users/updateProfile.controller.js";
import {
  uploadAuth,
  uploadFile,
} from "../controllers/users/upload.controller.js";
import { getUserPosts } from "../controllers/users/getUserPosts.controller.js";
import { getPublicProfile } from "../controllers/users/getPublicProfile.controller.js";


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
