import "dotenv/config";
import mongoose from "mongoose";
import Vendor from "../models/Vendor.js";
import User from "../models/User.js";

const categories = [
  "Electrician",
  "Plumber",
  "Painter",
  "Carpenter",
  "Cleaner",
  "Mechanic",
  "Tailor",
  "AC Repair",
  "Generator Repair",
  "Phone Repair",
];

const areas = [
  "Odogunyan, Ikorodu",
  "Ketu, Lagos",
  "Yaba, Lagos",
  "Surulere, Lagos",
  "Lekki, Lagos",
  "Ikeja, Lagos",
  "Ajah, Lagos",
  "Gbagada, Lagos",
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randPhone() {
  // Nigerian-ish phone: 080 + 8 digits
  const n = Math.floor(Math.random() * 90000000) + 10000000;
  return `080${n}`;
}

function randRating() {
  return Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 - 5.0
}

async function ensureAdmin() {
  // Create or find an admin owner for seeded vendors
  const email = "seed-admin@vendorly.dev";
  let admin = await User.findOne({ email });

  if (!admin) {
    admin = await User.create({
      fullName: "Seed Admin",
      email,
      passwordHash: "seeded_password_hash_only", // not used for login
      role: "admin",
    });
  }

  return admin;
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI in server/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected for seeding");

  const admin = await ensureAdmin();

  // Optional: clear vendors first
  const CLEAR_FIRST = true;
  if (CLEAR_FIRST) {
    await Vendor.deleteMany({});
    console.log("🧹 Cleared existing vendors");
  }

  const total = 50;
  const statuses = ["approved", "pending", "suspended"];

  const vendors = Array.from({ length: total }).map((_, i) => {
    const category = rand(categories);
    const name = `Vendorly ${category} ${i + 1}`;
    const status = rand(statuses);

    return {
      name,
      category,
      phone: randPhone(),
      address: rand(areas),
      rating: randRating(),
      ownerId: admin._id,
      status,
      moderationReason:
        status === "suspended" ? "Auto-seed: flagged for review." : "",
    };
  });

  await Vendor.insertMany(vendors);
  console.log(`🌱 Seeded ${total} vendors`);

  await mongoose.disconnect();
  console.log("👋 Done");
}

main().catch((err) => {
  console.error("❌ Seeding error:", err.message);
  process.exit(1);
});
