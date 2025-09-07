import Comment from "../../models/comment.model.js";
import Post from "../../models/post.model.js";

export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { text, parentId } = req.body;
  const userId = req.user.id;

  if (!text)
    return res.status(400).json({ message: "Comment cannot be empty" });

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment)
        return res.status(404).json({ message: "Parent comment not found" });
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
