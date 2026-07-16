import React from "react";
import "./LandingPage.css";

function LandingPage({ onNavigate, theme, onToggleTheme }) {
    return (
        <div className="landing-container">
            <header className="landing-header">
                <div className="landing-logo-container">
                    <img src="src/assets/logow.png" alt="NovaAI Logo" className="landing-logo" />
                    <span className="brand-geist-pixel landing-brand-name">Nova AI</span>
                </div>
                <div className="landing-header-actions">
                    <button 
                        className="theme-toggle-btn" 
                        onClick={onToggleTheme} 
                        title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                    >
                        {theme === "dark" ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
                    </button>
                    <button className="nav-link-btn" onClick={() => onNavigate("auth", { tab: "login" })}>Sign In</button>
                    <button className="cta-btn-sm" onClick={() => onNavigate("auth", { tab: "register" })}>Get Started</button>
                </div>
            </header>

            <main className="landing-main">
                <section className="hero-section">
                    <div className="hero-glow"></div>
                    <h1 className="hero-title">
                        Experience the Future of Intelligence with <span className="brand-geist-pixel brand-glow">Nova AI</span>
                    </h1>
                    <p className="hero-subtitle">
                        A minimal, lightning-fast AI companion designed to streamline your workflows, write code, and answer complex queries with ease.
                    </p>
                    <div className="hero-ctas">
                        <button className="cta-btn-lg" onClick={() => onNavigate("auth", { tab: "register" })}>
                            Start Chatting Free <i className="fa-solid fa-arrow-right"></i>
                        </button>
                        <button className="secondary-btn-lg" onClick={() => onNavigate("auth", { tab: "login" })}>
                            Access Existing Profile
                        </button>
                    </div>
                </section>

                <section className="features-section">
                    <h2 className="section-heading">Engineered for Elegance & Efficiency</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon"><i className="fa-solid fa-bolt"></i></div>
                            <h3>Instant Responses</h3>
                            <p>Powered by the latest Gemini 2.5 models for rapid, context-aware answers.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><i className="fa-solid fa-history"></i></div>
                            <h3>Persistent Threads</h3>
                            <p>Organize your thoughts into distinct, renameable, and deletable sessions.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><i className="fa-solid fa-palette"></i></div>
                            <h3>Light & Dark Themes</h3>
                            <p>A beautifully curated color palette that adapts to your environment.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><i className="fa-solid fa-shield-halved"></i></div>
                            <h3>Rate-Limited Access</h3>
                            <p>Enjoy 1 response daily on our free tier, perfect for occasional questions during developer phase.</p>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="landing-footer">
                <div className="footer-top-grid">
                    <div className="footer-brand-col">
                        <div className="footer-logo-wrap">
                            <img src="src/assets/logow.png" alt="NovaAI Logo" className="footer-logo" />
                            <span className="brand-geist-pixel footer-brand-name">Nova AI</span>
                        </div>
                        <p className="footer-tagline">
                            Your lightning-fast AI companion designed to write code, solve problems, and boost your daily productivity.
                        </p>
                    </div>

                    <div className="footer-links-col">
                        <h4>Product</h4>
                        <ul>
                            <li><a href="#features" onClick={(e) => { e.preventDefault(); }}>Features</a></li>
                            <li><a href="#codex" onClick={(e) => { e.preventDefault(); }}>Codex Workspace</a></li>
                            <li><span className="link-disabled">Pricing (Coming Soon)</span></li>
                        </ul>
                    </div>

                    <div className="footer-links-col">
                        <h4>Legal</h4>
                        <ul>
                            <li><button onClick={() => onNavigate("policy", { tab: "terms" })}>Terms of Service</button></li>
                            <li><button onClick={() => onNavigate("policy", { tab: "privacy" })}>Privacy Policy</button></li>
                        </ul>
                    </div>

                    <div className="footer-links-col">
                        <h4>Socials</h4>
                        <div className="footer-social-icons">
                            <a href="https://github.com" target="_blank" rel="noreferrer" title="GitHub"><i className="fa-brands fa-github"></i></a>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" title="Twitter"><i className="fa-brands fa-x-twitter"></i></a>
                            <a href="https://discord.com" target="_blank" rel="noreferrer" title="Discord"><i className="fa-brands fa-discord"></i></a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Nova AI. Created by Siyam Bubere. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
