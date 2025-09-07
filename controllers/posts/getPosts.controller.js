import Post from "../../models/post.model.js";

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" })
      .populate("user", "name image slug")
      .sort({ createdAt: -1 })
      .lean();

    const safePosts = posts.filter((post) => post.user !== null);

    res.status(200).json(safePosts);
  } catch (err) {
    console.error("getPosts error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
