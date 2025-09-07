import Comment from "../../models/comment.model.js";

export const getPostComments = async (req, res) => {
  const { postId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  try {
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
