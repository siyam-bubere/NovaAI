import { useState } from "react";
import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext } from "react";

function ChatWindow() {
    const { prompt, setPrompt, setReply, currThreadId, setNewChat, setPrevChats, isTyping } = useContext(MyContext); // ← pull isTyping
    const [loading, setLoading] = useState(false);

    const getREply = async () => {
        const userMessageContent = prompt.trim();
        if (!userMessageContent || loading || isTyping) return; // ← guard

        setLoading(true);
        setNewChat(false);
        setPrevChats(prev => [...prev, { role: "user", content: userMessageContent }]);
        setPrompt("");

        console.log("sending message: ", userMessageContent, " Thread Id : ", currThreadId);

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessageContent, threadId: currThreadId })
        };

        try {
            const response = await fetch("http://localhost:8080/api/chat", options);
            const data = await response.json();
            console.log("Backend response data:", data);

            if (data.reply) {
                setReply(data.reply);
            } else if (data.error) {
                console.error("Backend Error:", data.error);
                setPrevChats(prev => [...prev, { role: "assistant", content: "Error: " + data.error }]);
            }

        } catch (err) {
            console.error("Network / Server connection failed:", err);
            setPrevChats(prev => [...prev, { role: "assistant", content: "Failed to connect to server." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleTypingDone = (text) => {
        setPrevChats(prev => [...prev, { role: "assistant", content: text }]);
    };

    const isDisabled = loading || isTyping; // ← single flag for both states

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>NovaAI <i className="fa-solid fa-chevron-down"></i></span>
                <div className="userIconDiv">
                    <span><i className="fa-solid fa-user"></i></span>
                </div>
            </div>

            <div className="chatContentBody">
                <Chat loading={loading} onTypingDone={handleTypingDone} />
            </div>

            <div className="chatInput">
                <div className="userInput">
                    <input
                        type="text"
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && getREply()}
                        disabled={isDisabled} // ← use combined flag
                    />
                    <div
                        id="submit"
                        onClick={getREply}
                        className={isDisabled ? "submit-disabled" : "submit-active"} // ← use combined flag
                        style={{ pointerEvents: isDisabled ? "none" : "auto" }} // ← use combined flag
                    >
                        {loading || isTyping ? (
                            <i className="fa-solid fa-circle-notch animate-spin"></i>
                        ) : (
                            <i className="fa-solid fa-paper-plane"></i>
                        )}
                    </div>
                </div>
                <p className="info">NovaAI can make mistakes. Check important info.</p>
            </div>
        </div>
    );
}

export default ChatWindow;