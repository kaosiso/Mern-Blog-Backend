import Comment from "../../models/comment.model.js";

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
