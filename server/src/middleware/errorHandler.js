export function notFound(req, res, next) {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
}

export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;

  res.status(status).json({
    message: err.message || "Server error",
    // Hide stack in production
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}
