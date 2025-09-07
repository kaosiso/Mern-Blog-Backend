import Post from "../models/post.model.js";
import jwt from "jsonwebtoken";
import { getImageKit } from "../lib/imagekit.js";

// Get all posts
// export const getPosts = async (req, res) => {
//   try {
//     const posts = await Post.find({ status: "published" })
//       .populate("user", "name image slug")
//       .sort({ createdAt: -1 });

//     res.status(200).json(posts);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" })
      .populate("user", "name image slug") // fetch author info
      .sort({ createdAt: -1 })
      .lean();

    // Filter out posts with missing user
    const safePosts = posts.filter((post) => post.user !== null);

    res.status(200).json(safePosts);
  } catch (err) {
    console.error("getPosts error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id }) 
      .populate("user", "name image")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single post by slug
export const getPost = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug }).populate("user", "name image"); // ✅ fetch name & image from User

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Create Post
export const createPost = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Login required" });

  const imagekit = getImageKit();

  try {
    // Generate unique slug
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

    // Upload cover image if provided
    let coverImageUrl = null;
    if (req.file) {
      try {
        const base64Image = req.file.buffer.toString("base64");
        const uploadedImage = await imagekit.upload({
          file: base64Image,
          fileName: `${slug}-cover.png`,
        });
        coverImageUrl = uploadedImage.url;
      } catch (err) {
        console.error("ImageKit upload failed:", err.message);
      }
    }

    const newPost = new Post({
      user: req.user.id,
      slug,
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      content: req.body.content,
      coverImage: coverImageUrl,
      status: req.body.status || "draft", // default to draft
    });

    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update Post (only owner) by slug
export const updatePost = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "You must be logged in to update a post" });
  }

  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== req.user.id)
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this post" });

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

// ✅ Delete Post (only owner) by slug
export const deletePost = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "You must be logged in to delete a post" });
  }

  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== req.user.id)
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this post" });

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ ImageKit Upload Auth
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

// ✅ Upload file to ImageKit
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

export const getSearchPosts = async (req, res) => {
  try {
    const { search, category } = req.query;

    // ✅ Base query (only published posts)
    let query = { status: "published" };

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } }, // 👈 include slug search
      ];
    }

    // ✅ Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // ✅ Fetch posts with pagination
    const posts = await Post.find(query)
      .populate("user", "name image slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);

    // ✅ Filter out orphaned posts
    const safePosts = posts.filter((post) => post.user !== null);

    res.status(200).json({
      posts: safePosts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getPosts error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
