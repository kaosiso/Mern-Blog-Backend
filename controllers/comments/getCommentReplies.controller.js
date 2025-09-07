import Comment from "../../models/comment.model.js";

export const getCommentReplies = async (req, res) => {
  const { id } = req.params; // parent comment id
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  try {
    const parentComment = await Comment.findById(id);
    if (!parentComment)
      return res.status(404).json({ message: "Parent comment not found" });

    const totalReplies = await Comment.countDocuments({ parent: id });
    const replies = await Comment.find({ parent: id })
      .populate("user", "name image")
      .sort({ createdAt: 1 })
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
