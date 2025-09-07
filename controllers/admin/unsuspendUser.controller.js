import User from "../../models/user.model.js";

export const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: false, suspendedUntil: null, suspensionReason: "" },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User unsuspended", user });
  } catch (err) {
    console.error("Error unsuspending user:", err);
    res.status(500).json({ message: "Server error" });
  }
};
