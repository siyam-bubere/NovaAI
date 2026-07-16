import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "novaai_secret_key_12345");
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ error: "Access denied. Invalid token user." });
        }

        if (!user.isVerified) {
            return res.status(403).json({ error: "Email not verified.", isNotVerified: true, email: user.email });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("JWT Verify Error:", err.message);
        return res.status(401).json({ error: "Invalid token." });
    }
};

export default authMiddleware;
