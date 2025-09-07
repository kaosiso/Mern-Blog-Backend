import Post from "../../models/post.model.js";
import { getImageKit } from "../../lib/imagekit.js";

export const createPost = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Login required" });

  const imagekit = getImageKit();

  try {
    let slug = req.body.title
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    let existingPost = await Post.findOne({ slug });
    let counter = 2;
    while (existingPost) {
      slug = `${slug}-${counter}`;
      existingPost = await Post.findOne({ slug });
      counter++;
    }

    let coverImageUrl = null;
    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");
      const uploadedImage = await imagekit.upload({
        file: base64Image,
        fileName: `${slug}-cover.png`,
      });
      coverImageUrl = uploadedImage.url;
    }

    const newPost = new Post({
      user: req.user.id,
      slug,
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      content: req.body.content,
      coverImage: coverImageUrl,
      status: req.body.status || "draft",
    });

    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
