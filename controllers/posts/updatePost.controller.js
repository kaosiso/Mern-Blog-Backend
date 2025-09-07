import Post from "../../models/post.model.js";

export const updatePost = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Login required" });

  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug });

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not allowed to edit this post" });

    const updatedPost = await Post.findOneAndUpdate(
      { slug },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
