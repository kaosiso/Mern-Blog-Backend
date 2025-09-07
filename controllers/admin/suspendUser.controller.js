import User from "../../models/user.model.js";

export const suspendUser = async (req, res) => {
  try {
    const { days, reason } = req.body;
    const until = new Date();
    until.setDate(until.getDate() + (days || 7));

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isSuspended: true,
        suspendedUntil: until,
        suspensionReason: reason || "Violation of rules",
      },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User suspended", user });
  } catch (err) {
    console.error("Error suspending user:", err);
    res.status(500).json({ message: "Server error" });
  }
};
