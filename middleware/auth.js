import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // <-- import User model

export const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔍 Incoming auth server header:", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔑 Load user from DB
    const dbUser = await User.findById(decoded.id).select(
      "role isSuspended suspendedUntil suspensionReason"
    );

    if (!dbUser) {
      return res.status(401).json({ message: "User not found" });
    }

    // ⏳ Auto-unsuspend if suspension expired
    if (dbUser.isSuspended && dbUser.suspendedUntil) {
      const now = new Date();
      if (dbUser.suspendedUntil <= now) {
        dbUser.isSuspended = false;
        dbUser.suspendedUntil = null;
        dbUser.suspensionReason = "";
        await dbUser.save();
      }
    }

    // 🚫 Block access if still suspended
    if (dbUser.isSuspended) {
      return res.status(403).json({
        message: "Account suspended",
        suspendedUntil: dbUser.suspendedUntil,
        reason: dbUser.suspensionReason,
      });
    }

    // Attach full user object (not just token payload)
    req.user = { id: dbUser._id.toString(), role: dbUser.role };
    next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
};
