import Post from "../../models/post.model.js";

export const getSearchPosts = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { status: "published" };

    if (category && category !== "All") query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const posts = await Post.find(query)
      .populate("user", "name image slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);
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
