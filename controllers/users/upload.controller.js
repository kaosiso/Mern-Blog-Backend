import { getImageKit } from "../../lib/imagekit.js";

export const uploadAuth = async (req, res) => {
  try {
    const imagekit = getImageKit();
    res.json(imagekit.getAuthenticationParameters());
  } catch (err) {
    console.error("❌ uploadAuth error:", err);
    res.status(500).json({ message: "Auth error" });
  }
};

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
