import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    slug: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },

    token: { type: String, default: null },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },

    // ✅ Add these two
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    savedPosts: {
      type: [String],
      default: [],
    },
    about: { type: String, default: "" },

    // ---- suspension fields ----
    isSuspended: { type: Boolean, default: false },
    suspendedUntil: { type: Date, default: null },
    suspensionReason: { type: String, default: "" },
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);

export default User;
