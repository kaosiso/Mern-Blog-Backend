import express from "express";

import {
  getPostComments,
  addComment,
  editComment,
  deleteComment,
  reportComment,
  getCommentReplies,
} from "../controllers/comments/index.js";

import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// More specific routes must come before the generic ones
router.get("/:id/replies", isAuthenticated, getCommentReplies);

router.get("/:postId", isAuthenticated, getPostComments);
router.post("/:postId", isAuthenticated, addComment);

router.put("/:id", isAuthenticated, editComment);
router.delete("/:id", isAuthenticated, deleteComment);
router.post("/:id/report", isAuthenticated, reportComment);


export default router;
