import Comment from "../../models/comment.model.js";

export const reportComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() === userId)
      return res
        .status(400)
        .json({ message: "You cannot report your own comment" });
    if (comment.reports.includes(userId))
      return res
        .status(400)
        .json({ message: "You already reported this comment" });

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
