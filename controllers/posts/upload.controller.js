import { getImageKit } from "../../lib/imagekit.js";

export const uploadAuth = (req, res) => {
  try {
    const imagekit = getImageKit();
    const authParams = imagekit.getAuthenticationParameters();
    res.status(200).json(authParams);
  } catch (err) {
    console.error("ImageKit error:", err);
    res.status(500).json({ message: "ImageKit auth error" });
  }
};

export const uploadFile = async (req, res) => {
  try {
    const imagekit = getImageKit();
    const base64File = req.file.buffer.toString("base64");
    const fileName = req.file.originalname;

    const uploadResponse = await imagekit.upload({
      file: base64File,
      fileName,
    });

    res.status(200).json({ url: uploadResponse.url });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ message: "File upload failed", error: err.message });
  }
};
