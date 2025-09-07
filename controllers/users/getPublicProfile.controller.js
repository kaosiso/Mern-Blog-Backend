import User from "../../models/user.model.js";
import Post from "../../models/post.model.js";

export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ slug: req.params.slug }).select(
      "name image about slug"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ user: user._id, status: "published" })
      .sort({ createdAt: -1 })
      .select("title description slug coverImage");

    res.json({ user, posts });
  } catch (err) {
    console.error("Error fetching public profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};
