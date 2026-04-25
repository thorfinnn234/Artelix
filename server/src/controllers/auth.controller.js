import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import { RegisterSchema, loginSchema } from "../validators/auth.validators.js";

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing in .env");

  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    secret,
    { expiresIn: "7d" }
  );
}

export async function Register(req, res) {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
  }

  const { fullName, email, password } = parsed.data;
  const role = parsed.data.role ?? "user";
  const vendorInput = parsed.data.vendor;

  // Prevent random people from signing up as admin
  if (role === "admin") {
    return res.status(403).json({ message: "Admin Register is not allowed." });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already Registered." });

  // If vendor role: vendor details must exist
  if (role === "vendor") {
    if (!vendorInput) {
      return res.status(400).json({ message: "Vendor details are required for vendor Register." });
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Create user first
  const user = await User.create({
    fullName,
    email,
    passwordHash,
    role,
  });

  // If vendor → create vendor listing with pending status
  let vendor = null;
  if (role === "vendor") {
    vendor = await Vendor.create({
      name: vendorInput.name,
      category: vendorInput.category,
      phone: vendorInput.phone,
      address: vendorInput.address,
      rating: 0,
      ownerId: user._id,
      status: "pending",
    });

    user.vendorId = vendor._id;
    await user.save();
  }

  const token = signToken(user);

  return res.status(201).json({
    message: "Register successful",
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      avatar: user.avatar,
    },
    vendor,
  });
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid email or password." });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid email or password." });

  const token = signToken(user);

  return res.json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      avatar: user.avatar,
    },
  });
}
