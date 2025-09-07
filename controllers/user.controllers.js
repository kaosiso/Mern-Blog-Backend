import User from "../models/user.model.js";
import { getImageKit } from "../lib/imagekit.js"; // same helper you use in posts
import Post from "../models/post.model.js"


// ✅ Return user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ getProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update profile (with optional image upload)
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.about = req.body.about || user.about;


    if (req.file) {
      const imagekit = getImageKit();
      const uploadResponse = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: `${user._id}_profile.jpg`,
      });
      user.image = uploadResponse.url;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error("❌ updateProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Generate ImageKit Auth for frontend direct upload
export const uploadAuth = async (req, res) => {
  try {
    const imagekit = getImageKit();
    const result = imagekit.getAuthenticationParameters();
    res.json(result);
  } catch (err) {
    console.error("❌ uploadAuth error:", err);
    res.status(500).json({ message: "Auth error" });
  }
};

// (Optional) Handle profile uploads through backend
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const imagekit = getImageKit();
    const uploadResponse = await imagekit.upload({
      file: req.file.buffer.toString("base64"),
      fileName: req.file.originalname,
    });

    res.json(uploadResponse);
  } catch (err) {
    console.error("❌ uploadFile error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};
export const getUserPosts = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const posts = await Post.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /users/:slug
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
