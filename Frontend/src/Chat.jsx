import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import { ScaleLoader } from "react-spinners";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Typewriter from "./Typewriter"; // ← Import the typewriter component here
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import "./Chat.css";

function Chat({ loading, onTypingDone }) {
    const { newChat, prevChats, reply, setIsTyping } = useContext(MyContext);

    const [typingText, setTypingText] = useState("");
    const [isTyping, setLocalIsTyping] = useState(false);
    const lastReply = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!reply || lastReply.current === reply) return;
        lastReply.current = reply;

        setTypingText("");
        setLocalIsTyping(true);
        setIsTyping(true);

        const words = reply.split(" ");
        let idx = 0;

        const interval = setInterval(() => {
            idx++;
            setTypingText(words.slice(0, idx).join(" "));
            if (idx >= words.length) {
                clearInterval(interval);
                setLocalIsTyping(false);
                setIsTyping(false);
                onTypingDone(reply);
            }
        }, 40);

        return () => clearInterval(interval);
    }, [reply]);

    useEffect(() => {
        if (loading) {
            setTypingText("");
            setLocalIsTyping(false);
            setIsTyping(false);
        }
    }, [loading]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prevChats, typingText, loading]);

    return (
        <div className="chatWrapper">

            {/* Welcome Screen Configuration */}
            {newChat && prevChats.length === 0 && (
                <div className="welcomeContainer">
                    <h1>What can I help with?</h1>
                    <br />
                    <h2 className="welcomeSubtext">
                        Ask me to <Typewriter />
                    </h2>
                </div>
            )}

            <div className="chats">
                {prevChats?.map((chat, idx) => (
                    <div
                        key={`msg-${idx}`}
                        className={chat.role === "user" ? "userDiv" : "geminiDiv"}
                    >
                        {chat.role === "user" ? (
                            <p className="userMessage">{chat.content}</p>
                        ) : (
                            <div className="geminiMessage">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeHighlight, rehypeKatex]}
                                >
                                    {chat.content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                ))}

                {isTyping && typingText && (
                    <div className="geminiDiv">
                        <div className="geminiMessage">
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeHighlight, rehypeKatex]}
                            >
                                {typingText}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="loadingBubble">
                        <ScaleLoader
                            color="#b4b4b4"
                            height={15}
                            width={3}
                            radius={2}
                            margin={2}
                        />
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    );
}

export default Chat;