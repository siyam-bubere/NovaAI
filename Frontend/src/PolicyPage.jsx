import React, { useState } from "react";
import "./PolicyPage.css";
import logow from "./assets/logow.png";

function PolicyPage({ onNavigate, initialTab }) {
    const [activeTab, setActiveTab] = useState(initialTab || "terms");

    return (
        <div className="policy-page-container">
            <header className="policy-header">
                <div className="policy-logo-container" onClick={() => onNavigate("landing")}>
                    <img src={logow} alt="NovaAI Logo" className="policy-logo" />
                    <span className="brand-geist-pixel policy-brand-name">Nova AI</span>
                </div>
                <button className="policy-back-btn" onClick={() => onNavigate("landing")}>
                    <i className="fa-solid fa-arrow-left"></i> Back to Home
                </button>
            </header>

            <main className="policy-main">
                <div className="policy-tabs">
                    <button 
                        className={`policy-tab-btn ${activeTab === "terms" ? "active" : ""}`}
                        onClick={() => setActiveTab("terms")}
                    >
                        Terms of Service
                    </button>
                    <button 
                        className={`policy-tab-btn ${activeTab === "privacy" ? "active" : ""}`}
                        onClick={() => setActiveTab("privacy")}
                    >
                        Privacy Policy
                    </button>
                </div>

                <div className="policy-card">
                    {activeTab === "terms" ? (
                        <div className="policy-content">
                            <h1>Terms of Service</h1>
                            <p className="last-updated">Last Updated: July 17, 2026</p>

                            <section>
                                <h2>1. Acceptance of Terms</h2>
                                <p>By accessing or using NovaAI, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.</p>
                            </section>

                            <section>
                                <h2>2. Account Registration</h2>
                                <p>To use NovaAI, you must register for an account using email verification. You agree to provide accurate information and keep your credentials secure. You are responsible for all activities under your account.</p>
                            </section>

                            <section>
                                <h2>3. Free Tier Usage & Rate Limits</h2>
                                <p>NovaAI is currently in a development phase. Free accounts are limited to generating <strong>one (1) AI response per day</strong>. Attempts to bypass this rate limit through scripting, multiple accounts, or other exploits may result in suspension.</p>
                            </section>

                            <section>
                                <h2>4. Permitted Use</h2>
                                <p>You may use NovaAI for personal, educational, or professional purposes. You agree not to use the service to generate harmful, illegal, abusive, or copyright-infringing content.</p>
                            </section>

                            <section>
                                <h2>5. Limitation of Liability</h2>
                                <p>NovaAI is provided "as is" without warranties of any kind. Since the project is in active development, we do not guarantee uninterrupted service or accuracy of AI-generated responses.</p>
                            </section>
                        </div>
                    ) : (
                        <div className="policy-content">
                            <h1>Privacy Policy</h1>
                            <p className="last-updated">Last Updated: July 17, 2026</p>

                            <section>
                                <h2>1. Information We Collect</h2>
                                <p>We collect minimal information to provide our services:</p>
                                <ul>
                                    <li><strong>Account Info:</strong> Your name, verified email address, and encrypted password.</li>
                                    <li><strong>Chat History:</strong> Message logs sent within chat threads so you can view your recents history.</li>
                                    <li><strong>Usage Metrics:</strong> Date and count of chats generated to enforce the daily free limit.</li>
                                </ul>
                            </section>

                            <section>
                                <h2>2. How We Use Information</h2>
                                <p>We use your data strictly to secure your profile, authenticate your access, display your persistent chat history, and monitor rate limit thresholds.</p>
                            </section>

                            <section>
                                <h2>3. Data Protection</h2>
                                <p>Your passwords are securely encrypted using industry-standard hashing algorithms (bcryptjs). We do not share your private account info, email, or chat transcripts with any third-party advertisers.</p>
                            </section>

                            <section>
                                <h2>4. Third-Party Services</h2>
                                <p>NovaAI forwards chat prompts to Google Gemini API models to generate responses. No personally identifying information (such as your email or password) is shared with Google API endpoints.</p>
                            </section>

                            <section>
                                <h2>5. Cookies & Local Storage</h2>
                                <p>We use local browser storage to save your session token (JWT) and color theme settings so you remain logged in and your settings are preserved across page refreshes.</p>
                            </section>
                        </div>
                    )}
                </div>
            </main>

            <footer className="policy-footer">
                <p>&copy; {new Date().getFullYear()} Nova AI. Created by Siyam Bubere. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default PolicyPage;
