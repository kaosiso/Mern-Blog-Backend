import ImageKit from "imagekit";

// ✅ Lazy initialization to ensure env variables exist before creating instance
let imagekit = null;

export const getImageKit = () => {
  if (!imagekit) {
    const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } =
      process.env;

    if (
      !IMAGEKIT_PUBLIC_KEY ||
      !IMAGEKIT_PRIVATE_KEY ||
      !IMAGEKIT_URL_ENDPOINT
    ) {
      throw new Error(
        "❌ Missing ImageKit environment variables. Check your .env file."
      );
    }

    imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY,
      privateKey: IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    });
  }

  return imagekit;
};
