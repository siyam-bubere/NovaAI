import express from "express";
import Thread from "../models/Thread.js";
import getGeminiResponse from "../utils/gemini.js"
import authMiddleware from "../utils/authMiddleware.js";

const router = express.Router();

router.get("/thread", authMiddleware, async (req, res) => {
    try {
        const threads = await Thread.find({ userId: req.user._id }).sort({updatedAt: -1});
        res.json(threads);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Failed to fetch threads."})
    }
});

router.get("/thread/:threadId", authMiddleware, async (req, res) => {
    const {threadId} = req.params;

    try {
        const thread = await Thread.findOne({ threadId, userId: req.user._id });

        if(!thread) {
            return res.status(404).json({error: "Thread not found"});
        }

        res.json(thread.messages);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Failed to fetch chat"});
    }
});

router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
    const {threadId} = req.params;

    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId, userId: req.user._id });

        if(!deletedThread) {
            return res.status(404).json({error: "Thread not found"});
        }

        res.status(200).json({success: "Thread deleted successfully"})

    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Failed to delete thread"});
    }
});

router.post("/chat", authMiddleware, async (req, res) => {
    const {threadId, message} = req.body;

    if(!threadId || !message) {
        return res.status(400).json({error: "missing required fields."});
    }

    const user = req.user;

    // Rate Limiting Check
    if (!user.isUnlimited) {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        if (user.lastChatDate === today) {
            if (user.chatsCountToday >= 1) {
                return res.status(403).json({
                    error: "Free tier is limited to 1 response per day. Upgrade plan coming soon!"
                });
            }
        }
    }

    try {
        let thread = await Thread.findOne({ threadId, userId: user._id });

        if(!thread) {
            thread = new Thread({
                threadId,
                userId: user._id,
                title: message,
                messages: [{role: "user", content: message}]
            });
        } else {
            thread.messages.push({role: "user", content: message});
        }

        const assistantReply = await getGeminiResponse(message);

        thread.messages.push({role: "assistant", content: assistantReply});
        thread.updatedAt = new Date();
        await thread.save();

        // Increment rate limit upon successful generation
        if (!user.isUnlimited) {
            const today = new Date().toISOString().split("T")[0];
            if (user.lastChatDate === today) {
                user.chatsCountToday += 1;
            } else {
                user.lastChatDate = today;
                user.chatsCountToday = 1;
            }
            await user.save();
        }

        res.json({reply: assistantReply});

    } catch (err) {
        console.error("Backend Error:", err.message);
        
        if (err.status === 429) {
            return res.status(429).json({ 
                error: "Rate limit exceeded. Please wait a moment before sending another prompt!" 
            });
        }

        return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
});

export default router;