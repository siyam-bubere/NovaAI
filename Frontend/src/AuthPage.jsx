import React, { useState, useEffect } from "react";
import "./AuthPage.css";
import logow from "./assets/logow.png";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

function AuthPage({ onNavigate, initialTab, onAuthSuccess }) {
    const [tab, setTab] = useState(initialTab || "login"); // "login" or "register" or "verify"
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    
    // States for status alerts
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Debug code returned from register response (mock SMTP helper)
    const [debugCode, setDebugCode] = useState("");

    useEffect(() => {
        setTab(initialTab || "login");
        setError("");
        setMessage("");
        setDebugCode("");
    }, [initialTab]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill out all fields.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.isNotVerified) {
                    setError(data.error);
                    setTab("verify");
                    setEmail(data.email);
                    if (data.debugCode) {
                        setDebugCode(data.debugCode);
                    }
                } else {
                    setError(data.error || "Login failed. Check your credentials.");
                }
                return;
            }

            // Success
            onAuthSuccess(data.token, data.user);
        } catch (err) {
            setError("Server connection failed. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill out all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Registration failed.");
                return;
            }

            // If registering Siyam Bubere, it auto-verifies and returns a token immediately!
            if (data.token) {
                onAuthSuccess(data.token, data.user);
                return;
            }

            // Normal user flow: transition to verify
            setMessage(data.message);
            setTab("verify");
            setEmail(data.email);
            if (data.debugCode) {
                setDebugCode(data.debugCode);
            }
        } catch (err) {
            setError("Server connection failed. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!verificationCode) {
            setError("Please enter the verification code.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: verificationCode })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Verification failed. Check code.");
                return;
            }

            onAuthSuccess(data.token, data.user);
        } catch (err) {
            setError("Server connection failed. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError("");
        setMessage("");
        setDebugCode("");

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/resend-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Resend failed.");
                return;
            }

            setMessage(data.message);
            if (data.debugCode) {
                setDebugCode(data.debugCode);
            }
        } catch (err) {
            setError("Server connection failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </div>

            <div className="auth-header-logo" onClick={() => onNavigate("landing")}>
                <img src={logow} alt="NovaAI Logo" className="auth-logo" />
                <span className="brand-geist-pixel auth-brand-name">Nova AI</span>
            </div>

            <div className="auth-card">
                {/* Tab switching navigation */}
                {tab !== "verify" && (
                    <div className="auth-tabs">
                        <button 
                            className={`auth-tab-btn ${tab === "login" ? "active" : ""}`}
                            onClick={() => { setTab("login"); setError(""); setMessage(""); }}
                        >
                            Sign In
                        </button>
                        <button 
                            className={`auth-tab-btn ${tab === "register" ? "active" : ""}`}
                            onClick={() => { setTab("register"); setError(""); setMessage(""); }}
                        >
                            Register
                        </button>
                    </div>
                )}

                {/* Status messages */}
                {error && <div className="auth-alert error-alert"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
                {message && <div className="auth-alert success-alert"><i className="fa-solid fa-circle-check"></i> {message}</div>}

                {/* Debug banner for local mock OTP */}
                {tab === "verify" && debugCode && (
                    <div className="auth-alert debug-alert">
                        <i className="fa-solid fa-bug"></i>
                        <div>
                            <strong>Dev Mode Code:</strong> Use <strong>{debugCode}</strong> to verify this account.
                        </div>
                    </div>
                )}

                {tab === "login" && (
                    <form className="auth-form" onSubmit={handleLogin}>
                        <h2>Welcome Back</h2>
                        <p className="form-sub">Sign in to continue your conversations.</p>
                        
                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="input-field-wrapper">
                                <i className="fa-solid fa-envelope"></i>
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-field-wrapper">
                                <i className="fa-solid fa-lock"></i>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button className="auth-submit-btn" type="submit" disabled={loading}>
                            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : "Sign In"}
                        </button>
                    </form>
                )}

                {tab === "register" && (
                    <form className="auth-form" onSubmit={handleRegister}>
                        <h2>Create Account</h2>
                        <p className="form-sub">Join NovaAI and start asking anything.</p>

                        <div className="input-group">
                            <label>Full Name</label>
                            <div className="input-field-wrapper">
                                <i className="fa-solid fa-user"></i>
                                <input 
                                    type="text" 
                                    placeholder="Enter your full name" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="input-field-wrapper">
                                <i className="fa-solid fa-envelope"></i>
                                <input 
                                    type="email" 
                                    placeholder="name@domain.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group-row">
                            <div className="input-group">
                                <label>Password</label>
                                <div className="input-field-wrapper">
                                    <i className="fa-solid fa-lock"></i>
                                    <input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="input-group">
                                <label>Confirm Password</label>
                                <div className="input-field-wrapper">
                                    <i className="fa-solid fa-circle-check"></i>
                                    <input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button className="auth-submit-btn" type="submit" disabled={loading}>
                            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : "Register"}
                        </button>
                    </form>
                )}

                {tab === "verify" && (
                    <form className="auth-form" onSubmit={handleVerify}>
                        <h2>Verify Your Email</h2>
                        <p className="form-sub">We've sent a 6-digit code to <strong>{email}</strong>.</p>

                        <div className="input-group">
                            <label>Verification Code</label>
                            <div className="input-field-wrapper">
                                <i className="fa-solid fa-key"></i>
                                <input 
                                    type="text" 
                                    maxLength="6"
                                    placeholder="Enter 6-digit OTP" 
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    required
                                    className="otp-input"
                                />
                            </div>
                        </div>

                        <button className="auth-submit-btn" type="submit" disabled={loading}>
                            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : "Verify Account"}
                        </button>

                        <div className="verify-actions">
                            <button type="button" className="text-action-btn" onClick={handleResendOTP} disabled={loading}>
                                Resend Verification Code
                            </button>
                            <button 
                                type="button" 
                                className="text-action-btn back-btn" 
                                onClick={() => { setTab("register"); setError(""); setMessage(""); }}
                            >
                                <i className="fa-solid fa-arrow-left-long"></i> Back to Registration
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default AuthPage;
