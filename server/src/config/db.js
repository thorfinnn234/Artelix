import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    mongoose.set("strictQuery", true);
    console.time("MongoDB connect");
    const conn = await mongoose.connect(uri);
    console.timeEnd("MongoDB connect");
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}