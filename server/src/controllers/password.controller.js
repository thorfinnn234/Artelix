import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";
import { passwordResetTemplate } from "../utils/emailTemplates.js";

// helper
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  const { email } = req.body;

  const genericMsg = "If that email exists, a reset code has been sent.";

  // ✅ normalize email
  const emailClean = String(email || "")
    .trim()
    .toLowerCase();
  if (!emailClean) {
    return res.status(200).json({ message: genericMsg });
  }

  const user = await User.findOne({ email: emailClean });
  if (!user) {
    return res.status(200).json({ message: genericMsg });
  }

  // ✅ cooldown: 60 seconds
  if (user.passwordResetLastSentAt) {
    const diff = Date.now() - new Date(user.passwordResetLastSentAt).getTime();

    if (diff < 60 * 1000) {
      return res.status(200).json({
        message: "Please wait a minute before requesting another code.",
      });
    }
  }

  const code = generateCode();

  const codeHash = crypto.createHash("sha256").update(code).digest("hex");

  user.passwordResetCodeHash = codeHash;
  user.passwordResetExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  user.passwordResetAttempts = 0;
  user.passwordResetLastSentAt = new Date();

  await user.save();

  const { html, text } = passwordResetTemplate({ code });

  await sendEmail({
    to: emailClean,
    subject: "Artelix Password Reset Code",
    html,
    text,
  });

  return res.status(200).json({ message: genericMsg });
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const user = await User.findOne({ email });

  if (!user || !user.passwordResetCodeHash || !user.passwordResetExpiresAt) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  if (user.passwordResetExpiresAt < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  const codeHash = crypto.createHash("sha256").update(code).digest("hex");

  if (codeHash !== user.passwordResetCodeHash) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);

  // clear reset fields
  user.passwordResetCodeHash = undefined;
  user.passwordResetExpiresAt = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
}
