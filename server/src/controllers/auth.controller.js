import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Artisan from "../models/artisan.js";
import { RegisterSchema, loginSchema } from "../validators/auth.validators.js";
import {
  validateDetailedAddress,
  validateNigerianPhone,
} from "../utils/profileValidation.js";

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing in .env");
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    secret,
    { expiresIn: "7d" }
  );
}

function serializeUser(user) {
  return {
    id:                      user._id,
    fullName:                user.fullName,
    email:                   user.email,
    role:                    user.role,
    artisanId:               user.ArtisanId,
    avatar:                  user.avatar,
    phone:                   user.phone,
    location:                user.location,
    emailVerified:           user.emailVerified,
    googleConnected:         Boolean(user.googleId),
    isSuspended:             user.isSuspended,
    lastLoginAt:             user.lastLoginAt,
    notificationPreferences: user.notificationPreferences,
    savedArtisanCount:       user.savedArtisanIds?.length ?? 0,
    createdAt:               user.createdAt,
    updatedAt:               user.updatedAt,
  };
}

export async function Register(req, res) {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      message: "Invalid input", 
      errors: parsed.error.flatten() 
    });
  }

  const { fullName, email, password } = parsed.data;
  const role         = parsed.data.role ?? "user";
  const artisanInput = parsed.data.artisan; 

  if (role === "admin") {
    return res.status(403).json({ message: "Admin Register is not allowed." });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already Registered." });

  // ← all lowercase
  if (role === "artisan") {
    if (!artisanInput) {
      return res.status(400).json({ 
        message: "Artisan details are required for artisan registration." 
      });
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    passwordHash,
    role,
  });

  let artisan = null;
  if (role === "artisan") { // ← lowercase
    const phoneResult = validateNigerianPhone(artisanInput.phone);
    const addressResult = validateDetailedAddress(artisanInput.address);

    artisan = await Artisan.create({
      name:     artisanInput.name,
      category: artisanInput.category,
      phone:    phoneResult.value,
      address:  addressResult.value,
      rating:   0,
      ownerId:  user._id,
      status:   "pending",
    });

    user.ArtisanId = artisan._id;
    await user.save();
  }

  const token = signToken(user);

  return res.status(201).json({
    message: "Register successful",
    token,
    user: serializeUser(user),
    artisan,
  });
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      message: "Invalid input", 
      errors: parsed.error.flatten() 
    });
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid email or password." });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid email or password." });

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);

  return res.json({
    message: "Login successful",
    token,
    user: serializeUser(user),
  });
}
