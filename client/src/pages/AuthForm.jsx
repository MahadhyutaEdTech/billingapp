// src/views/AuthForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogin, handleSignup } from "../models/authModel";
import { toast, ToastContainer } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const sideImage = "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80";

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userName, setUserName] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [authCode, setAuthCode] = useState("");
    const navigate = useNavigate();

    const clearForm = () => {
        setPassword("");
        setUserName("");
        setEmail("");
        setError("");
        setMessage("");
        setShowPassword(false);
        setAuthCode("");
    };

    const toggleForm = () => {
        clearForm();
        toast.dismiss();
        setTimeout(() => {
            setIsLogin(!isLogin);
        }, 0);
    };

    const verifyAuthData = () => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');
        return userId && token;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            if (isLogin) {
                const success = await handleLogin(email, password, navigate, setError, setLoading);
                if (!success || !verifyAuthData()) {
                    throw new Error('Login failed or missing auth data');
                }
                toast.success('🎉 Successfully logged in!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    theme: "colored"
                });
            } else {
                const success = await handleSignup(userName, email, password, authCode, navigate, setMessage, setError);
                if (success) {
                    clearForm();
                    setIsLogin(true);
                    toast.success('✨ Account created successfully! Please login.', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        theme: "colored"
                    });
                }
            }
        } catch (err) {
            toast.error(err?.message || "Authentication failed", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored"
            });
            setError(err?.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f7fafd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
            <ToastContainer />
            <button
                style={{ position: 'absolute', top: 24, left: 24, padding: '8px 20px', background: '#2563eb', color: '#fff', borderRadius: 8, border: 'none', fontWeight: 600, boxShadow: '0 2px 8px rgba(37,99,235,0.08)', cursor: 'pointer' }}
                type="button"
                onClick={() => navigate("/home")}
            >
                Back
            </button>
            <div style={{
                width: '100%',
                maxWidth: 900,
                minHeight: 520,
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 4px 32px rgba(37,99,235,0.10)',
                display: 'flex',
                overflow: 'hidden',
                margin: '40px 0',
            }}>
                {/* Side image (hidden on mobile) */}
                <div className="authform-image" style={{
                    flex: 1.2,
                    background: `url(${sideImage}) center center/cover no-repeat`,
                    display: 'none',
                    minHeight: 400,
                }} />
                <style>{`
                  @media (min-width: 900px) {
                    .authform-image { display: block !important; }
                  }
                `}</style>
                {/* Form */}
                <div style={{ flex: 1, minWidth: 320, padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 28, color: '#2563eb', marginBottom: 16, letterSpacing: 1 }}>BillFlow</div>
                    <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24, color: '#1a2233' }}>{isLogin ? "Login" : "Signup"} to your account</h2>
                    <div style={{ display: 'flex', width: '100%', marginBottom: 24, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5eaf1', background: '#f7fafd', gap: 2 }}>
                        <button
                            onClick={toggleForm}
                            style={{ flex: 1, padding: '12px 0', fontWeight: 600, background: isLogin ? '#2563eb' : 'transparent', color: isLogin ? '#fff' : '#2563eb', border: 'none', cursor: isLogin ? 'default' : 'pointer', transition: 'all 0.2s' }}
                            type="button"
                            disabled={isLogin}
                        >
                            Login
                        </button>
                        <button
                            onClick={toggleForm}
                            style={{ flex: 1, padding: '12px 0', fontWeight: 600, background: !isLogin ? '#2563eb' : 'transparent', color: !isLogin ? '#fff' : '#2563eb', border: 'none', cursor: !isLogin ? 'default' : 'pointer', transition: 'all 0.2s' }}
                            type="button"
                            disabled={!isLogin}
                        >
                            Signup
                        </button>
                    </div>
                    <form style={{ width: '100%' }} onSubmit={handleSubmit}>
                        {!isLogin && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '14px 16px', marginBottom: 16, border: '1px solid #e5eaf1', borderRadius: 8, fontSize: 16, outline: 'none', background: '#f7fafd' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Authentication Code"
                                    value={authCode}
                                    onChange={e => setAuthCode(e.target.value)}
                                    autoComplete="off"
                                    required
                                    style={{ width: '100%', padding: '14px 16px', marginBottom: 16, border: '1px solid #e5eaf1', borderRadius: 8, fontSize: 16, outline: 'none', background: '#f7fafd' }}
                                />
                            </>
                        )}
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '14px 16px', marginBottom: 16, border: '1px solid #e5eaf1', borderRadius: 8, fontSize: 16, outline: 'none', background: '#f7fafd' }}
                        />
                        <div style={{ position: 'relative', marginBottom: 16 }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ width: '100%', padding: '14px 16px', border: '1px solid #e5eaf1', borderRadius: 8, fontSize: 16, outline: 'none', background: '#f7fafd', paddingRight: 44 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0 }}
                                tabIndex={-1}
                            >
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                        {error && <p style={{ color: '#e11d48', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>{error}</p>}
                        {message && <p style={{ color: '#059669', fontSize: 14, marginBottom: 8, textAlign: 'center' }}>{message}</p>}
                        <button
                            style={{ width: '100%', padding: '14px 0', marginTop: 4, background: '#2563eb', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, fontSize: 18, boxShadow: '0 2px 8px rgba(37,99,235,0.08)', cursor: 'pointer', transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (isLogin ? "Logging in..." : "Signing up...") : isLogin ? "Login" : "Signup"}
                        </button>
                    </form>
                    <p style={{ marginTop: 24, color: '#6b7280', fontSize: 15 }}>
                        {isLogin ? "Not a member?" : "Already have an account?"} {" "}
                        <span
                            onClick={toggleForm}
                            style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {isLogin ? "Signup now" : "Login here"}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;

