import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Thread from "../models/Thread.js";
import sendVerificationEmail from "../utils/sendEmail.js";
import authMiddleware from "../utils/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "novaai_secret_key_12345";

// Helper to generate 6-digit verification code
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register Route
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const code = generateOTP();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Check if this is Siyam Bubere
        const isSiyam = name.trim().toLowerCase() === "siyam bubere" || normalizedEmail === "siyam@novaai.com";

        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            isVerified: isSiyam, // Auto-verify Siyam Bubere
            isUnlimited: isSiyam, // Set unlimited access for Siyam Bubere
            verificationCode: isSiyam ? null : code,
            verificationCodeExpires: isSiyam ? null : expires
        });

        await newUser.save();

        if (isSiyam) {
            // Siyam doesn't need verification, return token immediately
            const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "30d" });
            return res.status(201).json({
                message: "Unlimited account created for Siyam Bubere successfully!",
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    isUnlimited: true
                }
            });
        }

        // Send email with verification code for regular users
        await sendVerificationEmail(normalizedEmail, code);

        const responsePayload = {
            message: "Registration successful. Verification email sent.",
            email: normalizedEmail
        };

        // If SMTP credentials aren't set in the env, return OTP in response for debugging ease
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            responsePayload.debugCode = code;
        }

        return res.status(201).json(responsePayload);

    } catch (err) {
        console.error("Register Error:", err);
        return res.status(500).json({ error: "Internal server error during registration." });
    }
});

// Verify Email Route
router.post("/verify", async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: "Missing email or verification code." });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "User is already verified." });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ error: "Invalid verification code." });
        }

        if (new Date() > user.verificationCodeExpires) {
            return res.status(400).json({ error: "Verification code expired. Please request a new one." });
        }

        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });

        return res.status(200).json({
            message: "Email verified successfully.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isUnlimited: user.isUnlimited
            }
        });

    } catch (err) {
        console.error("Verify Error:", err);
        return res.status(500).json({ error: "Internal server error during verification." });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password." });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        if (!user.isVerified) {
            // Not verified yet, generate new verification code
            const code = generateOTP();
            user.verificationCode = code;
            user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();

            await sendVerificationEmail(normalizedEmail, code);

            const payload = {
                error: "Please verify your email before logging in. A new code has been sent.",
                isNotVerified: true,
                email: normalizedEmail
            };

            if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
                payload.debugCode = code;
            }

            return res.status(403).json(payload);
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });

        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isUnlimited: user.isUnlimited
            }
        });

    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ error: "Internal server error during login." });
    }
});

// Resend OTP Route
router.post("/resend-code", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Missing email." });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "User is already verified." });
        }

        const code = generateOTP();
        user.verificationCode = code;
        user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendVerificationEmail(normalizedEmail, code);

        const payload = {
            message: "Verification code resent successfully.",
            email: normalizedEmail
        };

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            payload.debugCode = code;
        }

        return res.status(200).json(payload);

    } catch (err) {
        console.error("Resend OTP Error:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
});

// Delete Account Route
router.delete("/delete-account", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        // Delete all chat threads associated with the user
        await Thread.deleteMany({ userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        return res.status(200).json({ success: "Account and associated data deleted successfully." });
    } catch (err) {
        console.error("Delete Account Error:", err);
        return res.status(500).json({ error: "Internal server error during account deletion." });
    }
});

export default router;
