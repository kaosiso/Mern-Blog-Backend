// controllers/comment.controller.js
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";

// ✅ GET all top-level comments + their replies (paginated)
export const getPostComments = async (req, res) => {
  const { postId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  try {
    // only count top-level comments
    const totalComments = await Comment.countDocuments({
      post: postId,
      parent: null,
    });

    const comments = await Comment.find({ post: postId, parent: null })
      .populate("user", "name image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // fetch replies for each comment
    for (let comment of comments) {
      comment.replies = await Comment.find({ parent: comment._id })
        .populate("user", "name image")
        .sort({ createdAt: 1 })
        .lean();
    }

    res.status(200).json({
      comments,
      totalPages: Math.ceil(totalComments / limit),
      totalComments,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments", error });
  }
};

// ✅ POST a new comment or reply
export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { text, parentId } = req.body;
  const userId = req.user.id;

  if (!text)
    return res.status(400).json({ message: "Comment cannot be empty" });

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // if it's a reply, check parent exists
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    const newComment = new Comment({
      text,
      user: userId,
      post: postId,
      parent: parentId || null,
    });

    await newComment.save();
    await newComment.populate("user", "name image");

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment", error });
  }
};

// ✅ EDIT a comment (only owner or admin)
export const editComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!text)
    return res.status(400).json({ message: "Comment cannot be empty" });

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== userId && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this comment" });
    }

    comment.text = text;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Failed to update comment", error });
  }
};

// ✅ DELETE a comment (owner or admin)
export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== userId && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    // ✅ delete replies too
    await Comment.deleteMany({ parent: comment._id });
    await comment.deleteOne();

    res
      .status(200)
      .json({ message: "Comment and its replies deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment", error });
  }
};

// ✅ REPORT a comment (any user except the owner)
export const reportComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() === userId) {
      return res
        .status(400)
        .json({ message: "You cannot report your own comment" });
    }

    if (comment.reports.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You already reported this comment" });
    }

    comment.reports.push(userId);
    await comment.save();

    res
      .status(200)
      .json({
        message: "Comment reported successfully",
        reports: comment.reports.length,
      });
  } catch (error) {
    res.status(500).json({ message: "Failed to report comment", error });
  }
};


// ✅ GET paginated replies for a comment
export const getCommentReplies = async (req, res) => {
  const { id } = req.params; // parent comment id
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  try {
    const parentComment = await Comment.findById(id);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    const totalReplies = await Comment.countDocuments({ parent: id });

    const replies = await Comment.find({ parent: id })
      .populate("user", "name image")
      .sort({ createdAt: 1 }) // oldest first
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      replies,
      totalPages: Math.ceil(totalReplies / limit),
      totalReplies,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch replies", error });
  }
};
