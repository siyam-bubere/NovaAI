import "./Sidebar.css";
// Add useState to your imports if it's not there
import { useContext, useEffect, useState } from 'react'; 
import { MyContext } from "./MyContext";
import { v1 as uuidv1 } from 'uuid';

function Sidebar() {

    const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats, prevChats} = useContext(MyContext);
    // Inside your Sidebar component:
    const [openMenuId, setOpenMenuId] = useState(null);
    
    const getAllThreads = async () => {

        try {
            const response = await fetch("http://localhost:8080/api/thread");
            const res = await response.json();
            // console.log(res);
            const filteredData =  res.map(thread => ({threadId: thread.threadId, title:  thread.title}));
            // console.log(filteredData);
            setAllThreads(filteredData);
        } catch(err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId, prevChats]);

    // Close dropdown when clicking anywhere outside
    useEffect(() => {
        const handleOutsideClick = () => setOpenMenuId(null);
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, []);

    const createNewChat = () => {
        console.log("called")
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThread = async (newThreadId) => {
        if (!newThreadId || typeof newThreadId === 'object') return; // Safety check

        setCurrThreadId(newThreadId);

        try {
            const response = await fetch(`http://localhost:8080/api/thread/${newThreadId}`);
            const res = await response.json();
            
            if (!response.ok) {
                console.error("Server error fetching thread:", res);
                return;
            }

            // Ensure we received an array before setting state
            setPrevChats(Array.isArray(res) ? res : []);
            setNewChat(false);
        } catch(err) {
            console.error("Network error fetching thread:", err);
        }
    };

    const deleteThread = async (threadId) => {

        try {
            const response = fetch(`http://localhost:8080/api/thread/${threadId}`, {method: "DELETE"});
            const data = (await response).json();

            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if(threadId === currThreadId) {
                createNewChat();
            }
        } catch(err) {
            console.log(err);
        }
    }

    const [isSpinning, setIsSpinning] = useState(false);

    const handleLogoTouch = () => {
        // Prevent overlapping animations if clicked multiple times rapidly
        if (!isSpinning) {
            setIsSpinning(true);
        }
    };


    return (
        <section className="sidebar">
            {/* Top Branding & Main Action */}
            <div className="sidebar-top">
                <div className="brand-header">
                    <img 
                        src="src/assets/logow.png" 
                        alt="NovaAI Logo" 
                        className={`logo ${isSpinning ? 'spin-once' : ''}`} 
                        onMouseEnter={() => {
                            if (!isSpinning) setIsSpinning(true);
                        }}
                        onAnimationEnd={() => setIsSpinning(false)} // Resets so it can spin on the next hover
                    />
                    <button className="close-btn"><i className="fa-solid fa-xmark"></i></button>
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
                                            e.stopPropagation(); // Prevents switching the thread
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
                                                    console.log("Rename thread:", thread.threadId);
                                                    setOpenMenuId(null);
                                                    // TODO: Add rename modal or prompt logic here
                                                }}
                                            >
                                                <i className="fa-solid fa-pen"></i> Rename
                                            </button>
                                            <button 
                                                className="dropdown-item delete-btn"
                                                onClick={() => {
                                                    console.log("Delete thread:", thread.threadId);
                                                    setOpenMenuId(null);
                                                    deleteThread(thread.threadId);
                                                    // TODO: Add backend delete fetch request here
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
                    <div className="avatar">SI</div>
                    <div className="profile-info">
                        <span className="username">Siyambubere</span>
                        <span className="tier">Free</span>
                    </div>
                </div>
                <button className="upgrade-btn">Upgrade</button>
            </div>
        </section>
    );
}

export default Sidebar;