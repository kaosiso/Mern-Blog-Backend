import User from "../../models/user.model.js";
import { getImageKit } from "../../lib/imagekit.js";

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
