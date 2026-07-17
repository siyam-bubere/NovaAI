import "./Sidebar.css";
import { useContext, useEffect, useState } from 'react'; 
import { MyContext } from "./MyContext";
import { v1 as uuidv1 } from 'uuid';
import logow from "./assets/logow.png";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

function Sidebar() {
    const {
        allThreads, setAllThreads, 
        currThreadId, setNewChat, 
        setPrompt, setReply, 
        setCurrThreadId, setPrevChats, 
        prevChats, token, 
        user, theme, 
        handleToggleTheme, logout,
        setMobileSidebarOpen
    } = useContext(MyContext);
    
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isSpinning, setIsSpinning] = useState(false);
    
    // Modal states
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [deletingThreadId, setDeletingThreadId] = useState(null);
    const [renamingThreadId, setRenamingThreadId] = useState(null);
    const [renamingTitle, setRenamingTitle] = useState("");

    const renameThread = async () => {
        if (!renamingThreadId || !renamingTitle.trim()) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/thread/${renamingThreadId}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ title: renamingTitle.trim() })
            });

            if (response.ok) {
                setAllThreads(prev => prev.map(thread => 
                    thread.threadId === renamingThreadId 
                        ? { ...thread, title: renamingTitle.trim() } 
                        : thread
                ));
                if (renamingThreadId === currThreadId) {
                    setPrevChats(prev => [...prev]);
                }
            } else {
                console.error("Rename failed");
            }
        } catch(err) {
            console.error("Error renaming thread:", err);
        } finally {
            setRenamingThreadId(null);
            setRenamingTitle("");
        }
    };
    
    const getAllThreads = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${BACKEND_URL}/api/thread`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (response.ok && Array.isArray(res)) {
                const filteredData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));
                setAllThreads(filteredData);
            }
        } catch(err) {
            console.log("Error fetching threads:", err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId, prevChats, token]);

    // Close dropdown when clicking anywhere outside
    useEffect(() => {
        const handleOutsideClick = () => setOpenMenuId(null);
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, []);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setMobileSidebarOpen(false); // Close drawer on mobile upon starting chat
    };

    const changeThread = async (newThreadId) => {
        if (!newThreadId || typeof newThreadId === 'object') return; // Safety check

        setCurrThreadId(newThreadId);
        setMobileSidebarOpen(false); // Close drawer on mobile when switching chats

        try {
            const response = await fetch(`${BACKEND_URL}/api/thread/${newThreadId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            
            if (!response.ok) {
                console.error("Server error fetching thread:", res);
                return;
            }

            setPrevChats(Array.isArray(res) ? res : []);
            setNewChat(false);
        } catch(err) {
            console.error("Network error fetching thread:", err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/thread/${threadId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();

            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if(threadId === currThreadId) {
                createNewChat();
            }
        } catch(err) {
            console.log("Delete error:", err);
        }
    };

    // User initials generator
    const getInitials = () => {
        if (!user || !user.name) return "SI";
        const parts = user.name.trim().split(" ");
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <section className="sidebar">
            {/* Top Branding & Main Action */}
            <div className="sidebar-top">
                <div className="brand-header">
                    <div className="logo-brand-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                            src={logow} 
                            alt="NovaAI Logo" 
                            className={`logo ${isSpinning ? 'spin-once' : ''}`} 
                            onMouseEnter={() => {
                                if (!isSpinning) setIsSpinning(true);
                            }}
                            onAnimationEnd={() => setIsSpinning(false)}
                        />
                        <span className="brand-geist-pixel" style={{ fontSize: '18px', fontWeight: 'bold' }}>Nova AI</span>
                    </div>
                    <button className="close-btn" onClick={() => setMobileSidebarOpen(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <button className="new-chat-btn" onClick={createNewChat}>
                    <div className="btn-left">
                        <i className="fa-solid fa-pen-to-square"></i>
                        <span className="btn-text">New chat</span>
                    </div>
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="nav-links">
                <div className="nav-item"><i className="fa-solid fa-magnifying-glass"></i><span className="link-text">Search chats</span></div>
                <div className="nav-item"><i className="fa-solid fa-book-open"></i><span className="link-text">Library</span></div>
                <div className="nav-item"><i className="fa-solid fa-folder"></i><span className="link-text">Projects</span></div>
                <div className="nav-item"><i className="fa-solid fa-cubes"></i><span className="link-text">Apps</span></div>
                <div className="nav-item"><i className="fa-solid fa-terminal"></i><span className="link-text">Codex</span></div>
                <div className="nav-item"><i className="fa-solid fa-ellipsis"></i><span className="link-text">More</span></div>
            </nav>

            {/* Chat History Section */}
            <div className="history-section">
                <h3 className="section-title">Recents</h3>
                <ul className="history">
                    {
                        allThreads?.map((thread, idx) => (
                            <li 
                                key={idx} 
                                onClick={() => changeThread(thread.threadId)}
                                className={`history-item ${openMenuId === thread.threadId ? 'active-menu' : ''}`}
                            >
                                <span className="history-text">{thread.title}</span>
                                
                                {/* Menu Wrapper */}
                                <div className="thread-menu-container">
                                    <button 
                                        className="thread-menu-btn" 
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            setOpenMenuId(openMenuId === thread.threadId ? null : thread.threadId);
                                        }}
                                    >
                                        <i className="fa-solid fa-ellipsis-vertical"></i>
                                    </button>
                                    
                                    {/* Dropdown UI */}
                                    {openMenuId === thread.threadId && (
                                        <div className="thread-dropdown" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                className="dropdown-item"
                                                onClick={() => {
                                                    setOpenMenuId(null);
                                                    setRenamingThreadId(thread.threadId);
                                                    setRenamingTitle(thread.title);
                                                }}
                                            >
                                                <i className="fa-solid fa-pen"></i> Rename
                                            </button>
                                            <button 
                                                className="dropdown-item delete-btn"
                                                onClick={() => {
                                                    setOpenMenuId(null);
                                                    setDeletingThreadId(thread.threadId);
                                                }}
                                            >
                                                <i className="fa-solid fa-trash"></i> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))
                    }
                </ul>
            </div>

            {/* User Profile Card Footer */}
            <div className="sidebar-footer">
                <div className="profile-card">
                    <div className="avatar">{getInitials()}</div>
                    <div className="profile-info">
                        <span className="username" title={user?.name || "User"}>{user?.name || "User"}</span>
                        <span className="tier">{user?.isUnlimited ? "Unlimited" : "Free"}</span>
                    </div>
                </div>
                
                <div className="footer-actions">
                    <button 
                        className="footer-icon-btn" 
                        onClick={handleToggleTheme} 
                        title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                    >
                        {theme === "dark" ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
                    </button>
                    <button 
                        className="footer-icon-btn logout-btn" 
                        onClick={() => setShowLogoutConfirm(true)} 
                        title="Log Out"
                    >
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="sidebar-modal-overlay">
                    <div className="sidebar-modal">
                        <h3>Confirm Sign Out</h3>
                        <p>Are you sure you want to log out of your session?</p>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                            <button className="modal-btn confirm logout" onClick={() => {
                                setShowLogoutConfirm(false);
                                logout();
                            }}>Log Out</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingThreadId && (
                <div className="sidebar-modal-overlay">
                    <div className="sidebar-modal">
                        <h3>Delete Chat?</h3>
                        <p>This will permanently delete this conversation and all its messages. This cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setDeletingThreadId(null)}>Cancel</button>
                            <button className="modal-btn confirm delete" onClick={() => {
                                deleteThread(deletingThreadId);
                                setDeletingThreadId(null);
                            }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Input Modal */}
            {renamingThreadId && (
                <div className="sidebar-modal-overlay">
                    <div className="sidebar-modal">
                        <h3>Rename Chat</h3>
                        <input 
                            type="text" 
                            className="modal-input" 
                            value={renamingTitle}
                            onChange={(e) => setRenamingTitle(e.target.value)}
                            placeholder="Enter chat title..."
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") renameThread();
                                if (e.key === "Escape") {
                                    setRenamingThreadId(null);
                                    setRenamingTitle("");
                                }
                            }}
                        />
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => {
                                setRenamingThreadId(null);
                                setRenamingTitle("");
                            }}>Cancel</button>
                            <button className="modal-btn confirm rename" onClick={renameThread}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Sidebar;