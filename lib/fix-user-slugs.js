import mongoose from "mongoose";
import User from "../models/user.model.js"; // adjust path

// connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/your-db-name", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const generateSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

const fixUsersWithoutSlug = async () => {
  const users = await User.find({ slug: { $exists: false } });
  for (const user of users) {
    user.slug = generateSlug(user.name);
    await user.save();
  }
  console.log("Updated slugs for", users.length, "users");
  mongoose.connection.close();
};

fixUsersWithoutSlug();
