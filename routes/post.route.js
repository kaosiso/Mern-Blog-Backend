import express from "express";
import multer from "multer";
import {
  getPosts,
  getPost,
  createPost,
  deletePost,
  uploadAuth,
  uploadFile,
  updatePost,
  getSearchPosts,
} from "../controllers/post.controllers.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// All routes require login now
router.get("/", isAuthenticated, getPosts);
router.get("/search", isAuthenticated, getSearchPosts);

router.post("/upload", isAuthenticated, upload.single("file"), uploadFile);
router.get("/upload/auth", isAuthenticated, uploadAuth);

router.post("/", isAuthenticated, upload.single("coverImage"), createPost);
router.get("/:slug", isAuthenticated, getPost);
router.put("/:slug", isAuthenticated, updatePost);
router.delete("/:slug", isAuthenticated, deletePost);

export default router;
