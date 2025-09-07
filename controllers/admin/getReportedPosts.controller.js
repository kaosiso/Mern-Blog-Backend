import Post from "../../models/post.model.js";

export const getReportedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ "reports.0": { $exists: true } })
      .populate("user", "name email")
      .populate("reports.user", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Error fetching reported posts:", err);
    res.status(500).json({ message: "Server error" });
  }
};
