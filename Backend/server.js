import express from "express";
import 'dotenv/config';
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import User from "./models/User.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

const seedSiyamUser = async () => {
    try {
        const email = "siyam@novaai.com";
        const existing = await User.findOne({ email });
        if (!existing) {
            const hashedPassword = await bcrypt.hash("siyam123", 10);
            await User.create({
                name: "Siyam Bubere",
                email,
                password: hashedPassword,
                isVerified: true,
                isUnlimited: true
            });
            console.log("\n==================================================================");
            console.log("Seeded initial account Siyam Bubere: email 'siyam@novaai.com', password 'siyam123'");
            console.log("==================================================================\n");
        }
    } catch (err) {
        console.error("Failed to seed initial Siyam Bubere account:", err);
    }
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to Database.");
        await seedSiyamUser();
    } catch (err) {
        console.log("Failed to connect to DB", err);
        process.exit(1); //exit the process with failure
    }
}

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`server listening on port ${PORT}`);
    });
})
