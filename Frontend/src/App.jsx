import './App.css';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import LandingPage from './LandingPage.jsx';
import AuthPage from './AuthPage.jsx';
import PolicyPage from './PolicyPage.jsx';
import { MyContext } from "./MyContext.jsx";
import { useState } from 'react';
import { v1 as uuidv1 } from 'uuid';

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [isTyping, setIsTyping] = useState(false); 
  const [allThreads, setAllThreads] = useState([]);

  // Authentication & View State
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [view, setView] = useState(() => {
    return localStorage.getItem("token") ? "chat" : "landing";
  });
  const [authTab, setAuthTab] = useState("login"); // "login" or "register"
  const [policyTab, setPolicyTab] = useState("terms"); // "terms" or "privacy"

  // Mobile sidebar drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Theme settings
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      document.documentElement.setAttribute("data-theme", saved);
      return saved;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", initial);
    return initial;
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setView("chat");
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setView("landing");
    setPrompt("");
    setReply(null);
    setPrevChats([]);
    setAllThreads([]);
    setCurrThreadId(uuidv1());
    setNewChat(true);
    setMobileSidebarOpen(false);
  };

  const handleNavigate = (targetView, options = {}) => {
    setView(targetView);
    if (options.tab) {
      if (targetView === "auth") {
        setAuthTab(options.tab);
      } else if (targetView === "policy") {
        setPolicyTab(options.tab);
      }
    }
  };

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    prevChats, setPrevChats,
    newChat, setNewChat,
    isTyping, setIsTyping,
    allThreads, setAllThreads,
    token, setToken,
    user, setUser,
    view, setView,
    authTab, setAuthTab,
    policyTab, setPolicyTab,
    mobileSidebarOpen, setMobileSidebarOpen,
    theme, setTheme,
    handleToggleTheme,
    logout
  };

  if (view === "landing") {
    return (
      <LandingPage 
        onNavigate={handleNavigate} 
        theme={theme} 
        onToggleTheme={handleToggleTheme} 
      />
    );
  }

  if (view === "auth") {
    return (
      <AuthPage 
        onNavigate={handleNavigate} 
        initialTab={authTab} 
        onAuthSuccess={handleAuthSuccess} 
      />
    );
  }

  if (view === "policy") {
    return (
      <PolicyPage 
        onNavigate={handleNavigate} 
        initialTab={policyTab} 
      />
    );
  }

  return (
    <div className={`main ${mobileSidebarOpen ? "sidebar-mobile-open" : ""}`}>
      <MyContext.Provider value={providerValues}> 
        {mobileSidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)}></div>
        )}
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  );
}

export default App;