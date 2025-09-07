import slugify from "slugify";
import Post from "../models/post.model.js"; // adjust path if needed

export async function generateUniqueSlug(title) {
  let slug = slugify(title, { lower: true, strict: true });
  let exists = await Post.findOne({ slug });

  let counter = 1;
  while (exists) {
    const newSlug = `${slug}-${counter}`;
    exists = await Post.findOne({ slug: newSlug });
    if (!exists) {
      slug = newSlug;
      break;
    }
    counter++;
  }

  return slug;
}
