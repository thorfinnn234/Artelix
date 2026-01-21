import express from "express";
import cors from "cors";
import "dotenv/config";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import meRoutes from "./routes/me.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import savedRoutes from "./routes/saved.routes.js";
import appealRoutes from "./routes/appeal.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";




import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/me/saved", savedRoutes);
app.use("/api/vendors", appealRoutes);
app.use(notFound);
app.use(errorHandler);



// Health check route
app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "Vendorly API" });
});

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
