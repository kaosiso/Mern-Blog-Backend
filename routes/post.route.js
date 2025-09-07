import express from "express";
import multer from "multer";
import { isAuthenticated } from "../middleware/auth.js";

// Import controllers individually
import { getPosts } from "../controllers/posts/getPosts.controller.js";
import { getSearchPosts } from "../controllers/posts/searchPosts.controller.js";
import { createPost } from "../controllers/posts/createPost.controller.js";
import { updatePost } from "../controllers/posts/updatePost.controller.js";
import { deletePost } from "../controllers/posts/deletePost.controller.js";
import { getPost } from "../controllers/posts/getPost.controller.js";
import {
  uploadAuth,
  uploadFile,
} from "../controllers/posts/upload.controller.js";

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
