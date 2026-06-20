import User from "../models/User.js";
import Artisan from "../models/artisan.js";

// GET /api/admin/stats
export async function getStats(req, res) {
  try {
    const [
      totalUsers,
      totalArtisan,
      pendingArtisan,
      approvedArtisan,
      suspendedArtisan,
      rejectedArtisan,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Artisan.countDocuments(),
      Artisan.countDocuments({ status: "pending" }),
      Artisan.countDocuments({ status: "approved" }),
      Artisan.countDocuments({ status: "suspended" }),
      Artisan.countDocuments({ status: "rejected" }),
    ]);

    res.json({
      totalUsers,
      totalArtisan,
      pendingArtisan,
      approvedArtisan,
      suspendedArtisan,
      rejectedArtisan,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to get stats" });
  }
}

// GET /api/admin/users
export async function listUsers(req, res) {
  try {
    const {
      search = "",
      page   = "1",
      limit  = "12",
    } = req.query;

    const pageNum  = Math.max(parseInt(page)  || 1,  1);
    const limitNum = Math.min(parseInt(limit) || 12, 50);
    const skip     = (pageNum - 1) * limitNum;

    const filter = { role: "user" };
    if (search.trim()) {
      filter.$or = [
        { fullName: { $regex: search.trim(), $options: "i" } },
        { email:    { $regex: search.trim(), $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter)
          .select("-passwordHash")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      items,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to get users" });
  }
}

// DELETE /api/admin/users/:id
export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
}

// PATCH /api/admin/users/:id/suspend
export async function suspendUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isSuspended = true;
    await user.save();
    res.json({ message: "User suspended", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to suspend user" });
  }
}

// PATCH /api/admin/users/:id/unsuspend
export async function unsuspendUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isSuspended = false;
    await user.save();
    res.json({ message: "User unsuspended", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to unsuspend user" });
  }
}