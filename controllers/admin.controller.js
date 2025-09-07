import User from "../models/user.model.js";
import Post from "../models/post.model.js";

// ✅ Get all users (no password)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete a user
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Promote/demote user role
export const promoteUser = async (req, res) => {
  try {
    const { role } = req.body; // "admin" or "user"
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Role updated", user });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Suspend user
export const suspendUser = async (req, res) => {
  try {
    const { days, reason } = req.body;
    const until = new Date();
    until.setDate(until.getDate() + (days || 7)); // default 7 days

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isSuspended: true,
        suspendedUntil: until,
        suspensionReason: reason || "Violation of rules",
      },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User suspended", user });
  } catch (err) {
    console.error("Error suspending user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Unsuspend user
export const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isSuspended: false,
        suspendedUntil: null,
        suspensionReason: "",
      },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User unsuspended", user });
  } catch (err) {
    console.error("Error unsuspending user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete post
export const deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// controllers/admin.controller.js (where you already manage users/posts)

export const getReportedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ "reports.0": { $exists: true } }) // only posts with reports
      .populate("user", "name email")
      .populate("reports.user", "name email") // show who reported
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Error fetching reported posts:", err);
    res.status(500).json({ message: "Server error" });
  }
};
