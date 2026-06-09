import express from "express";
import 'dotenv/config';
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

app.use("/api", chatRoutes);



const connectDB = async () => {
    try {
        // console.log("Mongo URI:", process.env.MONGODB_URI);
        // console.log("Gemini exists:", !!process.env.GEMINI_API_KEY);

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to Database.");
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
