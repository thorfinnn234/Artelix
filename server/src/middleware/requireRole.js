export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const userRole = String(req.user.role || "").toLowerCase();
    const allowedRoles = roles.map((role) => String(role).toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}
