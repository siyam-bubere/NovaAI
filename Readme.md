# Nova AI Project

A full-stack AI application structured as a monorepo, featuring an organized decoupled architecture with a dedicated backend API and a high-performance frontend interface.

---

## 📁 Project Structure

The repository is organized as a monorepo to keep the entire ecosystem synchronized in a single codebase:

```text
NovaAI/
├── Backend/             # Node.js / Express API
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions & utilities
│   └── server.js        # Entry point
├── Frontend/            # Client-side interface
│   ├── src/             # React/Vue/Frontend source components
│   ├── public/          # Static assets
│   └── vite.config.js   # Vite configuration
└── .gitignore           # Global workspace ignore rules


🛠️ Tech Stack
Frontend: Built using Vite for ultra-fast bundling and modern asset management, enforced with ESLint code styling rules.

Backend: Powered by Node.js and Express, utilizing structured routing, data modeling, and environmental configuration tracking.

🚀 Getting Started
1. Prerequisites
Ensure you have Node.js installed on your machine.

2. Installation
Clone the repository and install dependencies for both ecosystems:

Bash
# Clone the repository
git clone [https://github.com/siyam-bubere/NovaAI.git](https://github.com/siyam-bubere/NovaAI.git)
cd NovaAI

# Install Backend dependencies
cd Backend
npm install

# Install Frontend dependencies
cd ../Frontend
npm install
3. Environment Setup
Create a .env file inside the Backend/ directory and configure your essential API keys and environment variables:

Plaintext
PORT=5000
# Add your specific AI platform or database credentials here
4. Running the Application
To run the project locally, open two terminal windows or panes:

Start Backend: cd Backend && npm start (or node server.js)

Start Frontend: cd Frontend && npm run dev

🛑 Troubleshooting & Issue Log

1. The Fatal Bug: Array Destructuring instead of Object Destructuring (Line 7)
Look closely at how you are consuming your global context:

JavaScript
const [allThreads, setAllThreads, currThreadId] = useContext(MyContext); // ❌ WRONG
Why this is broken: In your App.jsx, you packed your provider values into a standard JavaScript Object (providerValues = { ... }). When extracting values from an object, you must use curly braces {} (object destructuring).

Using square brackets [] means you are attempting array destructuring. This maps variables purely by index order, meaning allThreads will actually grab whatever the first item in your App.jsx object is (which is prompt), making allThreads.map() crash because a string doesn't have a .map() function!

The Fix: Change the square brackets to curly braces:

JavaScript
const { allThreads, setAllThreads, currThreadId } = useContext(MyContext); //  CORRECT
2. The Key Prop Warning (Line 50)
In your Recents list rendering:

JavaScript
<li key={idx}><span className="history-text">{thread.title}</span></li>
Why this is bad practice: While passing idx stops React from shouting warnings in your console, using array indices as keys can cause weird UI glitching if your thread history list updates, sorts, or changes dynamically. Since your database threads already come back with a unique threadId, you should use that instead.

The Fix:

JavaScript
<li key={thread.threadId}><span className="history-text">{thread.title}</span></li>
📝 Updated README.md Section
Here is the highly specific Development Bugs & Troubleshooting markdown documentation ready to be appended to the bottom of your README.md file:

Markdown
### Issue 4: Application crash or undefined maps when consuming React Context in Sidebar
- **Symptom:** The console throws an error stating `allThreads.map is not a function` or values inside the Sidebar component are returning unexpected data structures.
- **Cause:** Incorrect context destructuring syntax. The global state was supplied from `App.jsx` as a structured Object, but `Sidebar.jsx` attempted to swallow the data using Array destructuring (`const [allThreads] = ...`), matching values by array indices instead of key names.
- **Solution:** Swapped array destructuring matching braces to object destructuring curly braces to map keys directly:
  ```javascript
  // Before (Broken)
  const [allThreads, setAllThreads, currThreadId] = useContext(MyContext);

  // After (Fixed)
  const { allThreads, setAllThreads, currThreadId } = useContext(MyContext);
Issue 5: Missing Keyframes for loading animations (animate-spin)
Symptom: When a network request hits an active state, the UI updates to show the standard font-awesome loading notch (fa-circle-notch), but the icon remains statically frozen on screen.

Cause: The project was built using standard CSS modules instead of Tailwind CSS utility classes, meaning the browser lacked an operational instruction set defining what animate-spin should do.

Solution: Appended explicit keyframe configurations directly to ChatWindow.css to govern linear rotation translation curves infinitely:

CSS
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
  display: inline-block;
}
Issue 6: UI Viewport Scroll Lockout during Response Stream Generation
Symptom: As the typewriter effect prints out lengthy AI responses or equations, the incoming text overflows past the bottom border of the window wrapper layout, forcing users to scroll manually to read the bot's outputs.

Cause: The viewport container heights are rigid, and the document lacks automated layout adjustment bindings to listen for structural changes inside the message log arrays.

Solution: Implemented the "Invisible Anchor Pattern" in Chat.jsx. Placed a blank referencing div at the absolute tail of the timeline grid layout and hooked it into a useEffect loop that watches array updates and character text inputs to pull the UI down smoothly:

JavaScript
const bottomRef = useRef(null);

useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [prevChats, typingText, loading]);
