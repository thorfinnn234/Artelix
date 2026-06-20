import express from "express";
import path from "path";
import cors from "cors";
import "dotenv/config";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./src/routes/auth.routes.js";
import meRoutes from "./src/routes/me.routes.js";
import artisanRoutes from "./src/routes/artisan.routes.js";
import savedRoutes from "./src/routes/saved.routes.js";
import appealRoutes from "./src/routes/appeal.routes.js";
import conversationRoutes from "./src/routes/conversation.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";
import passport from "./src/config/passport.js";
import adminRoutes from "./src/routes/admin.routes.js";




import { connectDB } from "./src/config/db.js";

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/artisan", artisanRoutes);
app.use("/api/artisan", artisanRoutes); // legacy route support
app.use("/api/me/saved", savedRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/artisan", appealRoutes);
app.use("/api/artisan", appealRoutes); // legacy route support
app.use("/api/admin", adminRoutes);

// Health check route
app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "Artelix API" });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is missing in .env");
    process.exit(1);
  }

  await connectDB(uri);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();
