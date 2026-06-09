import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

// Initialize the client inside this module
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getGeminiResponse = async (message) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            config: {
                systemInstruction: "You are NovaAI, a helpful AI assistant. You were created by Siyam Bubere. Never refer to yourself as Gemini or mention Google.",
            },
            contents: message,
        });

        const reply = response.text;
        console.log("Gemini Response:", reply);

        // Just return the data object
        return reply;
    } catch (err) {
        console.error("Gemini API Error:", err);
        // Throw the error so the Express route can catch it and send a 500 status
        throw err; 
    }
};

export default getGeminiResponse;