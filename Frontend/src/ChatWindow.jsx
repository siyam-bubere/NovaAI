import { useState } from "react";
import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

function ChatWindow() {
    const { 
        prompt, setPrompt, 
        setReply, currThreadId, 
        setNewChat, setPrevChats, 
        isTyping, token, 
        user, setMobileSidebarOpen,
        logout
    } = useContext(MyContext);
    
    const [loading, setLoading] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/delete-account`, {
                method: "DELETE",
                headers: { 
                    "Authorization": `Bearer ${token}` 
                }
            });

            if (response.ok) {
                setShowDeleteUserConfirm(false);
                setShowProfileModal(false);
                logout();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to delete account.");
            }
        } catch (err) {
            console.error("Delete account error:", err);
            alert("Connection error. Could not delete account.");
        }
    };

    const getREply = async () => {
        const userMessageContent = prompt.trim();
        if (!userMessageContent || loading || isTyping) return;

        setLoading(true);
        setNewChat(false);
        setPrevChats(prev => [...prev, { role: "user", content: userMessageContent }]);
        setPrompt("");

        const options = {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ message: userMessageContent, threadId: currThreadId })
        };

        try {
            const response = await fetch(`${BACKEND_URL}/api/chat`, options);
            const data = await response.json();

            if (response.ok && data.reply) {
                setReply(data.reply);
            } else {
                const errorText = data.error || "Failed to generate response.";
                console.error("Backend Error:", errorText);
                setPrevChats(prev => [...prev, { role: "assistant", content: "Error: " + errorText }]);
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

    const getInitials = () => {
        if (!user || !user.name) return "U";
        const parts = user.name.trim().split(" ");
        if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const isDisabled = loading || isTyping;

    return (
        <div className="chatWindow">
            <div className="navbar">
                <div className="nav-left">
                    <button className="menu-toggle-btn" onClick={() => setMobileSidebarOpen(true)}>
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <span className="brand-geist-pixel">Nova AI</span>
                </div>
                <div className="userIconDiv" title={user?.name || "User"} onClick={() => setShowProfileModal(true)}>
                    <span>{getInitials()}</span>
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
                        disabled={isDisabled}
                    />
                    <div
                        id="submit"
                        onClick={getREply}
                        className={isDisabled ? "submit-disabled" : "submit-active"}
                        style={{ pointerEvents: isDisabled ? "none" : "auto" }}
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

            {/* User Profile Details Modal */}
            {showProfileModal && (
                <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="profile-modal-header">
                            <h3>User Profile</h3>
                            <button className="close-profile-btn" onClick={() => setShowProfileModal(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="profile-modal-body">
                            <div className="profile-avatar-large">
                                {getInitials()}
                            </div>
                            <div className="profile-details-list">
                                <div className="profile-detail-row">
                                    <span className="label">Name</span>
                                    <span className="value">{user?.name || "User"}</span>
                                </div>
                                <div className="profile-detail-row">
                                    <span className="label">Email</span>
                                    <span className="value">{user?.email || "N/A"}</span>
                                </div>
                                <div className="profile-detail-row">
                                    <span className="label">Account Status</span>
                                    <span className="value badge" style={{ backgroundColor: user?.isUnlimited ? "var(--accent)" : "#4b5563" }}>
                                        {user?.isUnlimited ? "Unlimited" : "Free"}
                                    </span>
                                </div>
                            </div>
                            
                            <button className="delete-account-trigger-btn" onClick={() => setShowDeleteUserConfirm(true)}>
                                <i className="fa-solid fa-trash-can"></i> Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Delete Confirmation Modal */}
            {showDeleteUserConfirm && (
                <div className="profile-modal-overlay alert-overlay" onClick={() => setShowDeleteUserConfirm(false)}>
                    <div className="profile-modal delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Warning: Delete Account?</h3>
                        <p>This action is <strong>irreversible</strong>. All your data, profile configuration, and chat conversations will be deleted forever.</p>
                        <div className="profile-modal-actions">
                            <button className="profile-modal-btn cancel" onClick={() => setShowDeleteUserConfirm(false)}>Cancel</button>
                            <button className="profile-modal-btn confirm delete" onClick={handleDeleteAccount}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatWindow;