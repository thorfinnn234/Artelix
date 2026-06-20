export function normalizeRole(role) {
  const value = String(role || "user").trim().toLowerCase();

  if (value === "artisan") return "artisan";
  if (value === "admin") return "admin";

  return "user";
}

export function dashboardPathForRole(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") return "/admin/dashboard";
  if (normalizedRole === "artisan") return "/artisan/dashboard";

  return "/user/home";
}