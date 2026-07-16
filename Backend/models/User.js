import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        default: null
    },
    verificationCodeExpires: {
        type: Date,
        default: null
    },
    chatsCountToday: {
        type: Number,
        default: 0
    },
    lastChatDate: {
        type: String,
        default: null
    },
    isUnlimited: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
